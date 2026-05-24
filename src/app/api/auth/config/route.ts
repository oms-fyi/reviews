import { NextResponse } from "next/server";

import { isCasAuthEnabled } from "src/lib/crypto";

export function GET(): NextResponse {
  return NextResponse.json({ cas: isCasAuthEnabled() });
}
