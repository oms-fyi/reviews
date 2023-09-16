import { Metadata } from "next";
import { notFound } from "next/navigation";

import { Review } from "src/components/review";
import { sanityClient } from "src/lib/sanity";
import type { Course, Semester, Review as TReview } from "src/types";

const PRERENDER_LIMIT = 100;

type ReviewPageProps = TReview & {
  semester: Semester;
  course?: Pick<Course, "name" | "slug">;
};

type Params = {
  id: TReview["id"];
};

export async function generateStaticParams(): Promise<Array<Params>> {
  const query = `
  *[_type == 'review'] {
      "id": _id
    }[0...$limit]
  `;

  return await sanityClient.fetch<Array<Params>>(query, {
    limit: PRERENDER_LIMIT,
  });
}

async function getReview(id: TReview["id"]): Promise<ReviewPageProps | null> {
  const query = `
    *[_type == 'review' && _id == $id]{
      "id": _id,
      "created": _createdAt,
      ...,
      course->{
        name,
        "slug": slug.current
      },
      semester->
    }[0]
  `;

  return await sanityClient.fetch<ReviewPageProps>(query, {
    id,
  });
}

export const metadata: Metadata = {
  title: "Review | oms.fyi",
};

export default async function Page({
  params: { id },
}: {
  params: Params;
}): Promise<JSX.Element> {
  const review = await getReview(id);

  if (!review) {
    notFound();
  }

  return <Review review={review} />;
}
