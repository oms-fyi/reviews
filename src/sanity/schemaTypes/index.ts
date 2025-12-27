import { type SchemaTypeDefinition } from 'sanity';
import { courseType } from './courseType';
import { syllabusType } from './objectTypes/syllabusType';
import { textbookType } from './objectTypes/textbookType';
import { programType } from './programType';
import { semesterType } from './semesterType';
import { reviewType } from './reviewType';

export const schemaTypes: SchemaTypeDefinition[] = [
  courseType,
  programType,
  semesterType,
  reviewType,
  syllabusType,
  textbookType,
];
