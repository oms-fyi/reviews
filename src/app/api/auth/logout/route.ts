import { NextResponse } from "next/server";

import { clearSessionCookieOptions } from "src/lib/session";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({});
  response.cookies.set(clearSessionCookieOptions());

  return response;
}
