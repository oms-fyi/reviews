import { NextRequest, NextResponse } from "next/server";

import { verifyAndUpdateToken } from "./lib/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const requiredAuthentication = path === "/reviews/new";
  const loginPath = path === "/login" || path === "/sign-up";
  const developmentEndpoints = /\/api\/services\/*/.exec(path) !== null;
  const isDevelopment = process.env.NODE_ENV === "development";

  if (developmentEndpoints && !isDevelopment) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  const { response, isAuthenticated } = await verifyAndUpdateToken(
    request,
    NextResponse.redirect(new URL("/", request.nextUrl)),
  );

  if (
    (loginPath && isAuthenticated) ||
    (requiredAuthentication && !isAuthenticated)
  ) {
    return response;
  } else {
    const slug = new RegExp(/\/courses\/(.*)\/reviews/g).exec(path);

    if (slug) {
      const originalSlug = slug[1].toString();
      const upperSlug = originalSlug.toUpperCase();

      if (originalSlug !== upperSlug) {
        return NextResponse.redirect(
          new URL(`/courses/${upperSlug}/reviews`, request.nextUrl),
        );
      }
    }
  }
}

export const config = {
  matcher: [
    "/login",
    "/sign-up",
    "/api/services/:path*",
    "/reviews/new",
    "/api/reviews",
    "/courses/:slug/reviews",
  ],
};
