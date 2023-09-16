import { SIGNATURE_HEADER_NAME, isValidSignature } from "@sanity/webhook";
import { captureException } from "@sentry/nextjs";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { Course } from "src/types";

const SECRET = process.env.SANITY_WEBHOOK_SECRET ?? "";

if (SECRET === "") {
  throw new Error("Cannot read Sanity Webhook Secret!");
}

type SanityWebhookPayload = {
  _type: "review";
  course: Pick<Course, "slug">;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const signature = req.headers.get(SIGNATURE_HEADER_NAME);

  if (!signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as SanityWebhookPayload;

    if (!isValidSignature(JSON.stringify(body), signature, SECRET)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    revalidatePath(`/courses/${body.course.slug}/reviews`);
    revalidatePath("/reviews/recent");
    revalidatePath("/");

    return NextResponse.json({ revalidated: true }, { status: 200 });
  } catch (error) {
    captureException(error);
    return NextResponse.json(
      { error: "Error revalidating. Try again later." },
      { status: 500 }
    );
  }
}
