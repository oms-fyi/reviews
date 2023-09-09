/* eslint-disable import/no-extraneous-dependencies */
/** @type {import('tailwindcss').Config} */
const typography = require("@tailwindcss/typography");
const forms = require("@tailwindcss/forms");

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cookie: ["Cookie", "cursive"],
      },
    },
  },
  plugins: [typography, forms],
};
