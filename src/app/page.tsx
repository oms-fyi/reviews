import type { Metadata } from "next";

import { sanityClient } from "src/sanity/client";
import { COURSES_FOR_HOME_QUERY } from "src/sanity/queries";
import { Course } from "src/types";

import HomePage from "./home-page";

export const metadata: Metadata = {
  title: "Home | OMSCentral",
};

export default async function Page() {
  const apiResponse = await sanityClient.fetch(COURSES_FOR_HOME_QUERY);

  const courses = apiResponse.map((course) => {
    return {
      ...course,
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
      tags: course.tags ?? [],
      rating: course.rating ?? undefined,
      difficulty: course.difficulty ?? undefined,
      workload: course.workload ?? undefined,
      reviewCount: course.reviewCount ?? 0,
    };
  });

  return <HomePage courses={courses} />;
}
