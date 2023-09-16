import { Metadata } from "next";

import { sanityClient } from "src/lib/sanity";
import type { Course, Review } from "src/types";

import PageIndex from "./page-index";

type CourseWithReviewsStats = Course & {
  reviews: Pick<Review, "rating" | "difficulty" | "workload">[];
};

type CourseWithStats = Course & {
  rating?: number;
  difficulty?: number;
  workload?: number;
  reviewCount: number;
};

async function fetchCourses(): Promise<CourseWithStats[]> {
  const query = `
    *[_type == 'course']{
      ...,
      "slug": slug.current,
      "id": _id,
      "reviews": *[_type == 'review' && references(^._id)]{
        "id": _id,
        "created": _createdAt,
        ...,
        "body": "",
        "course": null,
      }
    }
  `;

  const apiResponse = await sanityClient.fetch<CourseWithReviewsStats[]>(query);

  const courses = apiResponse.map(({ reviews, ...rest }) => {
    const course: CourseWithStats = {
      ...rest,
      reviewCount: reviews.length,
    };

    const rating = average(reviews, "rating");
    const difficulty = average(reviews, "difficulty");
    const workload = average(reviews, "workload");

    if (rating) course.rating = rating;
    if (difficulty) course.difficulty = difficulty;
    if (workload) course.workload = workload;

    return course;
  });

  return courses;
}

// MAY RETURN NaN
function average(
  reviews: Pick<Review, "rating" | "difficulty" | "workload">[],
  key: keyof Pick<Review, "rating" | "difficulty" | "workload">
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

export const metadata: Metadata = {
  title: "Home | oms.fyi",
};

export default async function Page() {
  const courses = await fetchCourses();
  return <PageIndex courses={courses} />;
}
