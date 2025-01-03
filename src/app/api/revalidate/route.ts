import { SIGNATURE_HEADER_NAME, isValidSignature } from "@sanity/webhook";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { Course } from "src/types";

const SECRET = process.env.SANITY_WEBHOOK_SECRET ?? "";

if (SECRET === "") {
  throw new Error("Cannot read Sanity Webhook Secret!");
}

type SanityWebhookPayload = {
  _type: "review";
  course: Pick<Course, "slug">;
};

export async function POST(req: Request) {
  const signature = req.headers.get(SIGNATURE_HEADER_NAME);

  if (typeof signature !== "string") {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = await req.text();

  if (!isValidSignature(body, signature, SECRET)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body) as SanityWebhookPayload;

  revalidatePath(`/courses/${payload.course.slug}/reviews`);
  revalidatePath("/reviews/recent");
  revalidatePath("/");

  return NextResponse.json({}, { status: 200 });
}
