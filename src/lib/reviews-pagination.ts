export const REVIEWS_PAGE_SIZE = 20;

export function parseReviewsPage(
  value: string | undefined,
): number {
  const page = Number.parseInt(value ?? "1", 10);

  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function reviewsOffset(page: number): number {
  return (page - 1) * REVIEWS_PAGE_SIZE;
}

export function reviewsSliceEnd(offset: number): number {
  return offset + REVIEWS_PAGE_SIZE;
}

export function totalReviewPages(reviewCount: number): number {
  return Math.max(1, Math.ceil(reviewCount / REVIEWS_PAGE_SIZE));
}
