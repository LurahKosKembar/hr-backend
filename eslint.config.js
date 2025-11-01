import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    files: ["**/*.ts"],
    plugins: {
      "@typescript-eslint": tseslint,
      prettier: prettierPlugin,
    },
    extends: ["plugin:@typescript-eslint/recommended", "prettier"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "no-console": "warn",
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "prettier/prettier": "error",
      "no-tabs": "error",
      indent: ["error", 2, { SwitchCase: 1 }],
    },
    languageOptions: {
      parser: tsparser,
      sourceType: "module",
    },
  },
];
