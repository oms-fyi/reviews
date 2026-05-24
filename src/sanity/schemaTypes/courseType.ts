import { PresentationIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const courseType = defineType({
  name: "course",
  title: "Course",
  type: "document",
  icon: PresentationIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      placeholder: "Computer Networks",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name" },
      validation: (rule) => rule.required(),
      hidden: ({ document }) => !document?.name,
    }),
    defineField({
      name: "codes",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "programs",
      type: "array",
      of: [{ type: "reference", to: [{ type: "program" }] }],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "description",
      type: "text",
    }),
    defineField({
      name: "creditHours",
      type: "number",
      title: "Credit hours",
      initialValue: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "syllabus",
      type: "syllabus",
    }),
    defineField({
      name: "textbooks",
      type: "array",
      of: [{ type: "textbook" }],
    }),
    defineField({
      name: "officialURL",
      type: "url",
      title: "GATech URL",
    }),
    defineField({
      name: "notesURL",
      type: "url",
      title: "Notes URL",
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "isDeprecated",
      type: "boolean",
    }),
    defineField({
      name: "isFoundational",
      type: "boolean",
    }),
    defineField({
      name: "reviewCount",
      type: "number",
      title: "Review count",
      description: "Computed from reviews. Updated automatically.",
      readOnly: true,
      initialValue: 0,
    }),
    defineField({
      name: "rating",
      type: "number",
      title: "Average rating",
      description: "Computed from reviews. Updated automatically.",
      readOnly: true,
    }),
    defineField({
      name: "difficulty",
      type: "number",
      title: "Average difficulty",
      description: "Computed from reviews. Updated automatically.",
      readOnly: true,
    }),
    defineField({
      name: "workload",
      type: "number",
      title: "Average workload (hrs/week)",
      description: "Computed from reviews. Updated automatically.",
      readOnly: true,
    }),
  ],
});
