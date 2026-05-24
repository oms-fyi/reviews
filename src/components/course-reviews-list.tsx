"use client";

import classNames from "classnames";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Review } from "src/components/review";
import {
  REVIEWS_PAGE_SIZE,
  totalReviewPages,
} from "src/lib/reviews-pagination";

export type CourseReviewItem = {
  _id: string;
  _createdAt: string;
  body: string | null;
  rating: number | null;
  difficulty: number | null;
  workload: number | null;
  authorId: string | null;
  semester: {
    startDate: string | null;
    term: string | null;
  } | null;
};

type Props = {
  slug: string;
  initialReviews: CourseReviewItem[];
  totalCount: number;
  initialPage: number;
};

export function CourseReviewsList({
  slug,
  initialReviews,
  totalCount,
  initialPage,
}: Props) {
  const [reviews, setReviews] = useState(initialReviews);
  const [offset, setOffset] = useState(
    (initialPage - 1) * REVIEWS_PAGE_SIZE + initialReviews.length,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadingRef = useRef(false);
  const offsetRef = useRef(offset);
  offsetRef.current = offset;

  const totalPages = totalReviewPages(totalCount);
  const hasMore = offset < totalCount;
  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;
  const rangeStart = (initialPage - 1) * REVIEWS_PAGE_SIZE + 1;
  const rangeEnd = Math.min(
    (initialPage - 1) * REVIEWS_PAGE_SIZE + reviews.length,
    totalCount,
  );

  useEffect(() => {
    const nextOffset =
      (initialPage - 1) * REVIEWS_PAGE_SIZE + initialReviews.length;
    setReviews(initialReviews);
    setOffset(nextOffset);
    offsetRef.current = nextOffset;
    hasMoreRef.current = nextOffset < totalCount;
    setError(null);
  }, [initialReviews, initialPage, totalCount]);

  const loadMoreIfNeeded = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        offset: String(offsetRef.current),
        limit: String(REVIEWS_PAGE_SIZE),
      });
      const response = await fetch(
        `/api/courses/${encodeURIComponent(slug)}/reviews?${params}`,
      );

      if (!response.ok) {
        throw new Error("Failed to load reviews");
      }

      const data = (await response.json()) as { reviews: CourseReviewItem[] };
      const next = data.reviews ?? [];

      if (next.length === 0) {
        offsetRef.current = totalCount;
        hasMoreRef.current = false;
        setOffset(totalCount);
        return;
      }

      setReviews((prev) => {
        const seen = new Set(prev.map((r) => r._id));
        const merged = [...prev];

        for (const review of next) {
          if (!seen.has(review._id)) {
            merged.push(review);
            seen.add(review._id);
          }
        }

        return merged;
      });
      setOffset((prev) => {
        const updated = prev + next.length;
        offsetRef.current = updated;
        hasMoreRef.current = updated < totalCount;
        return updated;
      });
    } catch {
      setError("Could not load more reviews. Please try again.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [slug, totalCount]);

  const loadMoreRef = useRef(loadMoreIfNeeded);
  loadMoreRef.current = loadMoreIfNeeded;

  const sentinelRef = useRef<HTMLDivElement>(null);

  const sentinelStillInView = useCallback(() => {
    const el = sentinelRef.current;
    if (!el) {
      return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight + 400;
  }, []);

  const tryLoadMore = useCallback(() => {
    void loadMoreRef.current().then(() => {
      if (hasMoreRef.current && sentinelStillInView()) {
        tryLoadMore();
      }
    });
  }, [sentinelStillInView]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          tryLoadMore();
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, reviews.length, tryLoadMore]);

  const basePath = `/courses/${slug}/reviews`;

  return (
    <div className="w-full max-w-xl grow lg:max-w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
        <p>
          Showing {rangeStart}–{rangeEnd} of {totalCount} reviews
          {totalPages > 1 && (
            <>
              {" "}
              · Page {initialPage} of {totalPages}
            </>
          )}
        </p>
      </div>

      {totalPages > 1 && (
        <nav
          className="mb-6 flex flex-wrap items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3"
          aria-label="Review pages"
        >
          {initialPage > 1 ? (
            <Link
              href={`${basePath}?page=${initialPage - 1}`}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              ← Newer
            </Link>
          ) : (
            <span className="rounded-md border border-transparent px-3 py-1.5 text-sm text-gray-400">
              ← Newer
            </span>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === totalPages ||
                Math.abs(page - initialPage) <= 2,
            )
            .map((page, index, arr) => {
              const prev = arr[index - 1];
              const showEllipsis = prev !== undefined && page - prev > 1;

              return (
                <span key={page} className="flex items-center gap-2">
                  {showEllipsis && (
                    <span className="text-sm text-gray-400">…</span>
                  )}
                  <Link
                    href={`${basePath}?page=${page}`}
                    className={classNames(
                      "min-w-9 rounded-md border px-3 py-1.5 text-center text-sm",
                      page === initialPage
                        ? "border-indigo-600 bg-indigo-50 font-medium text-indigo-700"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
                    )}
                    aria-current={page === initialPage ? "page" : undefined}
                  >
                    {page}
                  </Link>
                </span>
              );
            })}

          {initialPage < totalPages ? (
            <Link
              href={`${basePath}?page=${initialPage + 1}`}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Older →
            </Link>
          ) : (
            <span className="rounded-md border border-transparent px-3 py-1.5 text-sm text-gray-400">
              Older →
            </span>
          )}
        </nav>
      )}

      <ul className="flex flex-col gap-7">
        {reviews.map((review) => (
          <li key={review._id}>
            <Review
              createdAt={review._createdAt}
              authorId={review.authorId}
              difficulty={review.difficulty ?? 0}
              rating={review.rating ?? 0}
              workload={review.workload ?? 0}
              body={review.body ?? ""}
              course={null}
              semester={review.semester}
            />
          </li>
        ))}
      </ul>

      {hasMore && (
        <div
          ref={sentinelRef}
          className="mt-8 flex min-h-12 items-center justify-center"
          aria-live="polite"
          aria-busy={loading}
        >
          {loading && (
            <span className="text-sm text-gray-500">Loading more reviews…</span>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 text-center text-sm text-red-600">
          {error}{" "}
          <button
            type="button"
            onClick={() => tryLoadMore()}
            className="font-medium text-indigo-600 underline hover:text-indigo-800"
          >
            Retry
          </button>
        </p>
      )}

      {totalPages > 1 && (
        <p className="mt-6 text-center text-sm text-gray-500">
          Use the page links above to jump to older or newer reviews.
        </p>
      )}
    </div>
  );
}
