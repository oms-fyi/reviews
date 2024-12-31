import type { Metadata } from "next";

import { sanityClient } from "src/sanity/client";

import NewReviewForm, { NewReviewFormProps } from "./new-page";

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

  const { courses, semesters } = await sanityClient.fetch<NewReviewFormProps>(
    query,
    {
      limit: 3,
    },
  );

  return { courses, semesters };
}

export const metadata: Metadata = {
  title: "Add review | OMSCentral",
};

export default async function Page() {
  return <NewReviewForm {...await getCoursesAndSemesters()} />;
}
