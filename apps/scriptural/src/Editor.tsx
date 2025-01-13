import { useMemo } from "react";

import {
  ScripturalEditorComposer,
  HistoryPlugin,
  CursorHandlerPlugin,
  ScripturalNodesMenuPlugin,
  DEFAULT_SCRIPTURAL_BASE_SETTINGS,
  useBaseSettings,
  ScripturalInitialConfigType,
} from "@scriptural/react";
import "@scriptural/react/styles/scriptural-editor.css";
import "@scriptural/react/styles/nodes-menu.css";

import "./editor.css";
import { CustomToolbar } from "./CustomToolbar";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { UsjDocument } from "@scriptural/react/internal-packages/shared/converters/usj/core/usj";
import { EditorState, LexicalEditor } from "lexical";

function onError(error: any) {
  console.error(error);
}

export function Editor({
  usj,
  initialState,
  bookCode,
  editable = true,
  children,
  onSave,
  onHistoryChange,
}: {
  usj?: UsjDocument;
  initialState?: null | string | EditorState | ((editor: LexicalEditor) => void);
  bookCode: string;
  editable?: boolean;
  children?: React.ReactNode;
  onSave?: (newUsj: UsjDocument) => void;
  onHistoryChange?: Parameters<typeof HistoryPlugin>[0]["onChange"];
}) {
  const initialConfig = useMemo<ScripturalInitialConfigType>(() => {
    return {
      bookCode,
      usj,
      onError,
      editable,
      initialLexicalState: initialState,
      initialSettings: {
        ...DEFAULT_SCRIPTURAL_BASE_SETTINGS,
        onSave,
      },
    };
  }, [usj, editable, onSave, bookCode]);

  return (
    <div className="editor-wrapper prose">
      <ScripturalEditorComposer initialConfig={initialConfig}>
        <EditorPlugins onSave={onSave} onHistoryChange={onHistoryChange} />
        {children}
      </ScripturalEditorComposer>
    </div>
  );
}

function EditorPlugins({
  onSave,
  onHistoryChange,
}: {
  onSave?: (newUsj: UsjDocument) => void;
  onHistoryChange?: Parameters<typeof HistoryPlugin>[0]["onChange"];
}) {
  const { enhancedCursorPosition, contextMenuTriggerKey } = useBaseSettings();
  const [editor] = useLexicalComposerContext();
  const editable = useMemo(() => editor.isEditable(), [editor]);
  return (
    <>
      <CustomToolbar onSave={onSave} />
      {editable && (
        <>
          {enhancedCursorPosition && (
            <CursorHandlerPlugin
              updateTags={["history-merge", "skip-toggle-nodes"]}
              canContainPlaceHolder={(node) => node.getType() !== "graft"}
            />
          )}
          <ScripturalNodesMenuPlugin trigger={contextMenuTriggerKey} />
          <HistoryPlugin onChange={onHistoryChange} />
        </>
      )}
    </>
  );
}
