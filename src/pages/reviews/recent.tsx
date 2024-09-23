import type { GetStaticProps } from "next";
import Head from "next/head";

import type { Course, Review } from "src/@types";
import { Review as ReviewComponent } from "src/components/review";
import { connectToDatabase } from "src/lib/mongodb";

interface ReviewsPageProps {
  reviews: Array<
    Review & {
      course: Pick<Course, "name" | "slug">;
    }
  >;
}

export const getStaticProps: GetStaticProps<ReviewsPageProps> = async () => {
  const { db } = await connectToDatabase();

  const dbReviews = await db
    .collection("reviews")
    .find({}, { sort: { created: -1 }, limit: 100 })
    .toArray();
  const dbCourses = await db.collection("courses").find({}).toArray();

  const reviews = await dbReviews.map((r) => {
    let review = JSON.parse(JSON.stringify(r));
    delete review._id;
    review = { _id: r._id.toString(), ...review };

    const course = dbCourses.find(
      (c) => c._id.toString() === r.courseId.toString(),
    );
    return {
      ...review,
      course: { name: course?.name, slug: course?.slug },
    };
  });

  return { props: { reviews } };
};

export default function Reviews({ reviews }: ReviewsPageProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Recent Reviews | OMSCentral</title>
      </Head>
      <main className="m-auto max-w-7xl px-5 py-10">
        <h3 className="mb-10 text-center text-3xl font-medium text-gray-900">
          100 Most Recent Reviews
        </h3>
        <ul className="space-y-4 divide-gray-200">
          {reviews.map((review) => (
            <li key={review._id}>
              <ReviewComponent review={review} />
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
