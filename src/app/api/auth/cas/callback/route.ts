import { NextResponse } from "next/server";

import { CAS_RETURN_TO_COOKIE, validateCasTicket } from "src/lib/cas";
import { getSessionCookieOptions, sealSession } from "src/lib/session";
import { cookies } from "next/headers";

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const ticket = searchParams.get("ticket");
  const cookieStore = await cookies();
  const returnTo =
    cookieStore.get(CAS_RETURN_TO_COOKIE)?.value ?? "/reviews/mine";

  if (!ticket) {
    return NextResponse.redirect(
      new URL("/reviews/mine?error=missing_ticket", req.url),
    );
  }

  const username = await validateCasTicket(ticket);

  if (!username) {
    return NextResponse.redirect(
      new URL("/reviews/mine?error=invalid_ticket", req.url),
    );
  }

  const response = NextResponse.redirect(new URL(returnTo, req.url));
  response.cookies.set(getSessionCookieOptions(sealSession({ username })));
  response.cookies.set({
    name: CAS_RETURN_TO_COOKIE,
    value: "",
    maxAge: 0,
    path: "/",
  });

  return response;
}
