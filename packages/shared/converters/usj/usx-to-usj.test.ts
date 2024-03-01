import {
  usjEmpty,
  usjGen1v1,
  usjGen1v1ImpliedPara,
  usxEmpty,
  usxGen1v1,
  usxGen1v1ImpliedPara,
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

  it("should convert from USX to USJ with implied paragraphs", () => {
    const usj = usxStringToUsj(usxGen1v1ImpliedPara);
    expect(usj).toEqual(usjGen1v1ImpliedPara);
  });
});
