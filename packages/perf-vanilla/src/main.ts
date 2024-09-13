import "shared/styles/perf-app.css";
import "shared/styles/perf-editor.css";
import { createEditor } from "lexical";
import scriptureNodes from "shared/nodes";
import { registerRichText } from "@lexical/rich-text";
import { getLexicalState, getBookHandler } from "shared/contentManager";
import { fetchUsfm } from "shared/contentManager/mockup/fetchUsfm";
import { createEmptyHistoryState, registerHistory } from "shared/plugins/History";
import { getPerfHistoryUpdater } from "shared/plugins/PerfOperations/updatePerfHistory";
import { registerDefaultPerfHandlers } from "shared/plugins/PerfHandlers";

(async () => {
  // Configuration for the editor
  const config = {
    namespace: "PerfVanillaEditor",
    theme: {},
    nodes: [...scriptureNodes],
    onError: console.error,
  };

  const documentData = {
    serverName: "ebible",
    organizationId: "web",
    languageCode: "en",
    versionId: "web",
    bookCode: "rev",
  };

  const usfm = await fetchUsfm(documentData);
  const bookHandler = await getBookHandler({
    usfm,
    ...documentData,
  });
  const perfSource = await bookHandler.read(documentData.bookCode);
  const lexicalState = JSON.stringify(getLexicalState(perfSource));

  //Initialize editor
  const editor = createEditor(config);
  editor.setEditorState(editor.parseEditorState(lexicalState), {
    tag: "history-merge",
  });
  registerRichText(editor);
  registerDefaultPerfHandlers(editor);

  registerHistory(editor, createEmptyHistoryState(), getPerfHistoryUpdater(perfSource), 1000);
  editor.setRootElement(document.getElementById("editor"));
})();

const infoBar = document.createElement("div");
infoBar.classList.add("info-bar");
infoBar.classList.add("noprint");

const info = document.createElement("span");
info.classList.add("info");
infoBar.appendChild(info);

info.innerText = "";

document.body.appendChild(infoBar);

//None Lexical event listener
document.addEventListener("click", function (event) {
  // Check if the hovered element matches the selector
  const _target = event.target as HTMLElement;
  const target = _target.closest("[perf-type]");
  const targetAttributes = Array.from(target?.attributes ?? []);
  const perfAttributes = targetAttributes.filter((attr) =>
    ["perf-type", "perf-subtype", "perf-subtype-ns"].includes(attr.name),
  );
  if (perfAttributes.length === 0) return;
  const perfAttributeNames = perfAttributes.map((attr) => attr.value);
  info.innerText = `${perfAttributeNames.join("/")}`;
});
