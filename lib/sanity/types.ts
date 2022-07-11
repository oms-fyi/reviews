interface SanityDocument<T> {
  _id: string;
  _type: T;
  _createdAt: string;
}

export interface ApiSemester extends SanityDocument<"semester"> {
  year: number;
  term: "spring" | "summer" | "fall";
}

// Some reviews do not have a recorded difficulty/workload/rating
// This will be required for new records
export interface ApiReview extends SanityDocument<"review"> {
  body: string;
  rating?: number;
  difficulty?: number;
  workload?: number;
  semester?: SanityDocument<"semester"> | ApiSemester;
  course: SanityDocument<"course"> | ApiCourse;
}

export interface ApiCourse extends SanityDocument<"course"> {
  name: string;
  department: string;
  number: string;
  isFoundational: boolean;
  isDeprecated: boolean;
  url?: string;
  aliases: string[];
}
