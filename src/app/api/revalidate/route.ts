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
} | {
  _type: "course";
  slug: Course["slug"];
} | {
  _type: "semester";
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
  console.log(payload)

  if(payload._type === 'review') {
    revalidatePath(`/courses/${payload.course.slug}/reviews`);
    revalidatePath("/reviews/recent");
    revalidatePath("/");
  }
  
  if(payload._type === 'course') {
    revalidatePath(`/courses/${payload.slug}/reviews`);
    revalidatePath("/reviews/new");
    revalidatePath("/");
  }

  if(payload._type === 'semester') {
    revalidatePath("/reviews/new");
  }


  return NextResponse.json({}, { status: 200 });
}


