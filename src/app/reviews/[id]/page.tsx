import { Review } from "src/components/review";
import { sanityClient } from "src/sanity/client";
import type { Course, Review as ReviewType, Semester } from "src/types";

const PRERENDER_LIMIT = 100;

type ReviewPageProps = {
  review: ReviewType & {
    semester: Semester;
    course?: Pick<Course, "name" | "slug">;
  };
};

export const dynamicParams = true;

export async function generateStaticParams() {
  const query = `
  *[_type == 'review'] {
      "id": _id
    }[0...$limit]
  `;

  return await sanityClient.fetch<Array<Pick<ReviewType, "id">>>(query, {
    limit: PRERENDER_LIMIT,
  });
}

async function getReview(id: string): Promise<ReviewPageProps["review"]> {
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

  return await sanityClient.fetch<ReviewPageProps["review"]>(query, {
    id,
  });
}

export default async function Page({ params }: { params: { id: string } }) {
  const review = await getReview(params.id); // WHAT IF WE FAIL HERE?

  return (
    <section className="m-auto flex h-full max-w-6xl items-center justify-center px-5 py-10">
      <Review review={review} />
    </section>
  );
}
