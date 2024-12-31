import { ReactElement, useMemo } from "react";
import { UsjDocument, UsjNode } from "shared/converters/usj/core/usj";

import { LexicalNode } from "lexical";
import { ScripturalEditorComposer } from "@scriptural/react";
import {
  ScripturalNodesMenuPlugin,
  CursorHandlerPlugin,
  ToolbarDefault,
  useToolbarSettings,
} from "@scriptural/react/plugins";
import { ScripturalInitialConfigType } from "@scriptural/react/context";

function onError(error: Error) {
  console.error(error);
}

export default function Editor({
  usj,
  editable = true,
  children,
  onSave,
}: {
  usj: UsjDocument;
  editable?: boolean;
  children?: ReactElement;
  onSave?: (usj: UsjDocument | UsjNode | string) => void;
}) {
  const initialConfig: ScripturalInitialConfigType = useMemo(() => {
    return {
      bookCode: "GEN",
      usj,
      onError,
      editable,
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
  const { enhancedCursorPosition, contextMenuTriggerKey } = useToolbarSettings();

  return (
    <>
      <ToolbarDefault onSave={onSave} />
      {enhancedCursorPosition && (
        <CursorHandlerPlugin
          updateTags={["history-merge"]}
          canContainPlaceHolder={(node: LexicalNode) => node.getType() !== "graft"}
        />
      )}
      <ScripturalNodesMenuPlugin trigger={contextMenuTriggerKey} />
    </>
  );
}
