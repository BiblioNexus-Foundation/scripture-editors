import { Usj } from "@biblionexus-foundation/scripture-utilities";
import USFMParser from "sj-usfm-grammar";

USFMParser.init();

export const usfm2Usj = (usfm: string): Usj => {
  const parseUsfm = (usfm: string): Usj => {
    if (!USFMParser.language) {
      return {} as Usj;
    }
    const usfmParser = new USFMParser();
    return usfmParser.usfmToUsj(usfm);
  };
  const usj: Usj = usfm ? parseUsfm(usfm) : ({} as Usj);
  return usj;
};
