import type { Course, Program, Review, Semester } from "src/@types";
import type { GetStaticPaths, GetStaticProps } from "next";
import { useEffect, useState } from "react";
import { DocumentAddIcon } from "@heroicons/react/outline";
import Head from "next/head";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/solid";
import { Review as ReviewComponent } from "src/components/review";
import classNames from "classnames";
import { sanityClient } from "src/sanity/client";

interface ReviewsPathParams {
  slug: Course["slug"];
  [key: string]: string | string[];
}

type CourseWithReviews = Course & {
  programs: Array<Pick<Program, "acronym">>;
  reviews: Array<Review & { semester: Semester }>;
};

interface ReviewsPageProps {
  course: CourseWithReviews;
}

export const getStaticPaths: GetStaticPaths<ReviewsPathParams> = async () => {
  const query = `
  *[_type == 'course'] {
      "slug": slug.current
    }
  `;

  const slugs = await sanityClient.fetch<Pick<Course, "slug">[]>(query);

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

  const course = await sanityClient.fetch<CourseWithReviews>(query, {
    slug,
  });

  return { props: { course } };
};

export default function Reviews({
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
  },
}: ReviewsPageProps): JSX.Element {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const formatter = new Intl.ListFormat(
    hasMounted ? navigator.language : "en",
    {
      style: "long",
      type: "conjunction",
    }
  );

  return (
    <>
      <Head>
        <title>{`${name} | OMSCentral`}</title>
      </Head>
      <main className="m-auto max-w-6xl px-5 py-10">
        <h3 className="text-3xl mb-10 font-medium text-gray-900 text-center lg:text-left">
          {name}
        </h3>
        <div className="flex flex-col lg:flex-row lg:items-start items-center gap-4">
          <div className="bg-white shadow grow max-w-xl mx-auto lg:max-h-screen lg:overflow-y-auto lg:sticky lg:top-4 sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Quick Facts and Resources
              </h3>
              <p className="mt-1 max-w-2xl text-xs text-gray-500">
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
            <div className="border-t border-gray-200 px-4 py-5 p-0">
              <dl className="divide-y divide-gray-200">
                <div className="py-5 grid grid-cols-3 gap-4 px-6">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900 mt-0 col-span-2">
                    {name}
                  </dd>
                </div>
                <div className="py-5 grid grid-cols-3 gap-4 px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Listed As
                  </dt>
                  <dd className="text-sm text-gray-900 mt-0 col-span-2">
                    {formatter.format(codes)}
                  </dd>
                </div>
                <div className="py-5 grid grid-cols-3 gap-4 px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Credit Hours
                  </dt>
                  <dd className="text-sm text-gray-900 mt-0 col-span-2">
                    {creditHours}
                  </dd>
                </div>
                <div className="py-5 grid grid-cols-3 gap-4 px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Available to
                  </dt>
                  <dd className="text-sm text-gray-900 mt-0 col-span-2">
                    {formatter.format(programs.map(({ acronym }) => acronym))}{" "}
                    students
                  </dd>
                </div>
                <div className="py-5 grid grid-cols-3 gap-4 px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Description
                  </dt>
                  <dd className="text-sm text-gray-900 mt-0 col-span-3 sm:col-span-2 lg:col-span-3">
                    {description ?? "Course description not found."}{" "}
                  </dd>
                </div>
                <div className="py-5 grid grid-cols-3 gap-4 px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Syllabus
                  </dt>
                  <dd className="text-sm text-gray-900 mt-0 col-span-2">
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
                <div className="py-5 grid grid-cols-3 gap-4 px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Textbooks
                  </dt>
                  <dd
                    className={classNames("text-sm text-gray-900 mt-0", {
                      "col-span-3": textbooks,
                      "col-span-2": !textbooks,
                    })}
                  >
                    {textbooks ? (
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        {textbooks.map(({ name: textbookName, url }) => (
                          <li
                            key={textbookName}
                            className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                          >
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium flex-1 w-0 text-indigo-600 hover:text-indigo-500 truncate"
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
            <div className="bg-white px-4 py-2 grow w-full max-w-xl lg:max-w-full shadow sm:rounded-lg">
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
                        className="no-underline inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
          )}
        </div>
      </main>
    </>
  );
}
