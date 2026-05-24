import { defineQuery } from "groq";

import { sanityWriteClient } from "src/sanity/client";

export const COURSE_STATS_QUERY = defineQuery(`{
  "reviewCount": count(*[_type == "review" && references($courseId)]),
  "rating": math::avg(*[_type == "review" && references($courseId)].rating),
  "difficulty": math::avg(*[_type == "review" && references($courseId)].difficulty),
  "workload": math::avg(*[_type == "review" && references($courseId)].workload)
}`);

type CourseStats = {
  reviewCount: number;
  rating: number | null;
  difficulty: number | null;
  workload: number | null;
};

/** Recompute review aggregates on a course document from its reviews. */
export async function recomputeCourseStats(courseId: string): Promise<void> {
  const stats = await sanityWriteClient.fetch<CourseStats>(COURSE_STATS_QUERY, {
    courseId,
  });

  const reviewCount = stats.reviewCount ?? 0;

  if (reviewCount === 0) {
    await sanityWriteClient
      .patch(courseId)
      .set({ reviewCount: 0 })
      .unset(["rating", "difficulty", "workload"])
      .commit();

    return;
  }

  await sanityWriteClient
    .patch(courseId)
    .set({
      reviewCount,
      rating: stats.rating ?? undefined,
      difficulty: stats.difficulty ?? undefined,
      workload: stats.workload ?? undefined,
    })
    .commit();
}

const COURSE_ID_BY_SLUG_QUERY = defineQuery(`
*[_type == "course" && slug.current == $slug][0]._id
`);

/** Resolve a course document id from a slug, if needed for webhooks. */
export async function recomputeCourseStatsBySlug(slug: string): Promise<void> {
  const courseId = await sanityWriteClient.fetch<string | null>(
    COURSE_ID_BY_SLUG_QUERY,
    { slug },
  );

  if (courseId) {
    await recomputeCourseStats(courseId);
  }
}
