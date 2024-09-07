import { LexicalComposer } from "@lexical/react/LexicalComposer";
import scriptureNodes from "shared/nodes";
import { useBibleBook } from "./useLexicalState";
import { HistoryPlugin } from "shared-react/plugins/History/HistoryPlugin";
import { useEffect, useMemo, useRef, useState } from "react";
import { getPerfHistoryUpdater } from "shared/plugins/PerfOperations/updatePerfHistory";
import { HistoryMergeListener, createEmptyHistoryState } from "shared/plugins/History";
import { PerfHandlersPlugin } from "shared-react/plugins/PerfHandlers/PerfHandlersPlugin";
import { BookStore, getLexicalState } from "shared/contentManager";
import { FlatDocument as PerfDocument } from "shared/plugins/PerfOperations/Types/Document";
import { verseBlockStyle } from "shared/styles/dynamic";

import Button from "./Components/Button";

import { emptyCrossRefence } from "./emptyNodes/crossReference";
import { createEmptyDivisionMark } from "./emptyNodes/emptyVerse";
import { emptyFootnote } from "./emptyNodes/emptyFootnote";
import { $createNodeFromSerializedNode, $insertUsfmNode } from "./emptyNodes/emptyUsfmNodes";
import { emptyHeading } from "./emptyNodes/emptyHeading";

import { $getSelection, $isRangeSelection } from "lexical";
import ContentEditablePlugin from "./Components/ContentEditablePlugin";

const theme = {
  // Theme styling goes here
};

const translationSection = {
  indent: 0,
  direction: null,
  children: [],
  format: "",
  type: "divisionmark",
  attributes: {
    "perf-type": "mark",
    "perf-subtype": "usfm:ts",
    class: "usfm:ts",
  },
  version: 1,
  tag: "span",
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
  const editorStyles = useRef<{ nonPrintable?: HTMLElement }>({});

  useEffect(() => {
    (async () => {
      if (bookHandler) {
        const perf = await bookHandler.read(bookCode);
        setPerfDocument(perf);
        console.log(perf);
        const lexicalState = getLexicalState(perf);
        console.log({ lexicalState });
        setLexicalState(JSON.stringify(lexicalState));
      }
    })();
  }, [bookHandler, bookCode]);

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
        >
          <i>download</i>
        </button>
        <Button
          onClick={(_, editor) => {
            editor.update(() => {
              $insertUsfmNode(emptyCrossRefence);
            });
          }}
        >
          \X
        </Button>
        <Button
          onClick={(_, editor) => {
            editor.update(() => {
              $insertUsfmNode(emptyFootnote);
            });
          }}
        >
          \F
        </Button>
        <Button
          onClick={(_, editor) => {
            // editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
            editor.update(
              () => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) {
                  return false;
                }
                selection.insertNodes([$createNodeFromSerializedNode(emptyHeading)]);
              },
              { skipTransforms: true, tag: "history-merge", discrete: true },
            );
          }}
        >
          \S
        </Button>

        <Button
          onClick={(_, editor) => {
            editor.update(() => {
              $insertUsfmNode(translationSection);
            });
          }}
        >
          \TS
        </Button>
        <Button
          onClick={(_, editor) => {
            editor.update(() => {
              $insertUsfmNode(createEmptyDivisionMark("chapter", "1"));
            });
          }}
        >
          \C
        </Button>
        <Button
          onClick={(_, editor) => {
            editor.update(() => {
              $insertUsfmNode(createEmptyDivisionMark("verses", "1"));
            });
          }}
        >
          \V
        </Button>
        <Button
          onClick={() => {
            verseBlockStyle.toggle();
          }}
        >
          <i>view_agenda</i>
        </Button>
        <Button
          onClick={(_, editor) => {
            console.log({ editorKey: editor.getKey() }, editorStyles.current);

            const { nonPrintable } = editorStyles.current || {};
            if (nonPrintable) {
              nonPrintable.parentElement?.removeChild(nonPrintable);
              delete editorStyles.current.nonPrintable;
              return;
            }
            const nonPrintableStyleElement = document.createElement("style");
            const editorId = editor.getKey();
            nonPrintableStyleElement.id = "styles-editor-" + editorId;
            const styles = String.raw`
            #${editorId} p.paragraph:after {
              content: "¶";
              display: inline-block;
              color: var(--pilcrow-color);
              position: absolute;
              font-family: arial;
              margin-inline-start: 0.05rem;
            }

            #${editorId} p[perf-type="paragraph"]:has(br)::after {
              top: 0;
            }

            #${editorId} [data-namespace="usfm"]:before {
              content: "\\" attr(data-marker) "";
              display: inline;
              font-size: 0.6rem;
              font-weight: 600;
              left: 0;
              padding: 0.2em;
              color: rgb(0 0 0 / 20%);
              margin-inline-end: 0.1rem;
            }

            #${editorId} [data-namespace="usfm"]:hover:before {
              color: rgb(0 0 0 / 60%);
            }

            #${editorId} span.verses:before,
            #${editorId} span.chapter:before {
              font-size: 0.6rem;
              font-weight: 600;
              left: 0;
              padding: 0.2em;
              color: rgb(0 0 0 / 20%);
              margin-inline-end: 0.1rem;
            }

            #${editorId} span.verses:hover:before,
            span.chapter:hover:before {
              color: rgb(0 0 0 / 60%);
            }

            #${editorId} span.verses:before {
              content: "\\v";
            }

            #${editorId} span.chapter:before {
              content: "\\c";
            }

            #${editorId} [perf-subtype="note_caller"] > [data-namespace="usfm"]:before {
              content: none;
              display: none;
            }
            `;
            nonPrintableStyleElement.textContent = styles;
            document.head.appendChild(nonPrintableStyleElement);
            editorStyles.current["nonPrintable"] = nonPrintableStyleElement;
          }}
        >
          <i>format_paragraph</i>
        </Button>
      </div>
      <div className={"editor-oce"}>
        <ContentEditablePlugin />
        <PerfHandlersPlugin />
        <HistoryPlugin
          onChange={handlePerfHistory as HistoryMergeListener}
          externalHistoryState={historyState}
        />
      </div>
    </LexicalComposer>
  );
}
