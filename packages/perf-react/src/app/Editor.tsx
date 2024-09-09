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

import Button from "./Components/Button";

import { emptyCrossRefence } from "./emptyNodes/crossReference";
import { createEmptyDivisionMark } from "./emptyNodes/emptyVerse";
import { emptyFootnote } from "./emptyNodes/emptyFootnote";
import { $createNodeFromSerializedNode, $insertUsfmNode } from "./emptyNodes/emptyUsfmNodes";
import { emptyHeading } from "./emptyNodes/emptyHeading";

import { $getSelection, $isRangeSelection } from "lexical";
import ContentEditablePlugin from "./Components/ContentEditablePlugin";
import { downloadUsfm } from "./downloadUsfm";

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
  const editorRef = useRef<HTMLDivElement>(null);

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

  const toggleClass = (element: HTMLElement | null, className: string) =>
    element && element.classList.toggle(className);

  return !lexicalState || !perfDocument ? null : (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="toolbar noprint">
        <button onClick={() => downloadUsfm(bookHandler, historyState, bookCode)}>
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
        <button onClick={() => toggleClass(editorRef.current, "verse-blocks")}>
          <i>view_agenda</i>
        </button>
        <button onClick={() => toggleClass(editorRef.current, "with-markers")}>
          <i>format_paragraph</i>
        </button>
      </div>
      <div className={"editor-oce"}>
        <ContentEditablePlugin ref={editorRef} />
        <PerfHandlersPlugin />
        <HistoryPlugin
          onChange={handlePerfHistory as HistoryMergeListener}
          externalHistoryState={historyState}
        />
      </div>
    </LexicalComposer>
  );
}
