import { useMemo } from 'react';

import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

import format from 'date-fns/format';
import { CalendarIcon, PencilAltIcon } from '@heroicons/react/outline';

import type { Course, CourseWithReviewsFull } from '../../../src/@types';
import {
  CourseEnrichmentOption,
  getCourse,
  getCourseCodes,
} from '../../../src/sanity';
import average from '../../../src/stats';

interface ReviewsPathParams {
  courseCode: Course['code'];
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
    paths: [{ params: { courseCode: 'CS-6150' } }],
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<
ReviewsPageProps,
ReviewsPathParams
> = async ({ params: { courseCode } = {} }) => {
  if (!courseCode) {
    throw new Error('No code passed to `getStaticProps`');
  }

  const course = await getCourse(courseCode, CourseEnrichmentOption.REVIEWS);
  return { props: { course } };
};

export default function Reviews({
  course: { code, name, reviews },
}: ReviewsPageProps): JSX.Element {
  const avgRating = useMemo(() => average(reviews, 'rating'), [reviews]);
  const avgDifficulty = useMemo(
    () => average(reviews, 'difficulty'),
    [reviews],
  );
  const avgWorkload = useMemo(() => average(reviews, 'workload'), [reviews]);

  return (
    <>
      <Head>
        <title>{`${code} | OMSCentral`}</title>
      </Head>
      <main className="max-w-3xl m-auto pb-5 bg-white mt-10">
        <ul className="divide-y px-6 divide-gray-200">
          {reviews.map(
            ({
              id, created, body, rating, difficulty, workload, semester,
            }) => (
              <li key={id} className="py-4">
                <p className="text-gray-500 mt-2 flex items-center text-xs">
                  <PencilAltIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                  Review submitted:
                  {' '}
                  {format(new Date(created), 'MMMM dd, yyyy')}
                </p>
              </li>
            ),
          )}
        </ul>
      </main>
    </>
  );
}
