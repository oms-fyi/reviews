import type { GetStaticProps } from "next";
import Head from "next/head";

import type { Review, Semester, Course } from "src/@types";
import { getReviews } from "src/sanity/api";
import { ReviewList } from "src/components/review-list";

interface ReviewsPageProps {
  reviews: Array<
    Review & {
      course: Pick<Course, "name" | "slug">;
      semester: Semester;
    }
  >;
}

export const getStaticProps: GetStaticProps<ReviewsPageProps> = async () => {
  const reviews = await getReviews();
  return { props: { reviews } };
};

export default function Reviews({ reviews }: ReviewsPageProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Recent Reviews | OMSCentral</title>
      </Head>
      <main className="m-auto max-w-7xl px-5 py-10">
        <h3 className="text-3xl text-center mb-10 font-medium text-gray-900">
          100 Most Recent Reviews
        </h3>
        <ReviewList reviews={reviews} />
      </main>
    </>
  );
}
