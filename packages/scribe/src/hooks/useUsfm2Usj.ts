import { Usj } from "@biblionexus-foundation/scripture-utilities";
import { useEffect, useState } from "react";
import USFMParser from "sj-usfm-grammar";

export const useUsfm2Usj = () => {
  const [usfm, setUsfm] = useState<string>();
  const [usj, setUsj] = useState<Usj>();

  const parseUSFM = async (usfm: string) => {
    await USFMParser.init();
    const usfmParser = new USFMParser();
    const usj = usfmParser.usfmToUsj(usfm);
    usj && setUsj(usj);
  };

  useEffect(() => {
    import("../data/tit.usfm").then((data) => {
      setUsfm(data.default);
    });
  }, []);

  useEffect(() => {
    (async () => usfm && parseUSFM(usfm))();
  }, [usfm]);

  return { usj };
};
