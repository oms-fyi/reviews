export interface Review {
  difficulty: number;
  rating: number;
  workload: number;
  course_id: string;
  created: number;
  body: string;
}

export interface Course {
  id: string;
  name: string;
  foundational: string;
  deprecated: string;
  [key: string]: string | number | null;
}

export interface HydratedCourse extends Course {
  reviewCount: number;
  avg_difficulty: number;
  avg_rating: number;
  avg_workload: number;
}
