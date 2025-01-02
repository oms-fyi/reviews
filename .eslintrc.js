module.exports = {
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "prettier",
    "plugin:storybook/recommended"
  ],
  root: true,
  parserOptions: {
    project: true,
  },
  overrides: [
    {
      plugins: ["@typescript-eslint"],
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      files: ["./**/*.{ts,tsx}"],
    },
  ],
};
