import { useMemo } from "react";

import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";

import { PlusIcon } from "@heroicons/react/solid";
import { DocumentAddIcon } from "@heroicons/react/outline";

import type { Course, CourseWithReviewsFull } from "src/@types";
import { CourseEnrichmentOption, getCourse, getCourseSlugs } from "src/sanity";
import { average } from "src/stats";
import { formatNumber } from "src/utils";
import { ReviewList } from "src/components/review-list";
import Link from "next/link";

interface ReviewsPathParams {
  slug: Course["slug"];
  [key: string]: string | string[];
}

interface ReviewsPageProps {
  course: CourseWithReviewsFull;
}

export const getStaticPaths: GetStaticPaths<ReviewsPathParams> = async () => {
  const slugs = await getCourseSlugs();
  const paths = slugs.map(({ slug }) => ({
    params: { slug },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<
  ReviewsPageProps,
  ReviewsPathParams
> = async ({ params: { slug } = {} }) => {
  if (!slug) {
    throw new Error("No slug passed to `getStaticProps`");
  }

  const course = await getCourse(slug, CourseEnrichmentOption.REVIEWS);
  return { props: { course } };
};

export default function Reviews({
  course: { slug, name, reviews },
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
        <title>{`${name} | OMSCentral`}</title>
      </Head>
      {reviews.length === 0 ? (
        <main className="min-h-full max-w-2xl m-auto flex flex-col justify-center">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <DocumentAddIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No reviews
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by writing a review.
                </p>
                <div className="mt-6">
                  <Link href={`/reviews/new?course=${slug}`} passHref>
                    <a
                      href="replace"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <PlusIcon
                        className="-ml-1 mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                      New Review
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main className="max-w-2xl m-auto pb-5 bg-white my-10">
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
      )}
    </>
  );
}
