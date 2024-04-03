import { useEffect, useState } from "react";
import { getLexicalState, getPerf } from "shared/contentManager";
import { fetchUsfm } from "shared/contentManager/mockup/fetchUsfm";

export function useLexicalPerfState() {
  const [lexicalState, setLexicalState] = useState("");
  const [perfDocument, setPerfDocument] = useState(null);

  useEffect(() => {
    fetchUsfm({
      serverName: "dbl",
      organizationId: "bfbs",
      languageCode: "fra",
      versionId: "lsg",
      bookCode: "tit",
    }).then(async (usfm) => {
      const perf = await getPerf(usfm);
      setPerfDocument(perf);
      setLexicalState(JSON.stringify(getLexicalState(perf)));
    });
  }, []);

  return { lexicalState, perfDocument };
}
