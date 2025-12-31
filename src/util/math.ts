import { Review } from "../../sanity.types";

export function average(
  reviews: Array<{
    difficulty?: number | null;
    rating?: number | null;
    workload?: number | null;
  }>,
  key: keyof Pick<Review, "rating" | "difficulty" | "workload">,
): number {
  let sum = 0;
  let count = 0;

  reviews.forEach((review) => {
    const value = review[key];
    if (value) {
      count += 1;
      sum += value;
    }
  });

  return sum / count;
}
