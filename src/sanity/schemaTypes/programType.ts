import { PackageIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const programType = defineType({
  name: "program",
  title: "Program",
  type: "document",
  icon: PackageIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "acronym",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      type: "url",
      validation: (rule) => rule.required(),
    }),
  ],
});
