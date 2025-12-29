const prettierConfig = {
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  importOrder: ["<THIRD_PARTY_MODULES>", "^src", "^[.]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

export default prettierConfig;
