import {
  usjEmpty,
  usjGen1v1,
  usjGen1v1ImpliedPara,
  usjGen1v1ImpliedParaEmpty,
  usjGen1v1Nonstandard,
  usjGen1v1Whitespace,
  usxEmpty,
  usxGen1v1,
  usxGen1v1ImpliedPara,
  usxGen1v1ImpliedParaEmpty,
  usxGen1v1Nonstandard,
  usxGen1v1Whitespace,
} from "./converter-test.data";
import { usxStringToUsj } from "./usx-to-usj";

describe("USX to USJ Converter", () => {
  it("should convert from empty USX to USJ", () => {
    const usj = usxStringToUsj(usxEmpty);
    expect(usj).toEqual(usjEmpty);
  });

  it("should convert from USX to USJ", () => {
    const usj = usxStringToUsj(usxGen1v1);
    expect(usj).toEqual(usjGen1v1);
  });

  it("should convert from USX to USJ with empty implied paragraphs", () => {
    const usj = usxStringToUsj(usxGen1v1ImpliedParaEmpty);
    expect(usj).toEqual(usjGen1v1ImpliedParaEmpty);
  });

  it("should convert from USX to USJ with implied paragraphs", () => {
    const usj = usxStringToUsj(usxGen1v1ImpliedPara);
    expect(usj).toEqual(usjGen1v1ImpliedPara);
  });

  it("should convert from USX to USJ with special whitespace", () => {
    const usj = usxStringToUsj(usxGen1v1Whitespace);
    expect(usj).toEqual(usjGen1v1Whitespace);
  });

  it("should convert from USX to USJ with nonstandard features", () => {
    const usj = usxStringToUsj(usxGen1v1Nonstandard);
    expect(usj).toEqual(usjGen1v1Nonstandard);
  });
});
