import Joi from "joi";
import { NextResponse } from "next/server";

import { encryptAuthorId, isCasAuthEnabled } from "src/lib/crypto";
import { getSession } from "src/lib/session";
import { recomputeCourseStats } from "src/sanity/course-stats";
import { sanityWriteClient } from "src/sanity/client";
import type { Course, Review, Semester } from "src/types";

type CreateReviewRequest = {
  rating: NonNullable<Review["rating"]>;
  difficulty: NonNullable<Review["difficulty"]>;
  workload: NonNullable<Review["workload"]>;
  body: Review["body"];
  courseId: Course["id"];
  semesterId: Semester["id"];
  username?: string;
};

type CreateReviewSanityRequest = Omit<
  CreateReviewRequest,
  "courseId" | "semesterId" | "username"
> & {
  course: { _ref: string };
  semester: { _ref: string };
} & {
  authorId: NonNullable<Review["authorId"]>;
};

type TwilioPayload = CreateReviewRequest & {
  username: string;
  code: string;
};

const twilioSchema = Joi.object<TwilioPayload>({
  semesterId: Joi.string().required().label("Semester"),
  courseId: Joi.string().required().label("Course"),
  rating: Joi.number().required().integer().min(1).max(5).label("Rating"),
  difficulty: Joi.number()
    .required()
    .integer()
    .min(1)
    .max(5)
    .required()
    .label("Difficulty"),
  workload: Joi.number().required().integer().min(1).max(100).label("Workload"),
  body: Joi.string().required().label("Body"),
  username: Joi.string().required().label("Username"),
  code: Joi.string()
    .required()
    .length(6)
    .label("Code")
    .messages({ "string.length": "Code must be exactly {#limit} digits" }),
});

const casSchema = Joi.object<CreateReviewRequest>({
  semesterId: Joi.string().required().label("Semester"),
  courseId: Joi.string().required().label("Course"),
  rating: Joi.number().required().integer().min(1).max(5).label("Rating"),
  difficulty: Joi.number()
    .required()
    .integer()
    .min(1)
    .max(5)
    .required()
    .label("Difficulty"),
  workload: Joi.number().required().integer().min(1).max(100).label("Workload"),
  body: Joi.string().required().label("Body"),
});

type ResponseData = Record<string, never> | { errors: string[] };

export async function POST(req: Request): Promise<NextResponse<ResponseData>> {
  const validationOptions = {
    abortEarly: false,
    errors: { wrap: { label: "" } },
  };

  const payload: unknown = await req.json();
  const useCas = isCasAuthEnabled();

  if (useCas) {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { errors: ["You must sign in before submitting a review."] },
        { status: 401 },
      );
    }

    const validationResult = casSchema.validate(payload, validationOptions);

    if (validationResult.error) {
      return NextResponse.json(
        { errors: validationResult.error.details.map((d) => d.message) },
        { status: 400 },
      );
    }

    const { courseId, semesterId, ...review } = validationResult.value;
    const authorId = encryptAuthorId(session.username);

    await sanityWriteClient.create<CreateReviewSanityRequest>({
      _type: "review",
      authorId,
      ...review,
      course: { _ref: courseId, _type: "reference" },
      semester: { _ref: semesterId, _type: "reference" },
    });

    await recomputeCourseStats(courseId);

    return NextResponse.json({}, { status: 201 });
  }

  const validationResult = twilioSchema.validate(payload, validationOptions);

  if (validationResult.error) {
    return NextResponse.json(
      { errors: validationResult.error.details.map((d) => d.message) },
      { status: 400 },
    );
  }

  const { username, code, courseId, semesterId, ...review } =
    validationResult.value;

  const { CheckCodeResponse, doesUserCodeMatch } = await import("src/twilio/api");
  const codeCheckResponseCode = await doesUserCodeMatch(username, code);

  if (codeCheckResponseCode === CheckCodeResponse.NOT_FOUND) {
    return NextResponse.json(
      { errors: ["Code not found. Please request a new code."] },
      { status: 400 },
    );
  }

  if (codeCheckResponseCode === CheckCodeResponse.NO_MATCH) {
    return NextResponse.json(
      { errors: ["Code must match value that was sent via email."] },
      { status: 400 },
    );
  }

  const authorId = encryptAuthorId(username);

  await sanityWriteClient.create<CreateReviewSanityRequest>({
    _type: "review",
    authorId,
    ...review,
    course: { _ref: courseId, _type: "reference" },
    semester: { _ref: semesterId, _type: "reference" },
  });

  await recomputeCourseStats(courseId);

  return NextResponse.json({}, { status: 201 });
}
