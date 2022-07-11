export interface Semester {
  term: "spring" | "summer" | "fall";
  year: number;
}

export interface Review {
  body: string;
  semester?: Semester;
  created: string; // ISO Datetime string
  rating?: number;
  workload?: number;
  difficulty?: number;
}

export interface Course {
  id: string;
  name: string;
  department: string;
  number: string;
  isFoundational: boolean;
  isDeprecated: boolean;
  url?: string;
  aliases: string[];
  reviewCount: number;
  // A course with no reviews has undefined rating/workload/difficulty
  rating?: number;
  workload?: number;
  difficulty?: number;
}

export interface CourseWithReviews extends Course {
  reviews: Review[];
}
