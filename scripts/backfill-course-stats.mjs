/**
 * One-time backfill of course review aggregates.
 * Usage: pnpm backfill:course-stats
 * Requires SANITY_API_WRITE_TOKEN and NEXT_PUBLIC_SANITY_* in .env.local
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, or SANITY_API_WRITE_TOKEN",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2025-02-06",
  useCdn: false,
});

const COURSE_IDS_QUERY = `*[_type == "course"]._id`;

const COURSE_STATS_QUERY = `{
  "reviewCount": count(*[_type == "review" && references($courseId)]),
  "rating": math::avg(*[_type == "review" && references($courseId)].rating),
  "difficulty": math::avg(*[_type == "review" && references($courseId)].difficulty),
  "workload": math::avg(*[_type == "review" && references($courseId)].workload)
}`;

async function recomputeCourseStats(courseId) {
  const stats = await client.fetch(COURSE_STATS_QUERY, { courseId });
  const reviewCount = stats.reviewCount ?? 0;

  if (reviewCount === 0) {
    await client
      .patch(courseId)
      .set({ reviewCount: 0 })
      .unset(["rating", "difficulty", "workload"])
      .commit();
    return;
  }

  await client
    .patch(courseId)
    .set({
      reviewCount,
      ...(stats.rating != null && { rating: stats.rating }),
      ...(stats.difficulty != null && { difficulty: stats.difficulty }),
      ...(stats.workload != null && { workload: stats.workload }),
    })
    .commit();
}

const courseIds = await client.fetch(COURSE_IDS_QUERY);
console.log(`Backfilling stats for ${courseIds.length} courses…`);

for (const courseId of courseIds) {
  await recomputeCourseStats(courseId);
  console.log(`  updated ${courseId}`);
}

console.log("Done.");
