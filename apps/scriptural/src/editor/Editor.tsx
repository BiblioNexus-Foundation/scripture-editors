import { ReactElement, useMemo } from "react";
import { UsjDocument, UsjNode } from "shared/converters/usj/core/usj";

import { LexicalNode } from "lexical";
import { ScripturalEditorComposer } from "@scriptural/react";
import {
  ScripturalNodesMenuPlugin,
  CursorHandlerPlugin,
  ToolbarDefault,
} from "@scriptural/react/plugins";
import {
  DEFAULT_SCRIPTURAL_BASE_SETTINGS,
  useBaseSettings,
} from "@scriptural/react/plugins/BaseSettingsPlugin";
import { ScripturalInitialConfigType } from "@scriptural/react/context";
import { $isScriptureElementNode } from "shared/nodes/scripture/generic";

function onError(error: Error) {
  console.error(error);
}

export default function Editor({
  usj,
  bookCode,
  editable = true,
  children,
  onSave,
}: {
  usj: UsjDocument;
  bookCode: string;
  editable?: boolean;
  children?: ReactElement;
  onSave?: (usj: UsjDocument | UsjNode | string) => void;
}) {
  const initialConfig: ScripturalInitialConfigType = useMemo(() => {
    return {
      bookCode,
      usj,
      onError,
      editable,
      initialSettings: {
        ...DEFAULT_SCRIPTURAL_BASE_SETTINGS,
      },
      onSave,
    };
  }, [usj, editable, onSave]);

  return (
    <ScripturalEditorComposer initialConfig={initialConfig}>
      <EditorPlugins onSave={onSave} />
      {children}
    </ScripturalEditorComposer>
  );
}

function EditorPlugins({ onSave }: { onSave?: (usj: UsjDocument | UsjNode | string) => void }) {
  const { enhancedCursorPosition, contextMenuTriggerKey } = useBaseSettings();

  return (
    <>
      <ToolbarDefault onSave={onSave} />
      {enhancedCursorPosition && (
        <CursorHandlerPlugin
          updateTags={["history-merge"]}
          canContainPlaceHolder={(node: LexicalNode) => true}
        />
      )}
      <ScripturalNodesMenuPlugin trigger={contextMenuTriggerKey} />
    </>
  );
}
