/* eslint-disable import/no-extraneous-dependencies */
/** @type {import('tailwindcss').Config} */
const typography = require('@tailwindcss/typography');
const forms = require('@tailwindcss/forms');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [typography, forms],
};
