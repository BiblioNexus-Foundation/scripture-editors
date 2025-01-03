import React from "react";
import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { LexicalEditor } from "lexical";
import { ChapterVerseUpdatePlugin } from "./plugins/ChapterVerseUpdatePlugin";
import { MarkerWatcherPlugin } from "./plugins/MarkerWatcherPlugin";
import ContentEditablePlugin from "./plugins/ContentEditablePlugin";
import { ScripturalHandlersPlugin } from "shared-react/plugins/ScripturalHandlers/ScripturalHandlersPlugin";
import { ScriptureReferencePlugin } from "shared-react/plugins/ScriptureReferencePlugin";
import { scriptureNodes } from "shared/nodes/scripture/generic";
import {
  ScripturalEditorProvider,
  ScripturalInitialConfigType,
} from "./context/ScripturalEditorContext";
import { useScripturalComposerContext } from "./context/ScripturalEditorContext";

type ScripturalComposerProps = {
  initialConfig: ScripturalInitialConfigType;
  children: React.ReactNode;
};

function ScripturalComposerContent({ children }: { children: React.ReactNode }) {
  const { initialLexicalState, scripturalInitialConfig, setScriptureReference, editorRef } =
    useScripturalComposerContext();

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
          book={scripturalInitialConfig.bookCode}
          verseDepth={2}
          chapterDepth={1}
        />
        <MarkerWatcherPlugin />
        <ChapterVerseUpdatePlugin />
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
