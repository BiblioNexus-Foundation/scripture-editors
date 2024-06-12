import {
  usjEmpty,
  usjGen1v1,
  usjGen1v1ImpliedPara,
  usxEmpty,
  usxGen1v1,
  usxGen1v1ImpliedPara,
} from "./converter-test.data";
import { usjToUsxString } from "./usj-to-usx";
import { usxStringToUsj } from "./usx-to-usj";

const SELF_CLOSING_ELEMENT_WHITESPACE = /(?!")\s+(?=\/>)/g;
const INTER_ELEMENT_WHITESPACE = /(?!>)\s{2,}(?=<)/g;
const LAST_ELEMENT_WHITESPACE = /(?!>)\s+(?=<\/usx>)/g;

function removeXmlWhitespace(xml: string): string {
  return xml
    .replaceAll(SELF_CLOSING_ELEMENT_WHITESPACE, "")
    .replaceAll(INTER_ELEMENT_WHITESPACE, "")
    .replaceAll(LAST_ELEMENT_WHITESPACE, "")
    .trim();
}

describe("USJ to USX Converter", () => {
  it("should convert from empty USJ to USX", () => {
    const usx = usjToUsxString(usjEmpty);
    expect(usx).toEqual(removeXmlWhitespace(usxEmpty));
  });

  it("should convert from USJ to USX", () => {
    const usx = usjToUsxString(usjGen1v1);
    expect(usx).toEqual(removeXmlWhitespace(usxGen1v1));
  });

  it("should convert from USJ with implied paragraphs to USX", () => {
    const usx = usjToUsxString(usjGen1v1ImpliedPara);
    expect(usx).toEqual(removeXmlWhitespace(usxGen1v1ImpliedPara));
  });

  it("should convert from USJ to USX and back", () => {
    const usx = usjToUsxString(usjGen1v1);
    const usj = usxStringToUsj(usx);
    expect(usj).toEqual(usjGen1v1);
  });
});
