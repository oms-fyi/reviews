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

export const getCourseIds = async (): Promise<Pick<Course, "id">[]> => {
  type SanityResponse = Array<Pick<Course, "department" | "number">>;

  const response = await sanityClient.fetch<SanityResponse>(`
    *[_type == 'course'] {
      department,
      number
    }
  `);

  return response.map(({ department, number }) => {
    return {
      id: `${department}-${number}`,
    };
  });
};

export const getCourses = async (): Promise<Course[]> => {
  type SanityResponse = Array<
    ApiCourse & {
      ratings: number[];
      difficulties: number[];
      workloads: number[];
      reviewCount: number;
    }
  >;

  const response = await sanityClient.fetch<SanityResponse>(`
    *[_type == 'course'] {
      ...,
      "ratings": *[_type == 'review' && references(^._id) && rating != null].rating,
      "difficulties": *[_type == 'review' && references(^._id) && difficulty != null].difficulty,
      "workloads": *[_type == 'review' && references(^._id) && workload != null].workload,
      "reviewCount": count(*[_type == 'review' && references(^._id)])
    }
  `);

  return response.map(
    ({ department, number, ratings, difficulties, workloads, ...rest }) => {
      const course: Course = {
        ...rest,
        id: `${department}-${number}`,
        department,
        number,
        rating: avg(ratings),
        difficulty: avg(difficulties),
        workload: avg(workloads),
      };

      return course;
    }
  );
};

export const getReviews = async (
  courseId: string
): Promise<CourseWithReviews> => {
  type SanityResponse = ApiCourse & {
    ratings: number[];
    difficulties: number[];
    workloads: number[];
    reviewCount: number;
    reviews: Array<ApiReview>;
  };

  const match = courseId.match(/^([A-z]+)-(.+)$/);

  if (!match) {
    throw new Error(`Cannot parse courseId: ${courseId}`);
  }

  const [_src, department, number] = match;

  const response = await sanityClient.fetch<SanityResponse>(
    `
    *[_type == 'course' && department == $department && number == $number] {
      ...,
      "ratings": *[_type == 'review' && references(^._id) && rating != null].rating,
      "difficulties": *[_type == 'review' && references(^._id) && difficulty != null].difficulty,
      "workloads": *[_type == 'review' && references(^._id) && workload != null].workload,
      "reviews": *[_type == 'review' && references(^._id)]{
        ...,
        semester->{startDate, term}
      } | order(_createdAt desc)
    }[0]
  `,
    { department, number }
  );

  const { reviews, ratings, difficulties, workloads, ...rest } = response;

  const course: CourseWithReviews = {
    ...rest,
    id: `${department}-${number}`,
    department,
    number,
    rating: avg(ratings),
    difficulty: avg(difficulties),
    workload: avg(workloads),
    reviews: reviews.map(({ semester, _createdAt, ...rest }) => {
      const review: Review = { ...rest, created: _createdAt };
      if (semester && "startDate" in semester)
        review.semester = {
          ...semester,
          term: capitalizedSemesters[semester.term],
          startDate: semester.startDate,
        };

      return review;
    }),
    reviewCount: reviews.length,
  };

  return course;
};
