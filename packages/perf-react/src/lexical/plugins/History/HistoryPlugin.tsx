/*
 * This code is adapted from the Lexical project at Facebook's GitHub repository.
 * Original source: https://github.com/facebook/lexical
 */

import type { HistoryMergeListener } from "./";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useHistory } from "./useHistory";
import { HistoryState } from "./HistoryManager";

export function HistoryPlugin({
  externalHistoryState,
  onChange,
}: {
  externalHistoryState?: HistoryState;
  onChange?: HistoryMergeListener;
}): null {
  const [editor] = useLexicalComposerContext();
  useHistory(editor, externalHistoryState, onChange);
  return null;
}
