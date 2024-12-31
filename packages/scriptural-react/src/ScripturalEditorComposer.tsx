import React from "react";
import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { $getNodeByKey, $getSelection, EditorState, LexicalEditor } from "lexical";
import ContentEditablePlugin from "./plugins/ContentEditablePlugin";
import { ScripturalHandlersPlugin } from "shared-react/plugins/ScripturalHandlers/ScripturalHandlersPlugin";
import { ScriptureReferencePlugin } from "shared-react/plugins/ScriptureReferencePlugin";
import { scriptureNodes } from "shared/nodes/scripture/generic";
import {
  ScripturalEditorProvider,
  ScripturalInitialConfigType,
} from "./context/ScripturalEditorContext";
import { useScripturalComposerContext } from "./context/ScripturalEditorContext";
import OnEditorUpdate from "shared-react/plugins/OnEditorUpdate";
import { $isScriptureElementNode } from "shared/nodes/scripture/generic/ScriptureElementNode";
import { $isUsfmElementNode } from "shared/nodes/UsfmElementNode";

type ScripturalComposerProps = {
  initialConfig: ScripturalInitialConfigType;
  children: React.ReactNode;
};

function ScripturalComposerContent({ children }: { children: React.ReactNode }) {
  const {
    initialLexicalState,
    scripturalInitialConfig,
    setScriptureReference,
    editorRef,
    setSelectedMarker,
  } = useScripturalComposerContext();

  const initialConfig: InitialConfigType = {
    namespace: "ScriptureEditor",
    theme: scripturalInitialConfig.theme,
    editorState: initialLexicalState,
    onError: (error: Error, _editor: LexicalEditor) =>
      scripturalInitialConfig.onError(error, _editor),
    nodes: [...scriptureNodes],
    editable: scripturalInitialConfig.editable,
  };

  return (
    initialLexicalState && (
      <LexicalComposer initialConfig={initialConfig}>
        {children}
        <ScriptureReferencePlugin
          onChangeReference={(reference) => {
            setScriptureReference(reference);
          }}
          verseDepth={2}
          chapterDepth={1}
        />
        <OnEditorUpdate
          updateListener={({ editorState }: { editorState: EditorState }) => {
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
              if ($isUsfmElementNode(selectedElement) || $isScriptureElementNode(selectedElement)) {
                setSelectedMarker(selectedElement.getAttribute("data-marker"));
              }
            });
          }}
        />
        <div className={"scriptural-editor"}>
          <ContentEditablePlugin ref={editorRef} />
          <ScripturalHandlersPlugin />
        </div>
      </LexicalComposer>
    )
  );
}

export default function ScripturalComposer({ initialConfig, children }: ScripturalComposerProps) {
  return (
    <ScripturalEditorProvider initialConfig={initialConfig}>
      <ScripturalComposerContent children={children} />
    </ScripturalEditorProvider>
  );
}
