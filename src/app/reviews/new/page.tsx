import { Metadata } from "next";

import { sanityClient } from "src/lib/sanity";
import { Course, Semester } from "src/types";

import NewReviewForm from "./page-new";

interface NewReviewFormProps {
  courses: Pick<Course, "id" | "slug" | "name">[];
  semesters: Semester[];
}

async function getCoursesAndSemesters(): Promise<NewReviewFormProps> {
  const query = `{ 
    "courses": *[_type == 'course'] {
      "id": _id,
      "slug": slug.current,
      name
    } | order(name),
    "semesters" : *[_type == 'semester' && startDate <= now()]{
      "id": _id,
      ...
    } | order(startDate desc)[0...$limit]
  }`;

  return await sanityClient.fetch<NewReviewFormProps>(query, {
    limit: 3,
  });
}

export const metadata: Metadata = {
  title: "New review | oms.fyi",
};

export default async function Page(): Promise<JSX.Element> {
  const { courses, semesters } = await getCoursesAndSemesters();
  return <NewReviewForm courses={courses} semesters={semesters} />;
}
