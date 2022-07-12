import type { NextPage, GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import Head from "next/head";

import format from "date-fns/format";
import {
  CalendarIcon,
  ArrowLeftIcon,
  PencilAltIcon,
} from "@heroicons/react/outline";

import type { Course, CourseWithReviews } from "../../../@types";
import { getCourseIds, getReviews } from "../../../lib/sanity";

interface ReviewsPathParams {
  courseId: Course["id"];
  [key: string]: any;
}

interface ReviewsPageProps {
  course: CourseWithReviews;
}

export const getStaticPaths: GetStaticPaths<ReviewsPathParams> = async () => {
  const courseIds = await getCourseIds();
  const paths = courseIds.map(({ id: courseId }) => ({ params: { courseId } }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<
  ReviewsPageProps,
  ReviewsPathParams
> = async ({ params: { courseId } = {} }) => {
  if (!courseId) {
    throw new Error("No courseId passed to `getStaticProps`");
  }

  const course = await getReviews(courseId);
  return { props: { course } };
};

const capitalize = (word: string): string => {
  return word[0].toUpperCase() + word.slice(1);
};

const Reviews: NextPage<ReviewsPageProps> = ({ course }) => {
  const { id, name, rating, difficulty, workload, reviews } = course;

  return (
    <>
      <Head>
        <title>{id} | OMSCentral</title>
      </Head>
      <main className="max-w-3xl m-auto pb-5 bg-white">
        <div className="sticky top-0 py-5 px-6 bg-white border-b border-gray-200">
          <Link href="/">
            <a className="text-indigo-600 text-xs md:text-sm hover:text-indigo-900 flex">
              <ArrowLeftIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              Home
            </a>
          </Link>
          <div className="sm:flex sm:items-center sm:justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {name}
            </h3>
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <button
                type="button"
                disabled
                // className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                className="inline-flex items-center px-4 py-2 border border-dotted border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-300 hover:blur-sm hover:cursor-not-allowed"
              >
                Add Review
              </button>
            </div>
          </div>
          <div>
            <dl className="mt-5 grid gap-5 grid-cols-3">
              <div className="px-2 py-3 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-xs font-medium text-gray-500">
                  <span className="hidden sm:inline">Average</span> Rating
                </dt>
                <dd className="mt-1 text-xs md:text-xl font-semibold text-gray-900">
                  {rating ? `${rating.toFixed(2)} / 5` : "N/A"}
                </dd>
              </div>

              <div className="px-2 py-3 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-xs font-medium text-gray-500">
                  <span className="hidden sm:inline">Average</span> Difficulty
                </dt>
                <dd className="mt-1 text-xs md:text-xl font-semibold text-gray-900">
                  {difficulty ? `${difficulty.toFixed(2)} / 5` : "N/A"}
                </dd>
              </div>
              <div className="px-2 py-3 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-xs font-medium text-gray-500">
                  <span className="hidden sm:inline">Average Weekly</span>{" "}
                  Workload
                </dt>
                <dd className="mt-1 text-xs md:text-xl font-semibold text-gray-900">
                  {workload ? `${workload.toFixed(2)} hours` : "N/A"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <ul role="list" className="divide-y px-6 divide-gray-200">
          {reviews.map(
            ({ created, body, rating, difficulty, workload, semester }) => (
              <li key={created} className="py-4">
                <p className="break-words">{body}</p>
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
                    Semester: {capitalize(semester.term)} {semester.year}
                  </p>
                )}
                <p className="text-gray-500 mt-2 flex items-center text-xs">
                  <PencilAltIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                  Review submitted: {format(
                    new Date(created),
                    "MMMM dd, yyyy"
                  )}{" "}
                </p>
              </li>
            )
          )}
        </ul>
      </main>
    </>
  );
};

export default Reviews;
