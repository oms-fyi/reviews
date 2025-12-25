import type { Metadata } from "next";

import { Review as ReviewComponent } from "src/components/review";
import { sanityClient } from "src/sanity/client";
import type { Course, Review, Semester } from "src/types";

interface ReviewsPageProps {
  reviews: Array<
    Review & {
      course: Pick<Course, "name" | "slug">;
      semester: Semester;
    }
  >;
}

async function getRecentReviews(): Promise<ReviewsPageProps> {
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

  const reviews = await sanityClient.fetch<ReviewsPageProps["reviews"]>(query);

  return { reviews };
}

export const metadata: Metadata = {
  title: "Recent Reviews | OMSCentral",
};

export default async function Page() {
  const { reviews } = await getRecentReviews();

  return (
    <section className="m-auto max-w-7xl px-5 py-10">
      <h3 className="mb-10 text-center text-3xl font-medium text-gray-900 dark:text-gray-100">
        100 Most Recent Reviews
      </h3>
      <ul className="space-y-4 divide-gray-200">
        {reviews.map((review) => (
          <li key={review.id}>
            <ReviewComponent review={review} />
          </li>
        ))}
      </ul>
    </section>
  );
}
