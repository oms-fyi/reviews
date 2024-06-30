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
  codes: string[];
  name: string;
  term: "spring" | "fall" | "any";
  description?: string;
  creditHours: number;
  syllabusUrl?: string;
  textbooks?: {
    name: string;
    url: string;
  }[];
  isFoundational: boolean;
  isDeprecated: boolean;
  officialURL?: string;
  notesURL?: string;
  tags: string[];
}

export interface jwtPayload extends JWTPayload {
  accessToken: string;
  refreshToken: string;
  username: string;
}
