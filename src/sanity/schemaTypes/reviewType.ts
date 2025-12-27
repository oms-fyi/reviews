import { FeedbackIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const reviewType = defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  icon: FeedbackIcon,
  fields: [
    defineField({
      name: 'course',
      type: 'reference',
      to: [{ type: 'course' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'semester',
      type: 'reference',
      to: [{ type: 'semester' }],
    }),
    defineField({
      name: 'body',
      type: 'text', // TODO: Array of blocks?
    }),
    defineField({
      name: 'rating',
      type: 'number',
      validation: (rule) => rule.min(1).max(5),
    }),
    defineField({
      name: 'difficulty',
      type: 'number',
      validation: (rule) => rule.min(1).max(5),
    }),
    defineField({
      name: 'workload',
      type: 'number',
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'authorId',
      type: 'string',
      title: 'Author ID',
      description: 'Encrypted GT account of review author.',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'course.name',
    },
  },
});
