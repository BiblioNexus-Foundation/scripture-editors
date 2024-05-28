export default {
  displayName: "platform",
  preset: "../../jest.preset.js",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "html"],
  modulePathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/lib/"],
  coverageDirectory: "../../coverage/packages/platform",
};
