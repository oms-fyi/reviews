import { type SchemaTypeDefinition } from "sanity";

import { courseType } from "./courseType";
import { syllabusType } from "./objectTypes/syllabusType";
import { textbookType } from "./objectTypes/textbookType";
import { programType } from "./programType";
import { reviewType } from "./reviewType";
import { semesterType } from "./semesterType";

export const schemaTypes: SchemaTypeDefinition[] = [
  courseType,
  programType,
  semesterType,
  reviewType,
  syllabusType,
  textbookType,
];
