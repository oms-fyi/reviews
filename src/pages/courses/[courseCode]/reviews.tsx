import { useMemo } from "react";

import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";

import type { Course, CourseWithReviewsFull } from "src/@types";
import { CourseEnrichmentOption, getCourse, getCourseCodes } from "src/sanity";
import { average } from "src/stats";
import { formatNumber } from "src/utils";
import { ReviewList } from "src/components/review-list";

interface ReviewsPathParams {
  courseCode: Course["code"];
  [key: string]: string | string[];
}

interface ReviewsPageProps {
  course: CourseWithReviewsFull;
}

export const getStaticPaths: GetStaticPaths<ReviewsPathParams> = async () => {
  const courseCodes = await getCourseCodes();
  const paths = courseCodes.map(({ code }) => ({
    params: { courseCode: code },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<
  ReviewsPageProps,
  ReviewsPathParams
> = async ({ params: { courseCode } = {} }) => {
  if (!courseCode) {
    throw new Error("No code passed to `getStaticProps`");
  }

  const course = await getCourse(courseCode, CourseEnrichmentOption.REVIEWS);
  return { props: { course } };
};

export default function Reviews({
  course: { code, name, reviews },
}: ReviewsPageProps): JSX.Element {
  const avgRating = useMemo(() => average(reviews, "rating"), [reviews]);
  const avgDifficulty = useMemo(
    () => average(reviews, "difficulty"),
    [reviews]
  );
  const avgWorkload = useMemo(() => average(reviews, "workload"), [reviews]);

  return (
    <>
      <Head>
        <title>{`${code} | OMSCentral`}</title>
      </Head>
      <main className="min-h-full max-w-2xl m-auto pb-5 bg-white my-10">
        <div className="sticky top-0 py-5 px-6 bg-white border-b border-gray-200">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {name}
            </h3>
          </div>
          <div>
            <dl className="mt-5 grid gap-5 grid-cols-3">
              <div className="px-2 py-3 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-xs font-medium text-gray-500">
                  <span className="hidden sm:inline">Average</span> Rating
                </dt>
                <dd className="mt-1 text-xs md:text-xl font-semibold text-gray-900">
                  {`${formatNumber(avgRating)} / 5`}
                </dd>
              </div>

              <div className="px-2 py-3 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-xs font-medium text-gray-500">
                  <span className="hidden sm:inline">Average</span> Difficulty
                </dt>
                <dd className="mt-1 text-xs md:text-xl font-semibold text-gray-900">
                  {`${formatNumber(avgDifficulty)} / 5`}
                </dd>
              </div>
              <div className="px-2 py-3 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-xs font-medium text-gray-500">
                  <span className="hidden sm:inline">Average Weekly</span>{" "}
                  Workload
                </dt>
                <dd className="mt-1 text-xs md:text-xl font-semibold text-gray-900">
                  {`${formatNumber(avgWorkload)} hours`}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <ReviewList reviews={reviews} />
      </main>
    </>
  );
}
