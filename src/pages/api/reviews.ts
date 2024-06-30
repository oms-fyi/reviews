import Joi from "joi";
import * as jose from "jose";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

// import crypto from "node:crypto";
import type { Course, Review, jwtPayload } from "src/@types";
import { connectToDatabase } from "src/lib/mongodb";

type CreateReviewRequest = {
  rating: NonNullable<Review["rating"]>;
  difficulty: NonNullable<Review["difficulty"]>;
  workload: NonNullable<Review["workload"]>;
  body: Review["body"];
  courseId: Course["_id"];
  username: string;
  term: NonNullable<Review["term"]>;
  date: NonNullable<Review["date"]>;
};

// const KEY = process.env.ENCRYPTION_KEY;
// const IV = "5183666c72eec9e4";

// function encrypt(data: string): string {
//   if (!KEY) throw new Error("Encryption key not found!");

//   const cipher = crypto.createCipheriv(
//     "aes-256-cbc",
//     Buffer.from(KEY, "hex"),
//     IV,
//   );
//   const encrypted = cipher.update(data, "utf8", "base64");

//   return encrypted + cipher.final("base64");
// }

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
  username: Joi.string().required().label("Username"),
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
  const secretToken: Uint8Array = new TextEncoder().encode(
    process.env.TOKEN_SECRET as string,
  );
  const jwtToken: string = req.cookies.jwtToken as string;
  let jwtData: jwtPayload;
  try {
    jwtData = (await jose.jwtVerify(jwtToken, secretToken))
      .payload as jwtPayload;
  } catch (error: any) {
    // Unauthorized, JWT Verification Error
    // IMPROVEMENT: perform the same generic operation as in the middleware
    res.status(401).json({});
    return;
  }

  formData.date = new Date().toISOString();
  formData.term = "fall";
  formData.username = jwtData.username;

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
  const { username, courseId, term, date, ...review } = validationResult.value;

  // const authorId = encrypt(username);
  const authorId = username;

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
