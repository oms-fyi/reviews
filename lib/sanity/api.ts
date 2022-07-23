import { sanityClient } from "./client";
import { ApiCourse, ApiReview, ApiSemester } from "./types";
import { Course, CourseWithReviews, Review, Semester } from "../../@types";

// Will return NaN if items == [], which gets JSON-serialized to `null`
const avg = (items: number[]): number => {
  return items.reduce((sum, el) => el + sum, 0) / items.length;
};

const capitalizedSemesters: {
  [Property in ApiSemester["term"]]: Capitalize<Property>;
} = {
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
};

export const getCourseCodes = async (): Promise<Pick<Course, "code">[]> => {
  type SanityResponse = Array<Pick<Course, "code">>;

  const response = await sanityClient.fetch<SanityResponse>(`
    *[_type == 'course'] {
      "code": department + '-' + number
    }
  `);

  return response;
};

export const getCourses = async (): Promise<Course[]> => {
  type SanityResponse = Array<
    ApiCourse & {
      code: string;
      ratings: number[];
      difficulties: number[];
      workloads: number[];
      reviewCount: number;
    }
  >;

  const response = await sanityClient.fetch<SanityResponse>(`
    *[_type == 'course'] {
      ...,
      "code": department + '-' + number,
      "ratings": *[_type == 'review' && references(^._id) && rating != null].rating,
      "difficulties": *[_type == 'review' && references(^._id) && difficulty != null].difficulty,
      "workloads": *[_type == 'review' && references(^._id) && workload != null].workload,
      "reviewCount": count(*[_type == 'review' && references(^._id)])
    }
  `);

  return response.map(
    ({ ratings, difficulties, workloads, _id: id, ...rest }) => {
      const course: Course = {
        ...rest,
        id,
        rating: avg(ratings),
        difficulty: avg(difficulties),
        workload: avg(workloads),
      };

      return course;
    }
  );
};

export const getReviews = async (
  courseCode: string
): Promise<CourseWithReviews> => {
  type SanityResponse = ApiCourse & {
    code: string;
    ratings: number[];
    difficulties: number[];
    workloads: number[];
    reviewCount: number;
    reviews: Array<ApiReview>;
  };

  const match = courseCode.match(/^([A-z]+)-(.+)$/);

  if (!match) {
    throw new Error(`Cannot parse courseId: ${courseCode}`);
  }

  const [_src, department, number] = match;

  const response = await sanityClient.fetch<SanityResponse>(
    `
    *[_type == 'course' && department == $department && number == $number] {
      ...,
      "code": department + '-' + number,
      "ratings": *[_type == 'review' && references(^._id) && rating != null].rating,
      "difficulties": *[_type == 'review' && references(^._id) && difficulty != null].difficulty,
      "workloads": *[_type == 'review' && references(^._id) && workload != null].workload,
      "reviews": *[_type == 'review' && references(^._id)]{
        ...,
        semester->{_id, startDate, term}
      } | order(_createdAt desc)
    }[0]
  `,
    { department, number }
  );

  const {
    reviews,
    ratings,
    difficulties,
    workloads,
    _id: id,
    ...rest
  } = response;

  const course: CourseWithReviews = {
    ...rest,
    id,
    department,
    number,
    rating: avg(ratings),
    difficulty: avg(difficulties),
    workload: avg(workloads),
    reviewCount: reviews.length,
    reviews: reviews.map(({ semester, _createdAt, _id: id, ...rest }) => {
      const review: Review = { ...rest, created: _createdAt, id };

      if (semester && "startDate" in semester) {
        const { _id: id, term, startDate } = semester;
        review.semester = { id, startDate, term: capitalizedSemesters[term] };
      }

      return review;
    }),
  };

  return course;
};
