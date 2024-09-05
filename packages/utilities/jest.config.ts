/* eslint-disable */
export default {
  displayName: "utilities",
  preset: "../../jest.preset.js",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "html"],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  coverageDirectory: "../../coverage/packages/utilities",
};
