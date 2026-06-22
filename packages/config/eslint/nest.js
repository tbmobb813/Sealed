/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  ...require("./base.js"),
  {
    languageOptions: {
      globals: {
        node: true,
      },
    },
    rules: {
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
];
