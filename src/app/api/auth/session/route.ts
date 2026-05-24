import { NextResponse } from "next/server";

import { getSession } from "src/lib/session";

export async function GET(): Promise<NextResponse> {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: { username: session.username } });
}
