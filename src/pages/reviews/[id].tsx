import type { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";

import { Review as ReviewComponent } from "src/components/review";
import { sanityClient } from "src/sanity/client";
import type { Course, Review as ReviewType, Semester } from "src/types";

const PRERENDER_LIMIT = 100;

type ReviewPathParams = Pick<ReviewType, "id">;
type ReviewPageProps = {
  review: ReviewType & {
    semester: Semester;
    course?: Pick<Course, "name" | "slug">;
  };
};

export const getStaticPaths: GetStaticPaths<ReviewPathParams> = async () => {
  const query = `
  *[_type == 'review'] {
      "id": _id
    }[0...$limit]
  `;

  const ids = await sanityClient.fetch<Pick<ReviewType, "id">[]>(query, {
    limit: PRERENDER_LIMIT,
  });

  const paths = ids.map(({ id }) => ({
    params: { id },
  }));

  return {
    paths,
    // https://nextjs.org/docs/api-reference/data-fetching/get-static-paths#when-is-fallback-true-useful
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<
  ReviewPageProps,
  ReviewPathParams
> = async ({ params: { id } = {} }) => {
  if (!id) {
    throw new Error("No review ID passed to `getStaticProps`");
  }

  const query = `
    *[_type == 'review' && _id == $id]{
      "id": _id,
      "created": _createdAt,
      ...,
      course->{
        name,
        "slug": slug.current
      },
      semester->
    }[0]
  `;

  const review = await sanityClient.fetch<ReviewPageProps["review"]>(query, {
    id,
  });

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
