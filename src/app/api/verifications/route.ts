import { captureException } from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

import { SendCodeResponse, sendCodeToUser } from "src/lib/twilio";

type ResponseData = Record<string, never> | { error: string };
type Payload = { username?: string };

export async function POST(
  req: NextRequest
): Promise<NextResponse<ResponseData>> {
  const { username } = req.body as Payload;

  if (username === undefined) {
    return NextResponse.json(
      { error: "GATech username required." },
      { status: 400 }
    );
  }

  try {
    const responseCode = await sendCodeToUser(username);

    if (responseCode === SendCodeResponse.SUCCESS) {
      return NextResponse.json({}, { status: 201 });
    } else if (responseCode === SendCodeResponse.INVALID_EMAIL) {
      return NextResponse.json(
        { error: `${username} is not valid. Please try again.` },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: "Too many send attempts. Please try again later." },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    captureException(error);

    return NextResponse.json(
      { error: "Error generating code. Try again later." },
      { status: 500 }
    );
  }
}
