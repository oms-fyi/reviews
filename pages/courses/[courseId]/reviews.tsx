import { useMemo } from "react";
import format from "date-fns/format";
import { CalendarIcon, ArrowLeftIcon } from "@heroicons/react/outline";
import { Course, Review, HydratedCourse } from "../../../types";
import allCourses from "../../../data/courses.json";
import allReviews from "../../../data/reviews.json";
import Link from "next/link";

export const getStaticPaths = () => {
  const paths = allCourses.map(({ id: courseId }) => {
    return { params: { courseId } };
  });

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({
  params: { courseId },
}: {
  params: { courseId: string };
}) => {
  if (!Array.isArray(allReviews)) return { props: {} };

  const course = allCourses.find(({ id }) => id === courseId)!;

  const reviews = allReviews.filter(
    ({ course_id }): boolean => courseId === course_id
  );

  const hydratedCourse = hydrateCourseData(course, reviews);

  return { props: { reviews, course: hydratedCourse } };
};

const hydrateCourseData = (
  course: Course,
  reviews: Review[]
): HydratedCourse => {
  const hydrated = {
    ...course,
    reviewCount: 0,
    avg_difficulty: 0,
    avg_workload: 0,
    avg_rating: 0,
  };

  const reviewCount = reviews.length;

  if (!reviewCount) return hydrated;

  const difficulty = reviews.reduce((sum, cur) => sum + +cur.difficulty, 0);
  const rating = reviews.reduce((sum, cur) => sum + +cur.rating, 0);
  const workload = reviews.reduce((sum, cur) => sum + +cur.workload, 0);

  hydrated.avg_difficulty = difficulty / reviewCount;
  hydrated.avg_rating = rating / reviewCount;
  hydrated.avg_workload = workload / reviewCount;
  hydrated.reviewCount = reviewCount;

  return hydrated;
};

export default function Reviews({
  reviews,
  course,
}: {
  reviews: Review[];
  course: any;
}) {
  const mostRecent = useMemo(() => {
    return reviews.sort((a, b) => b.created - a.created);
  }, [reviews]);

  return (
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
            {course.name}
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
                {course.avg_rating.toFixed(2)} / 5
              </dd>
            </div>
            <div className="px-2 py-3 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-xs font-medium text-gray-500">
                <span className="hidden sm:inline">Average</span> Difficulty
              </dt>
              <dd className="mt-1 text-xs md:text-xl font-semibold text-gray-900">
                {course.avg_difficulty.toFixed(2)} / 5
              </dd>
            </div>
            <div className="px-2 py-3 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-xs font-medium text-gray-500">
                <span className="hidden sm:inline">Weekly</span> Workload
              </dt>
              <dd className="mt-1 text-xs md:text-xl font-semibold text-gray-900">
                {course.avg_workload.toFixed(2)} hours
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <ul role="list" className="divide-y px-6 divide-gray-200">
        {mostRecent.map((review) => (
          <li key={review.created} className="py-4">
            <p className="text-gray-500 mb-2 flex items-center uppercase text-xs">
              <CalendarIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              {format(new Date(+review.created), "MMMM dd, yyyy - p")}
            </p>
            <p className="break-words">{review.body}</p>
            <div className="py-2 flex flex-row gap-2 items-start">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Rating: {review.rating} / 5
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Difficulty: {review.difficulty} / 5
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {review.workload} hours / week
              </span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
