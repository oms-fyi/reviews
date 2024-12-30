import type { NextApiRequest, NextApiResponse } from "next";

import { SendCodeResponse, sendCodeToUser } from "src/twilio/api";

type ResponseData = Record<string, never> | { error: string };
type Payload = { username?: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== "POST") {
    // Method Not Allowed, only accepting POST.
    res.status(405).json({});
    return;
  }

  const { username } = req.body as Payload;

  if (username === undefined) {
    res.status(400).json({ error: "GATech username required." });
    return;
  }

  const responseCode = await sendCodeToUser(username);

  if (responseCode === SendCodeResponse.SUCCESS) {
    res.status(201).json({});
  } else if (responseCode === SendCodeResponse.INVALID_EMAIL) {
    res
      .status(400)
      .json({ error: `${username} is not valid. Please try again.` });
  } else {
    res
      .status(400)
      .json({ error: "Too many send attempts. Please try again later." });
  }
}
