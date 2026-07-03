import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.(spec|e2e-spec)\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  testEnvironment: "node",
  // Integration tests call the live Dropbox Sign API (test mode) — its
  // latency routinely exceeds the 5s default and causes flaky timeouts.
  testTimeout: 30000,
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};

export default config;
