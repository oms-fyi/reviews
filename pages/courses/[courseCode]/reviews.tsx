import { useMemo } from "react";

import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";

import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

import format from "date-fns/format";
import { CalendarIcon, PencilAltIcon } from "@heroicons/react/outline";

import type { Course, CourseWithReviewsFull } from "../../../@types";
import {
  CourseEnrichmentOption,
  getCourse,
  getCourseCodes,
} from "../../../lib/sanity";
import average from "../../../lib/stats";

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
      <main className="max-w-3xl m-auto pb-5 bg-white mt-10">
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
                  {Number.isNaN(avgRating)
                    ? "N/A"
                    : `${avgRating.toFixed(2)} / 5`}
                </dd>
              </div>

              <div className="px-2 py-3 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-xs font-medium text-gray-500">
                  <span className="hidden sm:inline">Average</span> Difficulty
                </dt>
                <dd className="mt-1 text-xs md:text-xl font-semibold text-gray-900">
                  {Number.isNaN(avgDifficulty)
                    ? "N/A"
                    : `${avgDifficulty.toFixed(2)} / 5`}
                </dd>
              </div>
              <div className="px-2 py-3 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-xs font-medium text-gray-500">
                  <span className="hidden sm:inline">Average Weekly</span>{" "}
                  Workload
                </dt>
                <dd className="mt-1 text-xs md:text-xl font-semibold text-gray-900">
                  {Number.isNaN(avgWorkload)
                    ? "N/A"
                    : `${avgWorkload.toFixed(2)} hours`}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <ul className="divide-y px-6 divide-gray-200">
          {reviews.map(
            ({ id, created, body, rating, difficulty, workload, semester }) => (
              <li key={id} className="py-4">
                <div className="prose prose-sm">
                  <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                    {body}
                  </ReactMarkdown>
                </div>
                <div className="py-2 flex flex-row gap-2 items-start">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Rating: {rating ? `${rating} / 5` : "N/A"}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Difficulty: {difficulty ? `${difficulty} / 5` : "N/A"}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Workload: {workload ? `${workload} hours / week` : "N/A"}
                  </span>
                </div>
                {semester && (
                  <p className="text-gray-500 mt-2 flex items-center text-xs">
                    <CalendarIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                    <span className="capitalize">
                      Semester: {semester.term}{" "}
                      {new Date(semester.startDate).getFullYear()}
                    </span>
                  </p>
                )}
                <p className="text-gray-500 mt-2 flex items-center text-xs">
                  <PencilAltIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                  Review submitted: {format(new Date(created), "MMMM dd, yyyy")}
                </p>
              </li>
            )
          )}
        </ul>
      </main>
    </>
  );
}
