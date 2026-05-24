import { NextResponse } from "next/server";

import { encryptAuthorId } from "src/lib/crypto";
import { getSession } from "src/lib/session";
import { sanityClient } from "src/sanity/client";
import { MY_REVIEWS_QUERY } from "src/sanity/queries";

export async function GET(): Promise<NextResponse> {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const authorId = encryptAuthorId(session.username);
  const reviews = await sanityClient.fetch(MY_REVIEWS_QUERY, { authorId });

  return NextResponse.json({ reviews });
}
