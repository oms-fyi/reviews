import type { Course, Review as ReviewType, Semester } from "src/@types";
import type { GetStaticPaths, GetStaticProps } from "next";
import { Review as ReviewComponent } from "src/components/review";
import { sanityClient } from "src/sanity/client";
import { useRouter } from "next/router";

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
    <div className="bg-white shadow rounded-md p-4 max-w-xl w-full mx-auto">
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="flex gap-2">
          <div className="rounded-full bg-slate-200 h-10 w-10" />
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 bg-slate-200 rounded" />
            <div className="h-4 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="h-4 bg-slate-200 rounded" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-4 bg-slate-200 rounded col-span-3" />
          <div className="h-4 bg-slate-200 rounded col-span-3" />
          <div className="h-4 bg-slate-200 rounded col-span-3" />
          <div className="h-4 bg-slate-200 rounded col-span-3" />
          <div className="h-4 bg-slate-200 rounded col-span-3" />
          <div className="h-4 bg-slate-200 rounded col-span-3" />
        </div>
        <div className="grid grid-cols-6 gap-2">
          <div className="h-4 bg-slate-200 rounded col-span-1" />
          <div className="h-4 bg-slate-200 rounded col-span-1" />
          <div className="h-4 bg-slate-200 rounded col-span-1" />
        </div>
      </div>
    </div>
  );
}

export default function Review({ review }: ReviewPageProps): JSX.Element {
  const router = useRouter();

  return (
    <main className="h-full flex justify-center items-center m-auto max-w-6xl px-5 py-10">
      {router.isFallback ? <Loader /> : <ReviewComponent review={review} />}
    </main>
  );
}
