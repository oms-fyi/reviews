import type { Metadata } from "next";

import { sanityClient } from "src/sanity/client";
import { GET_COURSES_WITH_REVIEWS_STATS_QUERY } from "src/sanity/queries";
import { Course } from "src/types";
import { average } from "src/util/math";

import HomePage from "./home-page";

export const metadata: Metadata = {
  title: "Home | OMSCentral",
};

export default async function Page() {
  const apiResponse = await sanityClient.fetch(
    GET_COURSES_WITH_REVIEWS_STATS_QUERY,
  );

  const courses = apiResponse.map(({ reviews, ...course }) => {
    return Object.assign(course, {
      slug: course.slug ?? "",
      codes: course.codes ?? [],
      name: course.name ?? "",
      textbooks: (course.textbooks ?? []).reduce<
        NonNullable<Course["textbooks"]>
      >(
        (acc, { name, url }) =>
          name === undefined || url === undefined
            ? acc
            : [...acc, { name, url }],
        [],
      ),
      creditHours: course.creditHours ?? 0,
      isFoundational: course.isFoundational ?? false,
      isDeprecated: course.isDeprecated ?? false,
      rating: average(reviews, "rating") || undefined,
      tags: course.tags ?? [],
      difficulty: average(reviews, "difficulty") || undefined,
      workload: average(reviews, "workload") || undefined,
      reviewCount: reviews.length,
    });
  });

  return <HomePage courses={courses} />;
}
