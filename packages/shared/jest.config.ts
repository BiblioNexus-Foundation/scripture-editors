export default {
  displayName: "shared",
  preset: "../../jest.preset.js",
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "html"],
  coverageDirectory: "../../coverage/packages/shared",
};
