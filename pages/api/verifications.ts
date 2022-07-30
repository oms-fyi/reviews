import type { NextApiRequest, NextApiResponse } from 'next';

import sendCodeToUser, { SendCodeResponse } from '../../lib/twilio/api';

type ResponseData = Record<string, never> | { error: string | number };
type Payload = {
  username?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== 'POST') {
    // Method Not Allowed, only accepting POST.
    res.status(405).json({});
  }

  const { username } = req.body as Payload;

  if (typeof username === 'undefined') {
    res.status(400).json({ error: 'GATech username required' });
    return;
  }

  try {
    const responseCode = await sendCodeToUser(username);

    if (responseCode === SendCodeResponse.SUCCESS) {
      res.status(201).json({});
    } else if (responseCode === SendCodeResponse.INVALID_EMAIL) {
      res.status(400).json({ error: 'Invalid username' });
    } else {
      res.status(400).json({ error: 'Too many send attempts' });
    }
  } catch (error: unknown) {
    res.status(500).json({ error: `Unknown error: ${String(error)}` });
  }
}
