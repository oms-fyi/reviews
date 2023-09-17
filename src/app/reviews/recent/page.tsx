import type { Metadata } from "next";

import { Review as ReviewComponent } from "src/components/review";
import { sanityClient } from "src/lib/sanity";
import type { Course, Review, Semester } from "src/types";

type Reviews = Array<
  Review & {
    course: Pick<Course, "name" | "slug">;
    semester: Semester;
  }
>;

async function getRecentReviews(): Promise<Reviews> {
  const query = `
    *[_type == 'review']{
      "id": _id,
      "created": _createdAt,
      ...,
      semester->,
      course-> {
        name,
        "slug": slug.current
      }
    } | order(_createdAt desc)[0...100]
  `;

  return await sanityClient.fetch<Reviews>(query);
}

export const metadata: Metadata = {
  title: "Recent reviews | oms.fyi",
};

export default async function Reviews(): Promise<JSX.Element> {
  const reviews = await getRecentReviews();

  return (
    <main className="m-auto max-w-7xl px-5 py-10">
      <h3 className="mb-10 text-center text-3xl font-medium text-gray-900">
        100 Most Recent Reviews
      </h3>
      <ul className="space-y-4 divide-gray-200">
        {reviews.map((review) => (
          <li key={review.id}>
            <ReviewComponent review={review} />
          </li>
        ))}
      </ul>
    </main>
  );
}
