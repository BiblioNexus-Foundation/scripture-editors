import USFMParser from "sj-usfm-grammar";
import { Usj } from "shared/converters/usj/usj.model";

// export const Usj2Usfm = (usj: Usj) => {
//   let usfm: string;
//   const parseUsj = async (usj: Usj) => {
//     await USFMParser.init();
//     const usfmParser = new USFMParser();
//     usfm = usfmParser.usjToUsfm(usj);
//     return usfm;
//   };
//   (async () => {
//     usfm = usj && (await parseUsj(usj));
//     return usfm;
//   })();
// };

export const Usj2Usfm = async (usj: Usj): Promise<string> => {
  // let usfm: string;
  const parseUsj = async (usj: Usj): Promise<string> => {
    await USFMParser.init();
    const usfmParser = new USFMParser();
    return usfmParser.usjToUsfm(usj);
  };
  const usfm: string = usj ? await parseUsj(usj) : "";
  return usfm;
};
