import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import scriptureNodes from "shared/nodes";
import { useBibleBook } from "./useLexicalState";
import { HistoryPlugin } from "shared-react/plugins/History/HistoryPlugin";
import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { getPerfHistoryUpdater } from "shared/plugins/PerfOperations/updatePerfHistory";
import { HistoryMergeListener, createEmptyHistoryState } from "shared/plugins/History";
import { PerfHandlersPlugin } from "shared-react/plugins/PerfHandlers/PerfHandlersPlugin";
import { BookStore, getLexicalState } from "shared/contentManager";
import { FlatDocument as PerfDocument } from "shared/plugins/PerfOperations/Types/Document";

import Button from "./Components/Button";

import {
  $getNodeByKey,
  $getSelection,
  LexicalEditor,
  LexicalNode,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import ContentEditablePlugin from "./Components/ContentEditablePlugin";
import { downloadUsfm } from "./downloadUsfm";
import OnEditorUpdate from "./Components/OnEditorUpdate";

import { $isUsfmElementNode } from "shared/nodes/UsfmElementNode";
import { ScriptureReference } from "shared/utils/get-marker-action.model";
import { getUsfmMarkerAction } from "shared/utils/usfm/getUsfmMarkerAction";
import ScriptureReferencePlugin from "shared-react/plugins/ScriptureReferencePlugin";
import getMarker from "shared/utils/usfm/getMarker";
import PerfNodesMenuPlugin from "shared-react/plugins/PerfNodesMenuPlugin";

import { CursorHandlerPlugin } from "shared-react/plugins/CursorHandlerPlugin";

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
  const [selectedMarker, setSelectedMarker] = useState<string>();
  const [perfDocument, setPerfDocument] = useState<PerfDocument | null>(null);
  const [scriptureReference, setScriptureReference] = useState<ScriptureReference | null>({
    book: bookCode,
    chapterNum: 1,
    verseNum: 1,
  });
  const [shouldUseCursorHelper, setShouldUseCursorHelper] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);
  const [contextMenuKey, setContextMenuKey] = useState<string>("\\");

  const handleKeyPress = (event: KeyboardEvent) => {
    setContextMenuKey(event.key);
  };

  const handleButtonClick = () => {
    document.addEventListener("keydown", handleKeyPress, { once: true });
  };

  useEffect(() => {
    (async () => {
      if (bookHandler) {
        const perf = await bookHandler.read(bookCode);
        setPerfDocument(perf);

        const lexicalState = getLexicalState(perf);

        setLexicalState(JSON.stringify(lexicalState));
      }
    })();
  }, [bookHandler, bookCode]);

  const initialConfig: InitialConfigType = {
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
    element?.classList.toggle(className);

  const toolbarMarkerSections = useMemo(() => {
    if (!selectedMarker || !scriptureReference) return null;
    const marker = getMarker(selectedMarker);
    if (!marker?.children) return null;

    return Object.entries(marker.children).reduce<{
      [key: string]: {
        label: string | ReactElement;
        action: (editor: LexicalEditor) => void;
        description: string;
      }[];
    }>((items, [category, markers]) => {
      if (["CharacterStyling"].includes(category)) {
        items[category] = markers.map((marker) => {
          const markerData = getMarker(marker);
          const { action } = getUsfmMarkerAction(marker, markerData);
          return {
            label: marker,
            description: markerData?.description ?? "",
            action: (editor: LexicalEditor) => action({ editor, reference: scriptureReference }),
          };
        });
      }
      return items;
    }, {});
  }, [selectedMarker, scriptureReference]);

  return !lexicalState || !perfDocument ? null : (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="toolbar noprint">
        <div className={"toolbar-section"}>
          <Button onClick={(_, editor) => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
            <i>undo</i>
          </Button>
          <Button onClick={(_, editor) => editor.dispatchCommand(REDO_COMMAND, undefined)}>
            <i>redo</i>
          </Button>
          <hr />
          <button onClick={() => downloadUsfm(bookHandler, historyState, bookCode)}>
            <i>download</i>
          </button>
          <hr />
          <button
            onClick={(e) => {
              toggleClass(editorRef.current, "verse-blocks");
              toggleClass(e.currentTarget, "active");
            }}
          >
            <i>view_agenda</i>
          </button>
          <button
            className="active"
            onClick={(e) => {
              toggleClass(editorRef.current, "with-markers");
              toggleClass(e.currentTarget, "active");
            }}
          >
            <i>format_paragraph</i>
          </button>
          <button
            className={shouldUseCursorHelper ? "active" : undefined}
            onClick={() => setShouldUseCursorHelper((current) => !current)}
          >
            <i>highlight_text_cursor</i>
          </button>
          <hr />
        </div>
        <div className={"toolbar-section"}>
          <button onClick={handleButtonClick}>
            <i>keyboard_command_key</i>: {contextMenuKey}
          </button>
          <span className="info">{selectedMarker ?? "•"}</span>
          <span className="info">
            {bookCode}{" "}
            {scriptureReference
              ? `${scriptureReference?.chapterNum}:${scriptureReference?.verseNum}`
              : null}
          </span>
          <hr />
        </div>

        {toolbarMarkerSections &&
          Object.entries(toolbarMarkerSections).map(([sectionName, items]) => {
            return (
              <div key={"toolbar-" + sectionName} className={"toolbar-section"}>
                {items.map((item) => (
                  <Button
                    key={`${item.label}-toolbar`}
                    className={`${sectionName}`}
                    onClick={(_, editor) => item.action(editor)}
                    data-marker={item.label}
                    title={item.description}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            );
          })}
      </div>
      {shouldUseCursorHelper && (
        <CursorHandlerPlugin
          updateTags={["history-merge"]}
          canContainPlaceHolder={(node: LexicalNode) => node.getType() !== "graft"}
        />
      )}
      <OnEditorUpdate
        updateListener={({ editorState }) => {
          editorState.read(() => {
            const selection = $getSelection();
            if (!selection) return;
            const startEndPoints = selection.getStartEndPoints();
            if (!startEndPoints) return;
            const startNode = $getNodeByKey(startEndPoints[0].key);
            const endNode = $getNodeByKey(startEndPoints[1].key);
            if (!startNode || !endNode) return;
            //This is the selected element expected to be a usfm element;
            const selectedElement = startNode.getCommonAncestor(endNode);
            if ($isUsfmElementNode(selectedElement)) {
              setSelectedMarker(selectedElement.getAttribute("data-marker"));
            }
          });
        }}
      />
      <ScriptureReferencePlugin
        book={bookCode}
        onChangeReference={(reference) => {
          setScriptureReference(reference);
        }}
      />
      {scriptureReference && selectedMarker ? (
        <PerfNodesMenuPlugin
          trigger={contextMenuKey}
          scriptureReference={scriptureReference}
          contextMarker={selectedMarker}
        />
      ) : null}

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
