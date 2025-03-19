import { indexesFromUsjJsonPath, usjJsonPathFromIndexes } from "./jsonpath-indexes";

describe("USJ JSONPath Indexes", () => {
  it("should convert indexes from JSONPath", () => {
    const jsonPath = "$.content[1].content[2]";

    const indexes = indexesFromUsjJsonPath(jsonPath);

    expect(indexes).toEqual([1, 2]);
  });

  it("should throw if JSONPath doesn't start with $", () => {
    const jsonPath = ".content[1].content[2]";

    expect(() => indexesFromUsjJsonPath(jsonPath)).toThrow();
  });

  it("should convert JSONPath from indexes", () => {
    const indexes = [1, 2];

    const jsonPath = usjJsonPathFromIndexes(indexes);

    expect(jsonPath).toEqual("$.content[1].content[2]");
  });
});
