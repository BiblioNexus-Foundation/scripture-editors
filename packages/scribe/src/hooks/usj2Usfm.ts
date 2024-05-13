import USFMParser from "sj-usfm-grammar";
import { Usj } from "shared/converters/usj/usj.model";

export const Usj2Usfm = (usj: Usj) => {
  let usfm: string;
  const parseUsj = async (usj: Usj) => {
    await USFMParser.init();
    const usfmParser = new USFMParser();
    usfm = usfmParser.usjToUsfm(usj);
    console.log({ usfm });
    return usfm;
  };
  usj && parseUsj(usj);
};
