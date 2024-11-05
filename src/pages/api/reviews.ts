import Joi from "joi";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

// import crypto from "node:crypto";
import type { Course, Review } from "src/@types";
import InvalidToken from "src/lib/exceptions/InvalidToken";
import { getUserToken } from "src/lib/jwt";
import { connectToDatabase } from "src/lib/mongodb";

type CreateReviewRequest = {
  rating: NonNullable<Review["rating"]>;
  difficulty: NonNullable<Review["difficulty"]>;
  workload: NonNullable<Review["workload"]>;
  body: Review["body"];
  courseId: Course["_id"];
  usernameHash: string;
  term: NonNullable<Review["term"]>;
  date: NonNullable<Review["date"]>;
};

// type CreateReviewSanityRequest = Omit<
//   CreateReviewRequest,
//   "courseId" | "semesterId" | "username"
// > & {
//   course: { _ref: string };
//   semester: { _ref: string };
// } & {
//   authorId: NonNullable<Review["authorId"]>;
// };

const schema = Joi.object<CreateReviewRequest>({
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
  term: Joi.string().required().valid("spring", "fall").label("Term"),
  date: Joi.date().required().label("Date"),
  usernameHash: Joi.string().required().label("UsernameHash"),
});

type ResponseData = Record<string, never> | { errors: string[] };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== "POST") {
    // Method Not Allowed, only accepting POST.
    res.status(405).json({});
    return;
  }

  let formData = req.body;
  try {
    const { userToken } = await getUserToken(req.cookies.jwtToken as string);
    formData.usernameHash = userToken.usernameHash;
  } catch (error: any) {
    if (error instanceof InvalidToken) {
      res.setHeader("Set-Cookie", "jwtToken=; Path=/; Max-Age=0;");
    }
    res.status(401).json({});
    return;
  }

  formData.date = new Date().toISOString();
  formData.term = "fall";

  const validationOptions = {
    abortEarly: false,
    errors: { wrap: { label: "" } },
  };
  const validationResult = schema.validate(req.body, validationOptions);

  if (validationResult.error) {
    // Bad Request, Schema Validation Error
    res
      .status(400)
      .json({ errors: validationResult.error.details.map((d) => d.message) });
    return;
  }

  // eslint-disable-next-line no-unused-vars
  const { usernameHash, courseId, term, date, ...review } =
    validationResult.value;

  const authorId = usernameHash;

  const requestReview = {
    authorId: authorId,
    courseId: new ObjectId(courseId),
    term: term,
    date: date,
    body: review.body,
    rating: review.rating,
    difficulty: review.difficulty,
    workload: review.workload,
    created: new Date().toISOString(),
  };

  const { db } = await connectToDatabase();
  // IMPROVEMENT: Check for errors and return 500 if there are any.
  await db.collection("reviews").insertOne(requestReview);

  res.status(201).json({});
}
