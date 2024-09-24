import { JWTPayload } from "jose";

export interface Semester {
  term: "spring" | "fall";
  date: string; // ISO Datetime string
}

export interface Review extends Semester {
  _id: string;
  body: string;
  authorId: string; // encrypted GT username of author
  created: string; // ISO Datetime string
  rating?: number;
  workload?: number;
  difficulty?: number;
}

export interface Program {
  name: string;
  acronym: string;
  url: string;
}

export interface Course {
  _id: string;
  slug: string;
  creditHours: number;
  description?: string;
  name: string;
  syllabusUrl: string;

  // term: "spring" | "fall" | "any";
  // tags: string[];
}

export interface UserToken extends JWTPayload {
  accessToken: string;
  refreshToken: string;
  expirationDate: number;
  username: string;
}
