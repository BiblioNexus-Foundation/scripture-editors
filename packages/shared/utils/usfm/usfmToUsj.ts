import { Usj } from "@biblionexus-foundation/scripture-utilities";
import USFMParser from "sj-usfm-grammar";

USFMParser.init();

function parseUsfm(usfm: string): Usj {
  if (!USFMParser.language) throw new Error("The USFMParser language is not defined.");

  const usfmParser = new USFMParser();
  return usfmParser.usfmToUsj(usfm);
}

export const usfm2Usj = (usfm: string): Usj => {
  if (!usfm) throw new Error("Make sure the USFM argument is defined and not empty.");

  return parseUsfm(usfm);
};
