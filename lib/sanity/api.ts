import { sanityClient } from "./client";
import {
  Course,
  Review,
  Semester,
  CourseWithReviewsFull,
  CourseWithReviewsStats,
} from "../../@types";

type CourseCodes = Pick<Course, "code">[];

export async function getCourseCodes(): Promise<CourseCodes> {
  const query = `
  *[_type == 'course'] {
      "code": department + '-' + number
    }
  `;

  const response = await sanityClient.fetch<CourseCodes>(query);
  return response;
}

export enum COURSE_ENRICHMENT_OPTION {
  NONE, // just course data
  STATS, // get review stats data (rating, difficulty, workload)
  REVIEWS, // get full review data (including body + semester)
}

export async function getCourse(
  code: Course["code"],
  enrichmentOption: COURSE_ENRICHMENT_OPTION.NONE
): Promise<Course>;
export async function getCourse(
  code: Course["code"],
  enrichmentOption: COURSE_ENRICHMENT_OPTION.STATS
): Promise<CourseWithReviewsStats>;
export async function getCourse(
  code: Course["code"],
  enrichmentOption: COURSE_ENRICHMENT_OPTION.REVIEWS
): Promise<CourseWithReviewsFull>;
export async function getCourse(
  code: Course["code"],
  enrichmentOption: COURSE_ENRICHMENT_OPTION = COURSE_ENRICHMENT_OPTION.NONE
): Promise<Course | CourseWithReviewsStats | CourseWithReviewsFull> {
  const match = code.match(/^(?<department>[A-z]+)-(?<number>.+)$/);

  if (!match) {
    throw new Error(`Code doesn't match format: ${code}`);
  }

  const { department, number } = match.groups ?? {};

  if (!department || !number) {
    throw new Error(`Can't parse department or number: ${match}`);
  }

  const query = `
    *[_type == 'course' && department == $department && number == $number]{
      ...,
      "id": _id,
      "created": _createdAt,
      "code": department + "-" + number,
      ${getReviewPair(enrichmentOption)}
    }[0]
  `;

  const response = sanityClient.fetch(query, { department, number });
  return response;
}

export async function getCourses(
  enrichmentOption: COURSE_ENRICHMENT_OPTION.NONE
): Promise<Course[]>;
export async function getCourses(
  enrichmentOption: COURSE_ENRICHMENT_OPTION.STATS
): Promise<CourseWithReviewsStats[]>;
export async function getCourses(
  enrichmentOption: COURSE_ENRICHMENT_OPTION.REVIEWS
): Promise<CourseWithReviewsFull[]>;
export async function getCourses(
  enrichmentOption: COURSE_ENRICHMENT_OPTION = COURSE_ENRICHMENT_OPTION.NONE
): Promise<(Course | CourseWithReviewsStats | CourseWithReviewsFull)[]> {
  const query = `
    *[_type == 'course']{
      ...,
      "id": _id,
      "code": department + "-" + number,
      ${getReviewPair(enrichmentOption)}
    }
  `;

  const response = sanityClient.fetch(query);
  return response;
}

function getReviewPair(enrichmentOption: COURSE_ENRICHMENT_OPTION): string {
  switch (enrichmentOption) {
    case COURSE_ENRICHMENT_OPTION.NONE:
      return "";
    case COURSE_ENRICHMENT_OPTION.STATS:
      return `"reviews": *[_type == 'review' && references(^._id)]{
        "id": _id,
        "created": _createdAt,
        rating,
        difficulty,
        workload
      },`;
    case COURSE_ENRICHMENT_OPTION.REVIEWS: {
      return `"reviews": *[_type == 'review' && references(^._id)]{
        ...,
        "id": _id,
        "created": _createdAt,
        rating,
        difficulty,
        workload,
        semester->
      },`;
    }
  }
}
