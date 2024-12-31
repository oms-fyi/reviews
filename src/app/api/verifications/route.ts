import { NextResponse } from "next/server";

import { SendCodeResponse, sendCodeToUser } from "src/twilio/api";

type ResponseData = Record<string, never> | { error: string };
type Payload = { username?: string };

export async function POST(req: Request): Promise<NextResponse<ResponseData>> {
  const { username } = (await req.json()) as Payload;

  if (username === undefined) {
    return NextResponse.json(
      { error: "GATech username required." },
      { status: 400 },
    );
  }

  const responseCode = await sendCodeToUser(username);

  if (responseCode === SendCodeResponse.SUCCESS) {
    return NextResponse.json({}, { status: 201 });
  } else if (responseCode === SendCodeResponse.INVALID_EMAIL) {
    return NextResponse.json(
      { error: `${username} is not valid. Please try again.` },
      { status: 400 },
    );
  } else {
    return NextResponse.json(
      {
        error: "Too many send attempts. Please try again later.",
      },
      { status: 400 },
    );
  }
}
