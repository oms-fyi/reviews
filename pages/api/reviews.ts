import type { NextApiRequest, NextApiResponse } from 'next';
import { withSentry, captureException } from '@sentry/nextjs';
import Joi from 'joi';

import { createReview, CreateReviewRequest } from 'src/sanity/api';
import { doesUserCodeMatch, CheckCodeResponse } from 'src/twilio';

type Payload = CreateReviewRequest & {
  code: string;
};

const schema = Joi.object<Payload>({
  semesterId: Joi.string().required().label('Semester'),
  courseId: Joi.string().required().label('Course'),
  rating: Joi.number().required().integer().min(1)
    .max(5)
    .label('Rating'),
  difficulty: Joi.number().required().integer().min(1)
    .max(5)
    .required()
    .label('Difficulty'),
  workload: Joi.number().required().integer().min(1)
    .max(100)
    .label('Workload'),
  body: Joi.string().required().label('Body'),
  username: Joi.string().required().label('Username'),
  code: Joi.string().required().length(6).label('Code')
    .messages({ 'string.length': 'Code must be exactly {#limit} digits' }),
});

type ResponseData = Record<string, never> | { errors: string[] };

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== 'POST') {
    // Method Not Allowed, only accepting POST.
    res.status(405).json({});
    return;
  }

  const validationOptions = { abortEarly: false, errors: { wrap: { label: '' } } };
  const { value: payload, error } = schema.validate(req.body, validationOptions);

  if (error) {
    // Bad Request, Schema Validation Error
    res.status(400).json({ errors: error.details.map((d) => d.message) });
    return;
  }

  const { username, code, ...review } = payload;

  try {
    const codeCheckResponseCode = await doesUserCodeMatch(username, code);

    if (codeCheckResponseCode === CheckCodeResponse.NOT_FOUND) {
      // Bad Request, Verification not found.
      res.status(400).json({
        errors: ['Code not found. Please request a new code.'],
      });
      return;
    }

    if (codeCheckResponseCode === CheckCodeResponse.NO_MATCH) {
      // Bad Request, Code doesn't match.
      res.status(400).json({
        errors: ['Code must match value that was sent via email.'],
      });
      return;
    }

    await createReview({ ...review, username });
    res.status(201).json({});
  } catch (err: unknown) {
    res.status(500).json({ errors: ['Error creating review. Try again later.'] });
    captureException(err);
  }
}

export default withSentry(handler);
