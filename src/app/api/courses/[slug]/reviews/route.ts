import { NextResponse } from "next/server";

import { REVIEWS_PAGE_SIZE } from "src/lib/reviews-pagination";
import { sanityClient } from "src/sanity/client";
import { COURSE_REVIEWS_QUERY } from "src/sanity/queries";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

const MAX_LIMIT = 50;

export async function GET(req: Request, context: RouteContext) {
  const { slug } = await context.params;
  const { searchParams } = new URL(req.url);

  const offset = Math.max(0, Number.parseInt(searchParams.get("offset") ?? "0", 10) || 0);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.parseInt(searchParams.get("limit") ?? String(REVIEWS_PAGE_SIZE), 10) || REVIEWS_PAGE_SIZE),
  );
  const reviews = await sanityClient.fetch(COURSE_REVIEWS_QUERY, {
    slug,
    offset,
    end: offset + limit,
  });

  return NextResponse.json({ reviews, offset, limit });
}
