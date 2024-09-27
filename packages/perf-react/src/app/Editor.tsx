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

import { $getNodeByKey, $getSelection, LexicalEditor, REDO_COMMAND, UNDO_COMMAND } from "lexical";
import ContentEditablePlugin from "./Components/ContentEditablePlugin";
import { downloadUsfm } from "./downloadUsfm";
import OnEditorUpdate from "./Components/OnEditorUpdate";

import { $isUsfmElementNode } from "shared/nodes/UsfmElementNode";
import { getMarkerAction } from "shared/utils/usfm/getMarkerAction";
import ScriptureReferencePlugin, {
  ScriptureReference,
} from "./Components/ScriptureReferencePlugin";
import TypeaheadPlugin from "./Components/Typeahead/TypeaheadPlugin";
import getMarker from "shared/utils/usfm/getMarker";

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
    chapter: 1,
    verse: 1,
  });
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
        console.log(perf);
        const lexicalState = getLexicalState(perf);
        console.log({ lexicalState });
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
    element && element.classList.toggle(className);

  const floatingMenuItems = useMemo(() => {
    if (!selectedMarker || !scriptureReference) return undefined;
    const marker = getMarker(selectedMarker);
    if (!marker?.children) return undefined;

    return Object.entries(marker.children).flatMap(([_, markers]) =>
      markers.map((marker) => {
        const markerData = getMarker(marker);
        const { action } = getMarkerAction(marker, markerData);
        return {
          name: marker,
          label: marker,
          description: markerData?.description ?? "",
          action: (editor: LexicalEditor) => action({ editor, reference: scriptureReference }),
        };
      }),
    );
  }, [selectedMarker, scriptureReference]);

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
          const { action } = getMarkerAction(marker, markerData);
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
          <button onClick={() => toggleClass(editorRef.current, "verse-blocks")}>
            <i>view_agenda</i>
          </button>
          <button onClick={() => toggleClass(editorRef.current, "with-markers")}>
            <i>format_paragraph</i>
          </button>
          <hr />
        </div>
        <div className={"toolbar-section"}>
          <button onClick={handleButtonClick}>
            <i>keyboard_command_key</i>: {contextMenuKey}
          </button>
          <span className="info">{selectedMarker ? selectedMarker : "•"}</span>
          <span className="info">
            {bookCode}{" "}
            {scriptureReference
              ? `${scriptureReference?.chapter}:${scriptureReference?.verse}`
              : null}
          </span>
          <hr />
        </div>

        {toolbarMarkerSections &&
          Object.entries(toolbarMarkerSections).map(([sectionName, items]) => {
            return (
              <div className={"toolbar-section"}>
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
            const selectedElement = startNode?.getCommonAncestor(endNode);
            if ($isUsfmElementNode(selectedElement)) {
              setSelectedMarker(selectedElement.getAttribute("data-marker"));
            }
          });
        }}
      />
      <ScriptureReferencePlugin
        onChangeReference={(reference) => {
          setScriptureReference(reference);
        }}
      />
      <TypeaheadPlugin trigger={contextMenuKey} items={floatingMenuItems} />
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
