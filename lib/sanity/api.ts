import { sanityClient } from "./client";
import {
  Course,
  CourseWithReviewsFull,
  CourseWithReviewsStats,
  Semester,
  Review,
} from "../../@types";
import { encrypt } from "../encryption";

export enum CourseEnrichmentOption {
  NONE, // just course data
  STATS, // get review stats data (rating, difficulty, workload)
  REVIEWS, // get full review data (including body + semester)
}

function getReviewPair(enrichmentOption: CourseEnrichmentOption): string {
  if (enrichmentOption === CourseEnrichmentOption.NONE) return "";

  return `"reviews": *[_type == 'review' && references(^._id)]{
    "id": _id,
    "created": _createdAt,
    rating,
    difficulty,
    workload,
    ${
      enrichmentOption === CourseEnrichmentOption.REVIEWS
        ? `
      ...,
      semester->
    `
        : ""
    }
  } | order(created desc)`;
}

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

type CourseNames = Pick<Course, "id" | "code" | "name">[];

export async function getCourseNames(): Promise<CourseNames> {
  const query = `
  *[_type == 'course'] {
      "id": _id,
      "code": department + '-' + number,
      name
    } | order(name)
  `;

  const response = await sanityClient.fetch<CourseNames>(query);
  return response;
}

type SanityReference = {
  _ref: string;
};

export type CreateReviewRequest = {
  rating: NonNullable<Review["rating"]>;
  difficulty: NonNullable<Review["difficulty"]>;
  workload: NonNullable<Review["workload"]>;
  body: Review["body"];
  courseId: Course["id"];
  semesterId: Semester["id"];
  username: string;
};

export async function createReview({
  semesterId,
  courseId,
  username,
  ...review
}: CreateReviewRequest) {
  type CreateReviewSanityRequest = Omit<
    CreateReviewRequest,
    "courseId" | "semesterId" | "username"
  > & {
    course: SanityReference;
    semester: SanityReference;
  } & {
    authorId: NonNullable<Review["authorId"]>;
  };

  const authorId = encrypt(username);

  const request = {
    _type: "review",
    authorId,
    ...review,
    course: {
      _ref: courseId,
      _type: "reference",
    },
    semester: {
      _ref: semesterId,
      _type: "reference",
    },
  };

  const response = sanityClient.create<CreateReviewSanityRequest>(request);
  return response;
}

export async function getRecentSemesters(
  limit: number = 3
): Promise<Semester[]> {
  const query = `
  *[_type == 'semester' && startDate <= now()]{
    "id": _id,
    ...
  } | order(startDate desc)[0...$limit]
  `;

  const response = await sanityClient.fetch<Semester[]>(query, {
    limit,
  });
  return response;
}

export async function getCourse(
  code: Course["code"],
  enrichmentOption: CourseEnrichmentOption.NONE
): Promise<Course>;
export async function getCourse(
  code: Course["code"],
  enrichmentOption: CourseEnrichmentOption.STATS
): Promise<CourseWithReviewsStats>;
export async function getCourse(
  code: Course["code"],
  enrichmentOption: CourseEnrichmentOption.REVIEWS
): Promise<CourseWithReviewsFull>;
export async function getCourse(
  code: Course["code"],
  enrichmentOption: CourseEnrichmentOption = CourseEnrichmentOption.NONE
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
  enrichmentOption: CourseEnrichmentOption.NONE
): Promise<Course[]>;
export async function getCourses(
  enrichmentOption: CourseEnrichmentOption.STATS
): Promise<CourseWithReviewsStats[]>;
export async function getCourses(
  enrichmentOption: CourseEnrichmentOption.REVIEWS
): Promise<CourseWithReviewsFull[]>;
export async function getCourses(
  enrichmentOption: CourseEnrichmentOption = CourseEnrichmentOption.NONE
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
