import Joi from "joi";
import { NextResponse } from "next/server";

import { encryptAuthorId } from "src/lib/crypto";
import { getSession } from "src/lib/session";
import { recomputeCourseStats } from "src/sanity/course-stats";
import { sanityClient, sanityWriteClient } from "src/sanity/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  difficulty: Joi.number().integer().min(1).max(5).required(),
  workload: Joi.number().integer().min(1).max(100).required(),
  body: Joi.string().required(),
});

export async function PATCH(
  req: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await context.params;
  const payload: unknown = await req.json();
  const validation = updateSchema.validate(payload, {
    abortEarly: false,
    errors: { wrap: { label: "" } },
  });

  if (validation.error) {
    return NextResponse.json(
      { errors: validation.error.details.map((d) => d.message) },
      { status: 400 },
    );
  }

  const existing = await sanityClient.fetch<{
    authorId: string | null;
    courseId: string | null;
  } | null>(`*[_type == "review" && _id == $id][0]{
    authorId,
    "courseId": course._ref
  }`, { id });

  if (!existing) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  const authorId = encryptAuthorId(session.username);

  if (existing.authorId !== authorId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await sanityWriteClient.patch(id).set(validation.value).commit();

  if (existing.courseId) {
    await recomputeCourseStats(existing.courseId);
  }

  return NextResponse.json({});
}
