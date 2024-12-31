import type { Metadata } from "next";

import { sanityClient } from "src/sanity/client";
import { Course, Review } from "src/types";
import { average } from "src/util/math";

import HomePage from "./home-page";
import type { HomePageProps } from "./home-page";

export const metadata: Metadata = {
  title: "Home | OMSCentral",
};

type CourseWithReviewsStats = Course & {
  reviews: Pick<Review, "rating" | "difficulty" | "workload">[];
};

type CourseWithStats = Course & {
  rating?: number;
  difficulty?: number;
  workload?: number;
  reviewCount: number;
};

async function getCoursesWithReviewsStats(): Promise<HomePageProps> {
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

  return { courses };
}

export default async function Page() {
  return <HomePage {...await getCoursesWithReviewsStats()} />;
}
