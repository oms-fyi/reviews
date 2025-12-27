import { defineField, defineType } from 'sanity';

export const syllabusType = defineType({
  name: 'syllabus',
  title: 'Syllabus',
  type: 'object',
  fields: [
    defineField({
      name: 'file',
      title: 'File',
      type: 'file',
      description: 'Upload a syllabus',
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Paste in link to syllabus',
    }),
  ],
});
