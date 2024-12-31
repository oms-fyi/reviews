import Joi from "joi";
import { NextResponse } from "next/server";
import crypto from "node:crypto";

import { sanityClient } from "src/sanity/client";
import { CheckCodeResponse, doesUserCodeMatch } from "src/twilio/api";
import type { Course, Review, Semester } from "src/types";

type CreateReviewRequest = {
  rating: NonNullable<Review["rating"]>;
  difficulty: NonNullable<Review["difficulty"]>;
  workload: NonNullable<Review["workload"]>;
  body: Review["body"];
  courseId: Course["id"];
  semesterId: Semester["id"];
  username: string;
};

const KEY = process.env.ENCRYPTION_KEY;
const IV = "5183666c72eec9e4";

function encrypt(data: string): string {
  if (!KEY) throw new Error("Encryption key not found!");

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(KEY, "hex"),
    IV,
  );
  const encrypted = cipher.update(data, "utf8", "base64");

  return encrypted + cipher.final("base64");
}

type CreateReviewSanityRequest = Omit<
  CreateReviewRequest,
  "courseId" | "semesterId" | "username"
> & {
  course: { _ref: string };
  semester: { _ref: string };
} & {
  authorId: NonNullable<Review["authorId"]>;
};

type Payload = CreateReviewRequest & {
  code: string;
};

const schema = Joi.object<Payload>({
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

type ResponseData = Record<string, never> | { errors: string[] };

export async function POST(req: Request): Promise<NextResponse<ResponseData>> {
  const validationOptions = {
    abortEarly: false,
    errors: { wrap: { label: "" } },
  };

  const payload: unknown = await req.json();
  const validationResult = schema.validate(payload, validationOptions);

  if (validationResult.error) {
    // Bad Request, Schema Validation Error
    return NextResponse.json(
      { errors: validationResult.error.details.map((d) => d.message) },
      { status: 400 },
    );
  }

  const { username, code, courseId, semesterId, ...review } =
    validationResult.value;

  const codeCheckResponseCode = await doesUserCodeMatch(username, code);

  if (codeCheckResponseCode === CheckCodeResponse.NOT_FOUND) {
    // Bad Request, Verification not found.
    return NextResponse.json(
      {
        errors: ["Code not found. Please request a new code."],
      },
      { status: 400 },
    );
  }

  if (codeCheckResponseCode === CheckCodeResponse.NO_MATCH) {
    // Bad Request, Code doesn't match.
    return NextResponse.json(
      {
        errors: ["Code must match value that was sent via email."],
      },
      { status: 400 },
    );
  }

  const authorId = encrypt(username);

  const request = {
    _type: "review",
    authorId,
    ...review,
    course: {
      _ref: courseId,
      _type: "reference",
    },
    semester: {
      _ref: semesterId,
      _type: "reference",
    },
  };

  // Will throw ClientError if references are non-existent.
  // Will not catch at this time.
  await sanityClient.create<CreateReviewSanityRequest>(request);
  return NextResponse.json({}, { status: 201 });
}
