import { ObjectId } from "mongodb";
import type { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";

import type { Course, Review as ReviewType } from "src/@types";
import { Review as ReviewComponent } from "src/components/review";
import { connectToDatabase } from "src/lib/mongodb";

const PRERENDER_LIMIT = 100;

type ReviewPathParams = Pick<ReviewType, "_id">;
type ReviewPageProps = {
  review: ReviewType & {
    course?: Pick<Course, "name" | "slug">;
  };
};

export const getStaticPaths: GetStaticPaths<ReviewPathParams> = async () => {
  const { db } = await connectToDatabase();

  const ids = await db
    .collection("reviews")
    .aggregate([
      { $group: { _id: "$_id" } },
      { $sort: { _id: 1 } },
      { $limit: PRERENDER_LIMIT },
    ])
    .toArray();

  console.log(ids);

  const paths = ids.map((_id) => {
    return { params: { _id: _id.toString() } };
  });

  return {
    paths,
    // https://nextjs.org/docs/api-reference/data-fetching/get-static-paths#when-is-fallback-true-useful
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<
  ReviewPageProps,
  ReviewPathParams
> = async ({ params: { _id } = {} }) => {
  if (!_id) {
    throw new Error("No review ID passed to `getStaticProps`");
  }

  const { db } = await connectToDatabase();

  let review = await JSON.parse(
    JSON.stringify(
      await db
        .collection("reviews")
        .findOne({ _id: new ObjectId(_id.toString()) }),
    ),
  );

  const tmpCourse = await JSON.parse(
    JSON.stringify(
      await db
        .collection("courses")
        .findOne({ _id: new ObjectId(review.courseId.toString()) }),
    ),
  );

  review = {
    ...review,
    course: { name: tmpCourse.name, slug: tmpCourse.slug },
  };

  if (!review) {
    return {
      notFound: true,
    };
  }

  return { props: { review } };
};

function Loader(): JSX.Element {
  return (
    <div className="mx-auto w-full max-w-xl rounded-md bg-white p-4 shadow">
      <div className="flex animate-pulse flex-col gap-6">
        <div className="flex gap-2">
          <div className="h-10 w-10 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 rounded bg-slate-200" />
            <div className="h-4 rounded bg-slate-200" />
          </div>
        </div>
        <div className="h-4 rounded bg-slate-200" />
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-3 h-4 rounded bg-slate-200" />
          <div className="col-span-3 h-4 rounded bg-slate-200" />
          <div className="col-span-3 h-4 rounded bg-slate-200" />
          <div className="col-span-3 h-4 rounded bg-slate-200" />
          <div className="col-span-3 h-4 rounded bg-slate-200" />
          <div className="col-span-3 h-4 rounded bg-slate-200" />
        </div>
        <div className="grid grid-cols-6 gap-2">
          <div className="col-span-1 h-4 rounded bg-slate-200" />
          <div className="col-span-1 h-4 rounded bg-slate-200" />
          <div className="col-span-1 h-4 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function Review({ review }: ReviewPageProps): JSX.Element {
  const router = useRouter();

  return (
    <main className="m-auto flex h-full max-w-6xl items-center justify-center px-5 py-10">
      {router.isFallback ? <Loader /> : <ReviewComponent review={review} />}
    </main>
  );
}
