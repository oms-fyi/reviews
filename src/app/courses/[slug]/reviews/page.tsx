import {
  BoltIcon,
  ClockIcon,
  DocumentPlusIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { Metadata } from "next";
import Link from "next/link";

import { Review } from "src/components/review";
import { sanityClient } from "src/sanity/client";
import {
  COURSE_REVIEWS_PAGE_METADATA_QUERY,
  COURSE_SLUGS_QUERY,
  COURSE_WITH_REVIEWS_QUERY,
} from "src/sanity/queries";
import { formatList, formatNumber } from "src/util/format";
import { average } from "src/util/math";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return await sanityClient.fetch(COURSE_SLUGS_QUERY);
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const course = await sanityClient.fetch(COURSE_REVIEWS_PAGE_METADATA_QUERY, {
    slug,
  });

  return {
    title: `${course?.name ?? "OMSCS Course"} | OMSCentral`,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  const course = await sanityClient.fetch(COURSE_WITH_REVIEWS_QUERY, { slug });
  const reviews = course?.reviews ?? [];

  const rating = average(reviews, "rating");
  const difficulty = average(reviews, "difficulty");
  const workload = average(reviews, "workload");

  const programAcronyms = course?.programs?.reduce<string[]>(
    (acc, { acronym }) => (acronym === null ? acc : [...acc, acronym]),
    [],
  );

  return (
    <section className="m-auto max-w-6xl px-5 py-10">
      <h3 className="mb-2 text-center text-3xl font-medium text-gray-900 lg:text-left">
        {course?.name}
      </h3>
      {reviews.length > 0 && (
        <div className="flex justify-center gap-2 lg:justify-start lg:gap-7">
          <span className="flex items-center gap-0 lg:gap-1">
            <StarIcon className="h-5 w-5 stroke-indigo-600" />
            {formatNumber(rating)} / 5 rating
          </span>
          <span className="flex items-center gap-0 lg:gap-1">
            <BoltIcon className="h-5 w-5 stroke-indigo-600" />
            {formatNumber(difficulty)} / 5 difficulty
          </span>
          <span className="flex items-center gap-0 lg:gap-1">
            <ClockIcon className="h-5 w-5 stroke-indigo-600" />
            {formatNumber(workload)} hrs / week
          </span>
        </div>
      )}
      <div className="mt-10 flex flex-col items-center gap-4 lg:flex-row lg:items-start">
        <div className="mx-auto max-w-xl grow bg-white shadow-sm sm:rounded-lg lg:sticky lg:top-4 lg:max-h-screen lg:overflow-y-auto">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Quick Facts and Resources
            </h3>
            <p className="mt-1 max-w-2xl text-xs text-gray-500">
              Something missing or incorrect?{" "}
              <a
                href={`https://github.com/oms-tech/reviews/issues/new?template=course-edit-request.md&title=[EDIT] ${course?.name}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Tell us more.
              </a>
            </p>
          </div>
          <div className="border-t border-gray-200 p-0 px-4 py-5">
            <dl className="divide-y divide-gray-200">
              <div className="grid grid-cols-3 gap-4 px-6 py-5">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="col-span-2 mt-0 text-sm text-gray-900">
                  {course?.name}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4 px-6 py-5">
                <dt className="text-sm font-medium text-gray-500">Listed As</dt>
                <dd className="col-span-2 mt-0 text-sm text-gray-900">
                  {formatList(course?.codes ?? [])}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4 px-6 py-5">
                <dt className="text-sm font-medium text-gray-500">
                  Credit Hours
                </dt>
                <dd className="col-span-2 mt-0 text-sm text-gray-900">
                  {course?.creditHours}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4 px-6 py-5">
                <dt className="text-sm font-medium text-gray-500">
                  Available to
                </dt>
                <dd className="col-span-2 mt-0 text-sm text-gray-900">
                  {formatList(programAcronyms ?? [])} students
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4 px-6 py-5">
                <dt className="text-sm font-medium text-gray-500">
                  Description
                </dt>
                <dd className="col-span-3 mt-0 text-sm text-gray-900 sm:col-span-2 lg:col-span-3">
                  {course?.description ?? "Course description not found."}{" "}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4 px-6 py-5">
                <dt className="text-sm font-medium text-gray-500">Syllabus</dt>
                <dd className="col-span-2 mt-0 text-sm text-gray-900">
                  {course?.syllabusUrl ? (
                    <a
                      href={course.syllabusUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Syllabus
                    </a>
                  ) : (
                    "Syllabus not found."
                  )}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4 px-6 py-5">
                <dt className="text-sm font-medium text-gray-500">Textbooks</dt>
                <dd
                  className={classNames("mt-0 text-sm text-gray-900", {
                    "col-span-3": course?.textbooks,
                    "col-span-2": !course?.textbooks,
                  })}
                >
                  {course?.textbooks ? (
                    <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
                      {course?.textbooks.map(({ name, url }) => (
                        <li
                          key={name}
                          className="flex items-center justify-between py-3 pr-4 pl-3 text-sm"
                        >
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="w-0 flex-1 truncate font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            {name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "No textbooks found."
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        {reviews.length > 0 ? (
          <ul className="flex flex-col gap-7">
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
        ) : (
          <div className="w-full max-w-xl grow bg-white px-4 py-2 shadow-sm sm:rounded-lg lg:max-w-full">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <DocumentPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No reviews
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by writing a review.
                </p>
                <div className="mt-6">
                  <Link
                    href={`/reviews/new?course=${slug}`}
                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white no-underline shadow-xs hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
                  >
                    <PlusIcon
                      className="mr-2 -ml-1 h-5 w-5"
                      aria-hidden="true"
                    />
                    New Review
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
