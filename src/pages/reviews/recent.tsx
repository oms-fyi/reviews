import type { GetStaticProps } from "next";
import Head from "next/head";

import type { Review, Semester, Course } from "src/@types";
import { getReviews } from "src/sanity/api";
import { ReviewList } from "src/components/review-list";

interface ReviewsPageProps {
  reviews: Array<
    Review & {
      course: Pick<Course, "name" | "code">;
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
      <main className="max-w-2xl m-auto pb-5 bg-white mt-10">
        <div className="py-5 px-6 bg-white border-b border-gray-200">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              100 Most Recent Reviews
            </h3>
          </div>
        </div>
        <ReviewList reviews={reviews} />
      </main>
    </>
  );
}
