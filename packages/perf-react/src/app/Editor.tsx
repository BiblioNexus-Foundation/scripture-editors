import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import scriptureNodes from "shared/nodes";
import { useBibleBook } from "./useLexicalState";
import { HistoryPlugin } from "shared-react/plugins/History/HistoryPlugin";
import { useEffect, useMemo, useRef, useState } from "react";
import { getPerfHistoryUpdater } from "shared/plugins/PerfOperations/updatePerfHistory";
import { HistoryMergeListener, createEmptyHistoryState } from "shared/plugins/History";
import { PerfHandlersPlugin } from "shared-react/plugins/PerfHandlers/PerfHandlersPlugin";
import { BookStore, getLexicalState } from "shared/contentManager";
import { FlatDocument as PerfDocument } from "shared/plugins/PerfOperations/Types/Document";
import editorMarkersMap from "shared/data/editorMarkersMap";

import Button from "./Components/Button";

import { $getNodeByKey, $getSelection, LexicalEditor, REDO_COMMAND, UNDO_COMMAND } from "lexical";
import ContentEditablePlugin from "./Components/ContentEditablePlugin";
import { downloadUsfm } from "./downloadUsfm";
import OnEditorUpdate from "./Components/OnSelectionChange";

import { $isUsfmElementNode } from "shared/nodes/UsfmElementNode";
import { FloatingMenuPlugin } from "./Components/FloatingMenuPlugin";
import { getMarkerData } from "shared/data/markersData";
import ScriptureReferencePlugin, {
  ScriptureReference,
} from "./Components/ScriptureReferencePlugin";

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
    return selectedMarker && scriptureReference
      ? editorMarkersMap[selectedMarker]?.CharacterStyling?.map((marker) => {
          const { builder } = getMarkerData(marker);
          return {
            label: marker,
            action: (editor: LexicalEditor) => builder({ editor, reference: scriptureReference }),
          };
        })
      : null;
  }, [selectedMarker, scriptureReference]);

  const toolbarMarkerSections = useMemo(() => {
    return selectedMarker && scriptureReference
      ? Object.entries(editorMarkersMap[selectedMarker] ?? {}).reduce(
          (items, [category, data]) => {
            if (["SpecialText", "CharacterStyling"].includes(category))
              items[category] = data.map((marker) => {
                const { builder } = getMarkerData(marker);
                return {
                  label: marker,
                  action: (editor: LexicalEditor) =>
                    builder({ editor, reference: scriptureReference }),
                };
              });
            return items;
          },
          {} as { [key: string]: { label: string; action: (editor: LexicalEditor) => void }[] },
        )
      : null;
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
            //This is the selected elment expected to be a usfm element;
            const selectedElement = startNode?.getCommonAncestor(endNode);
            //This is the parentUsfmElement which can give me information of which tags can be used to replace current tag.
            // const parentElement = selectedElement?.getParent();
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
      {floatingMenuItems ? <FloatingMenuPlugin items={floatingMenuItems} /> : null}
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
