module.exports = {
  extends: ["next/core-web-vitals", "eslint:recommended", "prettier"],
  root: true,
  parserOptions: {
    project: true,
  },
  overrides: [
    {
      plugins: ["@typescript-eslint"],
      extends: [],
      files: ["./**/*.{ts,tsx}"],
    },
  ],
};
