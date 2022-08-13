import { Review } from 'src/@types';

// MAY RETURN NaN
const average = (
  reviews: Pick<Review, 'rating' | 'difficulty' | 'workload'>[],
  key: keyof Pick<Review, 'rating' | 'difficulty' | 'workload'>,
): number => {
  let sum = 0;
  let count = 0;

  reviews.forEach((review) => {
    const value = review[key];

    if (value !== null) {
      count += 1;
      sum += value;
    }
  });

  return sum / count;
};

export default average;
