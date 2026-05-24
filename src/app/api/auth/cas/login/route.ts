import { NextResponse } from "next/server";

import { CAS_RETURN_TO_COOKIE, getCasLoginUrl } from "src/lib/cas";

export function GET(req: Request): NextResponse {
  const { searchParams } = new URL(req.url);
  const returnTo = searchParams.get("returnTo") ?? "/reviews/mine";
  const loginUrl = getCasLoginUrl();

  const response = NextResponse.redirect(loginUrl);
  response.cookies.set({
    name: CAS_RETURN_TO_COOKIE,
    value: returnTo,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  return response;
}
