import type { NextApiRequest, NextApiResponse } from "next";

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

  res.status(200);
}
