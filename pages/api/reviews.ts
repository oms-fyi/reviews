import type { NextApiRequest, NextApiResponse } from "next";

import Ajv, { ErrorObject, JSONSchemaType } from "ajv";
import keywords from "ajv-keywords";

import { createReview, CreateReviewRequest } from "../../lib/sanity/api";
import { doesUserCodeMatch } from "../../lib/twilio";

const ajv = new Ajv();
keywords(ajv, "range");

type Payload = CreateReviewRequest & {
  code: string;
};

const schema: JSONSchemaType<Payload> = {
  type: "object",
  properties: {
    courseId: { type: "string" },
    semesterId: { type: "string" },
    rating: { type: "number", range: [1, 5] },
    difficulty: { type: "number", range: [1, 5] },
    workload: { type: "number", range: [1, 100] },
    body: { type: "string" },
    username: { type: "string" },
    code: { type: "string" },
  },
  required: [],
};

const validate = ajv.compile(schema);

type ResponseData = {} | { errors: string[] };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    // Method Not Allowed, only accepting POST.
    res.status(405).json({});
  }

  const payload = req.body;
  const isValid = validate(payload);

  if (!isValid) {
    // Bad Request, fields missing or invalid.
    const errors = (validate.errors as ErrorObject[]).reduce<string[]>(
      (e, i) => (i.message ? [...e, i.message] : e),
      []
    );

    res.status(400).json({ errors });
    return;
  }

  const { username, code, ...review } = payload;

  try {
    const isVerificationSuccessful = await doesUserCodeMatch(username, code);

    if (!isVerificationSuccessful) {
      res.status(400).json({
        errors: ["The supplied code doesn't match the code that was sent."],
      });
      return;
    }

    createReview({ ...review, username });
  } catch (error: unknown) {
    res.status(500).json({ errors: ["Unknown error."] });
  }

  res.status(201).json({});
}
