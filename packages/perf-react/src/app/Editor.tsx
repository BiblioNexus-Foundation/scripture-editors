import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import scriptureNodes from "shared/nodes";
import { useBibleBook } from "./useLexicalState";
import { HistoryPlugin } from "shared-react/plugins/History/HistoryPlugin";
import { useEffect, useMemo, useState } from "react";
import { getPerfHistoryUpdater } from "shared/plugins/PerfOperations/updatePerfHistory";
import { HistoryMergeListener, createEmptyHistoryState } from "shared/plugins/History";
import { PerfHandlersPlugin } from "shared-react/plugins/PerfHandlers/PerfHandlersPlugin";
import { BookStore, getLexicalState } from "shared/contentManager";
import { PerfDocument } from "shared/plugins/PerfOperations/perfTypes";

const theme = {
  // Theme styling goes here
};

function onError(error: Error) {
  console.error(error);
}

const bookCode = "tit";

export default function Editor() {
  const bookHandler = useBibleBook({
    serverName: "dbl",
    organizationId: "bfbs",
    languageCode: "fra",
    versionId: "lsg",
    bookCode,
  }) as BookStore | null;
  const [lexicalState, setLexicalState] = useState("");
  const [perfDocument, setPerfDocument] = useState<PerfDocument | null>(null);

  useEffect(() => {
    (async () => {
      if (bookHandler) {
        const perf = await bookHandler.read(bookCode);
        setPerfDocument(perf);
        setLexicalState(JSON.stringify(getLexicalState(perf)));
      }
    })();
  }, [bookHandler]);

  const initialConfig = {
    namespace: "ScriptureEditor",
    theme,
    editorState: lexicalState,
    onError,
    nodes: [...scriptureNodes],
  };

  const historyState = useMemo(() => createEmptyHistoryState(), []);

  const handlePerfHistory = useMemo(
    () => (perfDocument ? getPerfHistoryUpdater(perfDocument) : null),
    [perfDocument],
  );

  return !lexicalState || !perfDocument ? null : (
    <LexicalComposer initialConfig={initialConfig}>
      <button
        onClick={() => {
          async function getUsfmFromPerf() {
            if (!bookHandler || !historyState?.current?.perfDocument) return;
            await bookHandler.sideload(bookCode, historyState.current.perfDocument as PerfDocument);
            const newUsfm: string = await bookHandler.readUsfm(bookCode);
            console.log("NEW USFM", { output: newUsfm });
            const downloadUsfm = (usfm: string, filename: string) => {
              const element = document.createElement("a");
              const file = new Blob([usfm], { type: "text/plain" });
              element.href = URL.createObjectURL(file);
              element.download = filename;
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            };
            const timestamp = new Date().getTime();
            downloadUsfm(newUsfm, `usfm_${bookCode}_${timestamp}.txt`);
          }
          getUsfmFromPerf();
        }}
        style={{ marginBottom: "1rem" }}
      >
        Download USFM
      </button>
      <div className={"editor-oce"}>
        <RichTextPlugin
          contentEditable={
            <div className="editor">
              <ContentEditable className="contentEditable" />
            </div>
          }
          placeholder={<div className="placeholder">Enter some text...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <PerfHandlersPlugin />
        <HistoryPlugin
          onChange={handlePerfHistory as HistoryMergeListener}
          externalHistoryState={historyState}
        />
      </div>
    </LexicalComposer>
  );
}
