import {
  ClockIcon,
  DocumentAddIcon,
  LightningBoltIcon,
  StarIcon,
} from "@heroicons/react/outline";
import { PlusIcon } from "@heroicons/react/solid";
import classNames from "classnames";
import Link from "next/link";

import { Review as ReviewComponent } from "src/components/review";
import { sanityClient } from "src/sanity/client";
import type { Course, Program, Review, Semester } from "src/types";
import { formatList, formatNumber } from "src/util/format";
import { average } from "src/util/math";

export type CourseWithReviews = Course & {
  programs: Array<Pick<Program, "acronym">>;
  reviews: Array<Review & { semester: Semester }>;
};

export interface ReviewsPageProps {
  course: CourseWithReviews & {
    rating: number;
    difficulty: number;
    workload: number;
  };
}

export async function generateStaticParams() {
  const query = `
  *[_type == 'course'] {
      "slug": slug.current,
    }
  `;

  return await sanityClient.fetch<Array<Pick<Course, "slug">>>(query);
}

async function getCourseWithReviews(slug: string): Promise<ReviewsPageProps> {
  const query = `
    *[_type == 'course' && slug.current == $slug]{
      "id": _id,
      "created": _createdAt,
      ...,
      "slug": slug.current,
      "syllabusUrl": coalesce(syllabus.file.asset->url, syllabus.url),
      programs[]->{acronym},
      "reviews": *[_type == 'review' && references(^._id)]{
        "id": _id,
        "created": _createdAt,
        ...,
        "course": null,
        semester->
      } | order(created desc)
    }[0]
  `;

  const course = await sanityClient.fetch<CourseWithReviews>(query, { slug });

  const rating = average(course.reviews, "rating");
  const difficulty = average(course.reviews, "difficulty");
  const workload = average(course.reviews, "workload");

  return { course: { ...course, rating, difficulty, workload } };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const query = `
  *[_type == 'course' && slug.current == $slug] {
      name
    }[0]
  `;

  const course = await sanityClient.fetch<Pick<Course, "name">>(query, {
    slug: (await params).slug,
  });

  return {
    title: `${course.name} | OMSCentral`,
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const {
    course: {
      name,
      slug,
      reviews,
      codes,
      creditHours,
      description,
      programs,
      textbooks,
      syllabusUrl,
      rating,
      difficulty,
      workload,
    },
  } = await getCourseWithReviews(params.slug);

  const programAcronyms = programs.map(({ acronym }) => acronym);

  return (
    <section className="m-auto max-w-6xl px-5 py-10">
      <h3 className="mb-2 text-center text-3xl font-medium text-gray-900 lg:text-left dark:text-gray-100">
        {name}
      </h3>
      {reviews.length > 0 && (
        <div className="flex justify-center gap-2 lg:justify-start lg:gap-7 text-gray-700 dark:text-gray-300">
          <span className="flex items-center gap-0 lg:gap-1">
            <StarIcon className="h-5 w-5 stroke-indigo-600" />
            {formatNumber(rating)} / 5 rating
          </span>
          <span className="flex items-center gap-0 lg:gap-1">
            <LightningBoltIcon className="h-5 w-5 stroke-indigo-600" />
            {formatNumber(difficulty)} / 5 difficulty
          </span>
          <span className="flex items-center gap-0 lg:gap-1">
            <ClockIcon className="h-5 w-5 stroke-indigo-600" />
            {formatNumber(workload)} hrs / week
          </span>
        </div>
      )}
      <div className="mt-10 flex flex-col items-center gap-4 lg:flex-row lg:items-start">
        <div className="mx-auto max-w-xl grow bg-white shadow sm:rounded-lg lg:sticky lg:top-4 lg:max-h-screen lg:overflow-y-auto dark:bg-gray-800">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
              Quick Facts and Resources
            </h3>
            <p className="mt-1 max-w-2xl text-xs text-gray-500 dark:text-gray-400">
              Something missing or incorrect?{" "}
              <a
                href={`https://github.com/oms-tech/reviews/issues/new?template=course-edit-request.md&title=[EDIT] ${name}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Tell us more.
              </a>
            </p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <dl className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                <dd className="col-span-2 mt-0 text-sm text-gray-900 dark:text-gray-100">
                  {name}
                </dd>
              </div>
              <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Listed As</dt>
                <dd className="col-span-2 mt-0 text-sm text-gray-900 dark:text-gray-100">
                  {formatList(codes)}
                </dd>
              </div>
              <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Credit Hours
                </dt>
                <dd className="col-span-2 mt-0 text-sm text-gray-900 dark:text-gray-100">
                  {creditHours}
                </dd>
              </div>
              <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Available to
                </dt>
                <dd className="col-span-2 mt-0 text-sm text-gray-900 dark:text-gray-100">
                  {formatList(programAcronyms)} students
                </dd>
              </div>
              <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Description
                </dt>
                <dd className="col-span-3 mt-0 text-sm text-gray-900 sm:col-span-2 lg:col-span-3 dark:text-gray-100">
                  {description ?? "Course description not found."}{" "}
                </dd>
              </div>
              <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Syllabus</dt>
                <dd className="col-span-2 mt-0 text-sm text-gray-900 dark:text-gray-100">
                  {syllabusUrl ? (
                    <a
                      href={syllabusUrl}
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
              <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Textbooks</dt>
                <dd
                  className={classNames("mt-0 text-sm text-gray-900 dark:text-gray-100", {
                    "col-span-3": textbooks,
                    "col-span-2": !textbooks,
                  })}
                >
                  {textbooks ? (
                    <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                      {textbooks.map(({ name: textbookName, url }) => (
                        <li
                          key={textbookName}
                          className="flex items-center justify-between py-3 pl-3 pr-4 text-sm dark:text-gray-100"
                        >
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="w-0 flex-1 truncate font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            {textbookName}
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
          <ul className="space-y-4 divide-gray-200">
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewComponent review={review} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="w-full max-w-xl grow bg-white px-4 py-2 shadow sm:rounded-lg lg:max-w-full dark:bg-gray-800">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <DocumentAddIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  No reviews
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by writing a review.
                </p>
                <div className="mt-6">
                  <Link
                    href={`/reviews/new?course=${slug}`}
                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white no-underline shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <PlusIcon
                      className="-ml-1 mr-2 h-5 w-5"
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
