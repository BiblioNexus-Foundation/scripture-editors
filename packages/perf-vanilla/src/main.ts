import "./style.css";
import { createEditor } from "lexical";
import scriptureNodes from "shared/nodes";
import { EmoticonNode } from "shared/nodes/EmoticonNode";
import { getLexicalState, getPerf } from "shared/contentManager";
import { fetchUsfm } from "shared/contentManager/mockup/fetchUsfm";
import { createEmptyHistoryState, registerHistory } from "shared/plugins/History";
import { getPerfHistoryUpdater } from "shared/plugins/PerfOperations/updatePerfHistory";

(async () => {
  // Configuration for the editor
  const config = {
    namespace: "PerfVanillaEditor",
    theme: {},
    nodes: [...scriptureNodes, EmoticonNode],
    onError: console.error,
  };

  const usfm = await fetchUsfm({
    serverName: "dbl",
    organizationId: "bfbs",
    languageCode: "fra",
    versionId: "lsg",
    bookCode: "tit",
  });
  const perfSource = await getPerf(usfm);
  const lexicalState = JSON.stringify(getLexicalState(perfSource));

  //Initialize editor
  const editor = createEditor(config);
  editor.setEditorState(editor.parseEditorState(lexicalState), {
    tag: "history-merge",
  });

  registerHistory(editor, createEmptyHistoryState(), getPerfHistoryUpdater(perfSource), 1000);
  editor.setRootElement(document.getElementById("editor"));
})();
