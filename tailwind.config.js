/* eslint-disable import/no-extraneous-dependencies */
/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const typography = require("@tailwindcss/typography");
const forms = require("@tailwindcss/forms");

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-open-sans)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [typography, forms],
};
