export interface Semester {
  startDate: string; // ISO Date string
  term: "spring" | "summer" | "fall";
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
  // Originally had these typed as 'number', using NaN to represent incomputable
  // stats based on zero reviews, BUT `JSON.stringify({a: NaN}) == '{"a":null}';`
  // Furthermore, NextJS throws an error trying to serialize objects with keys that
  // point to `undefined`, which means that our only option is `number | null`,
  // even though IMO the least semantic option of the three.
  rating: number | null;
  workload: number | null;
  difficulty: number | null;
}

export interface CourseWithReviews extends Course {
  reviews: Review[];
}
