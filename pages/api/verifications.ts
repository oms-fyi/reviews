import type { NextApiRequest, NextApiResponse } from "next";

import { createVerification } from "../../lib/twilio/api";

const TWILIO_VERIFY_ERROR_CODES = {
  INVALID_PARAMETER: 60200, // https://www.twilio.com/docs/api/errors/60200
  MAX_ATTEMPTS_REACHED: 60203, // https://www.twilio.com/docs/api/errors/60203
};

type ResponseData = {} | { error: string };
type Payload = {
  username?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    // Method Not Allowed, only accepting POST.
    res.status(405).json({});
  }

  const { username } = req.body as Payload;

  if (typeof username === "undefined") {
    res.status(400).json({ error: "GATech username required" });
    return;
  }

  try {
    await createVerification(username);
    res.status(201).json({});
  } catch (error: any) {
    switch (error.code) {
      case TWILIO_VERIFY_ERROR_CODES.INVALID_PARAMETER:
        res.status(400).json({
          error: `${username}@gatech.edu isn't a valid email`,
        });
        break;
      case TWILIO_VERIFY_ERROR_CODES.MAX_ATTEMPTS_REACHED:
        res.status(400).json({
          error: `Max send attempts reached. Please try again later.`,
        });
        break;
      default:
        res
          .status(500)
          .json({ error: `Unknown Error: ${(error as Error).message}` });
    }
  }
}
