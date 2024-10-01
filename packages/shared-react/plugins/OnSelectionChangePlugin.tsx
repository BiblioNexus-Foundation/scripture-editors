import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COMMAND_PRIORITY_LOW, SELECTION_CHANGE_COMMAND } from "lexical";
import { useEffect } from "react";
import { SelectionRange } from "../annotation/selection.model";
import { $getRangeFromEditor } from "../annotation/selection.utils";

export default function OnSelectionChangePlugin({
  onChange,
}: {
  onChange: ((selection: SelectionRange | undefined) => void) | undefined;
}): null {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          const selection = editor.read(() => $getRangeFromEditor());
          onChange?.(selection);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    [editor],
  );

  return null;
}
