import type { Course, Review, Semester } from "src/@types";
import type { GetStaticProps } from "next";
import Head from "next/head";
import { Review as ReviewComponent } from "src/components/review";
import { getReviews } from "src/sanity/api";

interface ReviewsPageProps {
  reviews: Array<
    Review & {
      course: Pick<Course, "name" | "slug">;
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
      <main className="m-auto max-w-7xl px-5 py-10">
        <h3 className="text-3xl text-center mb-10 font-medium text-gray-900">
          100 Most Recent Reviews
        </h3>
        <ul className="space-y-4 divide-gray-200">
          {reviews.map((review) => (
            <li key={review.id}>
              <ReviewComponent review={review} />
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
