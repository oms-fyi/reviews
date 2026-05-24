import Link from "next/link";
import { redirect } from "next/navigation";

import { Time } from "src/components/datetime";
import { encryptAuthorId } from "src/lib/crypto";
import { getSession } from "src/lib/session";
import { sanityClient } from "src/sanity/client";
import { MY_REVIEWS_QUERY } from "src/sanity/queries";

type MyReview = {
  _id: string;
  _createdAt: string;
  body: string | null;
  rating: number | null;
  difficulty: number | null;
  workload: number | null;
  course: { name: string | null; slug: string | null } | null;
  semester: { startDate: string | null; term: string | null } | null;
};

type Props = {
  searchParams: Promise<{ error?: string; updated?: string }>;
};

export default async function MyReviewsPage({ searchParams }: Props) {
  const session = await getSession();
  const { error, updated } = await searchParams;

  if (!session) {
    if (error === "invalid_ticket" || error === "missing_ticket") {
      return (
        <section className="mx-auto mt-10 max-w-3xl px-5 py-10 sm:px-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Sign-in failed
          </h1>
          <p className="mt-2 text-sm text-red-600">
            {error === "missing_ticket"
              ? "No ticket was returned from CAS. Please try again."
              : "CAS could not validate your login ticket. Please sign in again."}
          </p>
          <Link
            href="/api/auth/cas/login?returnTo=/reviews/mine"
            className="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Sign in
          </Link>
        </section>
      );
    }

    redirect("/api/auth/cas/login?returnTo=/reviews/mine");
  }

  const authorId = encryptAuthorId(session.username);
  const reviews = (await sanityClient.fetch(MY_REVIEWS_QUERY, {
    authorId,
  })) as MyReview[];

  return (
    <section className="mx-auto mt-10 max-w-3xl px-5 py-10 sm:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          My reviews
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Signed in as <span className="font-medium">{session.username}</span>
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-600">
            Sign-in failed. Please try again.
          </p>
        )}
        {updated && (
          <p
            className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            role="status"
          >
            Your review was updated.
          </p>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-600">You have not submitted any reviews yet.</p>
          <Link
            href="/reviews/new"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-800"
          >
            Add a review
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li
              key={review._id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {review.course?.name ?? "Unknown course"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    <Time
                      dateTime={review._createdAt}
                      opts={{ dateStyle: "long" }}
                    />
                    {review.semester?.term && ` · ${review.semester.term}`}
                  </p>
                </div>
                <Link
                  href={`/reviews/mine/${review._id}/edit`}
                  className="rounded-md border border-indigo-600 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  Edit
                </Link>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Rating</dt>
                  <dd className="font-medium">{review.rating ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Difficulty</dt>
                  <dd className="font-medium">{review.difficulty ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Workload</dt>
                  <dd className="font-medium">{review.workload ?? "—"}</dd>
                </div>
              </dl>
              {review.body && (
                <p className="mt-4 line-clamp-3 text-sm text-gray-700">
                  {review.body}
                </p>
              )}
              {review.course?.slug && (
                <Link
                  href={`/courses/${review.course.slug}/reviews`}
                  className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-800"
                >
                  View on course page
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
