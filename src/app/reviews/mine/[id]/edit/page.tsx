import { notFound, redirect } from "next/navigation";

import { EditReviewForm } from "src/app/reviews/mine/[id]/edit/edit-review-form";
import { encryptAuthorId } from "src/lib/crypto";
import { getSession } from "src/lib/session";
import { sanityClient } from "src/sanity/client";
import { REVIEW_QUERY } from "src/sanity/queries";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditMyReviewPage({ params }: Props) {
  const session = await getSession();

  if (!session) {
    redirect("/api/auth/cas/login?returnTo=/reviews/mine");
  }

  const { id } = await params;
  const review = await sanityClient.fetch(REVIEW_QUERY, { id });

  if (!review) {
    notFound();
  }

  const authorId = encryptAuthorId(session.username);

  if (review.authorId !== authorId) {
    notFound();
  }

  return (
    <EditReviewForm
      reviewId={id}
      courseName={review.course?.name ?? "Unknown course"}
      initial={{
        body: review.body ?? "",
        rating: review.rating ?? 1,
        difficulty: review.difficulty ?? 1,
        workload: review.workload ?? 1,
      }}
    />
  );
}
