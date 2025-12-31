import { notFound } from "next/navigation";

import { Review } from "src/components/review";
import { sanityClient } from "src/sanity/client";
import { REVIEW_IDS_QUERY, REVIEW_QUERY } from "src/sanity/queries";

const PRERENDER_LIMIT = 100;

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return await sanityClient.fetch(REVIEW_IDS_QUERY, {
    limit: PRERENDER_LIMIT,
  });
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const review = await sanityClient.fetch(REVIEW_QUERY, { id }); // WHAT IF WE FAIL HERE?

  if (review === null) {
    notFound();
  }

  return (
    <Review
      createdAt={review?._createdAt}
      author={review?.authorId}
      difficulty={review?.difficulty ?? 0}
      rating={review?.rating ?? 0}
      workload={review?.workload ?? 0}
      body={review?.body ?? ""}
      course={review?.course}
      semester={review?.semester}
    />
  );
}
