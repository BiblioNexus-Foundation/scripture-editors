import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  HistoryPlugin as LexicalHistoryPlugin,
  HistoryState,
  createEmptyHistoryState,
} from "@lexical/react/LexicalHistoryPlugin";
import { COMMAND_PRIORITY_NORMAL, createCommand, LexicalCommand } from "lexical";
import { JSX, useEffect, useMemo } from "react";

export const MERGE_HISTORY_COMMAND: LexicalCommand<void> = createCommand("MERGE_HISTORY_COMMAND");

export function HistoryPlugin({
  externalHistoryState,
}: {
  externalHistoryState?: HistoryState;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const historyState: HistoryState = useMemo(
    () => externalHistoryState || createEmptyHistoryState(),
    [externalHistoryState],
  );

  useEffect(
    () =>
      editor.registerCommand(
        MERGE_HISTORY_COMMAND,
        () => {
          if (historyState) historyState.current = { editor, editorState: editor.getEditorState() };
          return true;
        },
        COMMAND_PRIORITY_NORMAL,
      ),
    [editor],
  );

  return <LexicalHistoryPlugin externalHistoryState={historyState} />;
}
