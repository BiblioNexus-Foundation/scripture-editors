import { useMemo, useEffect } from "react";

import {
  ScripturalEditorComposer,
  HistoryPlugin,
  CursorHandlerPlugin,
  ScripturalNodesMenuPlugin,
  DEFAULT_SCRIPTURAL_BASE_SETTINGS,
  useBaseSettings,
  ScripturalInitialConfigType,
  ScriptureReferenceHandler,
  ScrollToReferencePlugin,
  MarkersMenuProvider,
} from "@scriptural/react";
import "@scriptural/react/styles/scriptural-editor.css";
import "@scriptural/react/styles/nodes-menu.css";

import "./editor.css";
import { CustomToolbar } from "./CustomToolbar";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { UsjDocument } from "@scriptural/react/internal-packages/shared/converters/usj/core/usj";
import { EditorState, LexicalEditor } from "lexical";
import { AppReferenceHandler } from "./utils/AppReferenceHandler";

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
  scriptureReferenceHandler,
  referenceHandlerSource,
  enableScrollToReference = true,
}: {
  usj?: UsjDocument;
  initialState?: null | string | EditorState | ((editor: LexicalEditor) => void);
  bookCode: string;
  editable?: boolean;
  children?: React.ReactNode;
  onSave?: (newUsj: UsjDocument) => void;
  onHistoryChange?: Parameters<typeof HistoryPlugin>[0]["onChange"];
  scriptureReferenceHandler?: ScriptureReferenceHandler;
  referenceHandlerSource?: string;
  enableScrollToReference?: boolean;
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

  // Set the source identifier on the reference handler if both are provided
  useEffect(() => {
    if (
      scriptureReferenceHandler &&
      referenceHandlerSource &&
      scriptureReferenceHandler instanceof AppReferenceHandler
    ) {
      scriptureReferenceHandler.setSource(referenceHandlerSource);
    }
  }, [scriptureReferenceHandler, referenceHandlerSource]);

  return (
    <div className="editor-wrapper prose relative">
      <ScripturalEditorComposer
        initialConfig={initialConfig}
        scriptureReferenceHandler={scriptureReferenceHandler}
      >
        <EditorPlugins
          onSave={onSave}
          onHistoryChange={onHistoryChange}
          enableScrollToReference={enableScrollToReference}
        />
        {children}
      </ScripturalEditorComposer>
    </div>
  );
}

function EditorPlugins({
  onSave,
  onHistoryChange,
  enableScrollToReference,
}: {
  onSave?: (newUsj: UsjDocument) => void;
  onHistoryChange?: Parameters<typeof HistoryPlugin>[0]["onChange"];
  enableScrollToReference?: boolean;
}) {
  const { enhancedCursorPosition, contextMenuTriggerKey } = useBaseSettings();
  const [editor] = useLexicalComposerContext();
  const editable = useMemo(() => editor.isEditable(), [editor]);

  return (
    <>
      <MarkersMenuProvider>
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

        {enableScrollToReference && (
          <ScrollToReferencePlugin scrollBehavior="smooth" scrollOffset={80} />
        )}
      </MarkersMenuProvider>
    </>
  );
}
