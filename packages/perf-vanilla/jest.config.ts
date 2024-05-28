export default {
  displayName: "perf-vanilla",
  preset: "../../jest.preset.js",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "html"],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  coverageDirectory: "../../coverage/packages/perf-vanilla",
};
