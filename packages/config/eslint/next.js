/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  ...require("./base.js"),
  {
    languageOptions: {
      globals: {
        browser: true,
        node: true,
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
];
