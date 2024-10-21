import globals from "globals";
import pluginJs from "@eslint/js";
import jest from "eslint-plugin-jest";
import jsdoc from "eslint-plugin-jsdoc";

export default [
  {
    rules: {
      "semi": ["error", "always"],
      "quotes": ["error", "single"],
      "no-unused-vars": "error",
      "no-undef": "error",
      "no-console": "warn",
      "no-extra-semi": "error",
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "no-empty": "error",
      ...jsdoc.configs.recommended.rules,
    },
    ignores: ["node_modules/", "eslint.config.js", "**/schemas/*"],
    languageOptions: {
      globals: globals.node,
    },
    plugins: { jsdoc },
  },
  
  {
    files: ["__test__/*", "**/*.test.js"],
    plugins: { jest },
    rules: {
      ...jest.configs.recommended.rules,
    },
    languageOptions: {
      globals: {
        ...globals.jest,
      }
    }
  },
  pluginJs.configs.recommended,
];