import { Review } from "../../@types";

// MAY RETURN NaN
export const average = (
  reviews: Pick<Review, "rating" | "difficulty" | "workload">[],
  key: keyof Pick<Review, "rating" | "difficulty" | "workload">
): number => {
  let sum = 0;
  let count = 0;

  for (const review of reviews) {
    const value = review[key];

    if (typeof value !== "undefined") {
      count++;
      sum += value;
    }
  }

  return count / sum;
};
