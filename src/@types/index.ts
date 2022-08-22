export interface Semester {
  id: string;
  startDate: string; // ISO Date string
  term: "spring" | "summer" | "fall";
}

export interface Review {
  id: string;
  body: string;
  authorId: string; // encrypted GT username of author
  created: string; // ISO Datetime string
  rating?: number;
  workload?: number;
  difficulty?: number;
}

export interface Course {
  id: string;
  slug: string;
  name: string;
  department: string;
  number: string;
  isFoundational: boolean;
  isDeprecated: boolean;
  officialURL?: string;
  notesURL?: string;
  aliases: string[];
}

export type CourseWithReviewsStats = Course & {
  reviews: Pick<Review, "difficulty" | "workload" | "rating">[];
};

export type CourseWithReviewsFull = Course & {
  reviews: (Review & { semester: Semester })[];
};
