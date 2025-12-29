import { CalendarIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const semesterType = defineType({
  name: "semester",
  title: "Semester",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "term",
      type: "string",
      options: { list: ["spring", "summer", "fall"] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "startDate",
      description: "When does this semester start?",
      type: "date",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      term: "term",
      startDate: "startDate",
    },
    prepare({ term, startDate }) {
      return {
        title: term[0].toUpperCase() + term.slice(1),
        subtitle: startDate,
      };
    },
  },
});
