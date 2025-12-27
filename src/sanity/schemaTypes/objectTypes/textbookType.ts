import { defineField, defineType } from 'sanity';

export const textbookType = defineType({
  name: 'textbook',
  title: 'Textbook',
  type: 'object',
  fields: [
    defineField({ name: 'name', type: 'string' }),
    defineField({ name: 'url', type: 'url' }),
  ],
});
