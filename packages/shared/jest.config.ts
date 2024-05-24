export default {
  displayName: "shared",
  preset: "../../jest.preset.js",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "html"],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  coverageDirectory: "../../coverage/packages/shared",
};
