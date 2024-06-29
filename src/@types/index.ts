import { JWTPayload } from "jose";

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

export interface Program {
  name: string;
  acronym: string;
  url: string;
}

export interface Course {
  id: string;
  slug: string;
  codes: string[];
  name: string;
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
  email: string;
}
