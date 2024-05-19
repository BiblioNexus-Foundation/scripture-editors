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
import { FlatDocument as PerfDocument } from "shared/plugins/PerfOperations/Types/Document";

import Button from "./Components/Button";
import { $parseSerializedNode, $insertNodes, $isRootOrShadowRoot } from "lexical";

import { $wrapNodeInElement } from "@lexical/utils";
import { $createGraftNode } from "shared/nodes/GraftNode";
import { emptyCrossRefence } from "./emptyNodes/crossReference";

const theme = {
  // Theme styling goes here
};

function onError(error: Error) {
  console.error(error);
}

export default function Editor({
  serverName,
  organizationId,
  languageCode,
  versionId,
  bookCode,
  editable = true,
}: {
  serverName: string;
  organizationId: string;
  languageCode: string;
  versionId: string;
  bookCode: string;
  editable?: boolean;
}) {
  const bookHandler = useBibleBook({
    serverName,
    organizationId,
    languageCode,
    versionId,
    bookCode,
  }) as BookStore | null;
  const [lexicalState, setLexicalState] = useState("");
  const [perfDocument, setPerfDocument] = useState<PerfDocument | null>(null);

  useEffect(() => {
    (async () => {
      if (bookHandler) {
        const perf = await bookHandler.read(bookCode);
        const alignmentData = bookHandler;
        console.log({ alignmentData });
        setPerfDocument(perf);
        console.log(perf);
        const lexicalState = getLexicalState(perf);
        console.log({ lexicalState });
        setLexicalState(JSON.stringify(lexicalState));
      }
    })();
  }, [bookHandler]);

  const initialConfig = {
    namespace: "ScriptureEditor",
    theme,
    editorState: lexicalState,
    onError,
    nodes: [...scriptureNodes],
    editable,
  };

  const historyState = useMemo(() => createEmptyHistoryState(), []);

  const handlePerfHistory = useMemo(
    () => (perfDocument ? getPerfHistoryUpdater(perfDocument) : null),
    [perfDocument],
  );

  return !lexicalState || !perfDocument ? null : (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="toolbar noprint">
        <button
          onClick={() => {
            async function getUsfmFromPerf() {
              if (!bookHandler || !historyState?.current?.perfDocument) return;
              await bookHandler.sideload(
                bookCode,
                historyState.current.perfDocument as PerfDocument,
              );
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
        <Button
          onClick={(_, editor) => {
            editor.update(() => {
              const newNode = $parseSerializedNode(emptyCrossRefence);
              $insertNodes([newNode]);
              if ($isRootOrShadowRoot(newNode.getParentOrThrow())) {
                $wrapNodeInElement(newNode, $createGraftNode).selectEnd();
              }
            });
          }}
        >
          Add Cross Reference
        </Button>
      </div>
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
