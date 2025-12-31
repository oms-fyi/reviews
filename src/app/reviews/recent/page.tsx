import type { Metadata } from "next";

import { Review } from "src/components/review";
import { sanityClient } from "src/sanity/client";
import { RECENT_REVIEWS_QUERY } from "src/sanity/queries";

export const metadata: Metadata = {
  title: "Recent Reviews | OMSCentral",
};

export default async function Page() {
  const reviews = await sanityClient.fetch(RECENT_REVIEWS_QUERY);

  return (
    <section className="p-7">
      <h3 className="mb-10 text-center text-3xl font-medium text-gray-900">
        100 Most Recent Reviews
      </h3>
      <ul className="flex flex-col items-center gap-7">
        {reviews.map((review) => (
          <li key={review._id}>
            <Review
              createdAt={review._createdAt}
              author={review.authorId}
              difficulty={review.difficulty ?? 0}
              rating={review.rating ?? 0}
              workload={review.workload ?? 0}
              body={review.body ?? ""}
              course={review.course}
              semester={review.semester}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
