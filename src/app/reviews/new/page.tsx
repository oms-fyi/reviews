import type { Metadata } from "next";

import { sanityClient } from "src/sanity/client";
import { COURSES_AND_RECENT_SEMESTERS_QUERY } from "src/sanity/queries";
import { Course, Semester } from "src/types";

import NewReviewForm from "./new-page";

type Props = {
  searchParams: Promise<{ course?: string }>;
};

export const metadata: Metadata = {
  title: "Add review | OMSCentral",
};

export default async function Page({ searchParams }: Props) {
  const { course } = await searchParams;
  const coursesAndSemesters = await sanityClient.fetch(
    COURSES_AND_RECENT_SEMESTERS_QUERY,
    {
      limit: 3,
    },
  );

  const courses = coursesAndSemesters.courses.filter(
    (course): course is Course => course.name !== null && course.slug !== null,
  );

  const semesters = coursesAndSemesters.semesters.filter(
    (semester): semester is Semester =>
      semester.startDate !== null && semester?.term !== null,
  );
  return (
    <NewReviewForm
      courses={courses}
      semesters={semesters}
      courseSlugFromParams={course}
    />
  );
}
