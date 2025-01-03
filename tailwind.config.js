const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontSize: {
      "display-2xl": [
        "4.5rem",
        {
          lineHeight: "1.25",
          letterSpacing: "-0.02em",
          fontWeight: "400",
        },
      ],
      "display-xl": [
        "3.75rem",
        {
          lineHeight: "1.2",
          letterSpacing: "-0.02em",
          fontWeight: "400",
        },
      ],
      "display-lg": [
        "3rem",
        {
          lineHeight: "1.25",
          letterSpacing: "-0.02em",
          fontWeight: "400",
        },
      ],
      "display-md": [
        "2.25rem",
        {
          lineHeight: "1.22",
          letterSpacing: "-0.02em",
          fontWeight: "400",
        },
      ],
      "display-sm": [
        "1.875rem",
        {
          lineHeight: "1.27",
          fontWeight: "400",
        },
      ],
      "display-xs": [
        "1.5rem",
        {
          lineHeight: "1.33",
          fontWeight: "400",
        },
      ],
      xl: [
        "1.25rem",
        {
          lineHeight: "1.5",
          fontWeight: "400",
        },
      ],
      lg: [
        "1.125rem",
        {
          lineHeight: "1.56",
          fontWeight: "400",
        },
      ],
      base: [
        "1rem",
        {
          lineHeight: "1.5",
          fontWeight: "400",
        },
      ],
      sm: [
        "0.875rem",
        {
          lineHeight: "1.43",
          fontWeight: "400",
        },
      ],
      xs: [
        "0.75rem",
        {
          lineHeight: "1.5",
          fontWeight: "400",
        },
      ],
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-Inter)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
