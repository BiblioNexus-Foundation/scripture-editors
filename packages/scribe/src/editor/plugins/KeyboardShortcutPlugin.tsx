import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { IS_APPLE } from "@lexical/utils";
import { UNDO_COMMAND, REDO_COMMAND } from "lexical";

export default function KeyboardShortcutPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const { key, shiftKey, metaKey, ctrlKey, altKey } = event;
      if (!(IS_APPLE ? metaKey : ctrlKey) || altKey) return;
      if (key.toLowerCase() === "z" && shiftKey) {
        event.preventDefault();
        editor.dispatchCommand(REDO_COMMAND, undefined);
      } else if (key.toLowerCase() === "z") {
        console.log("undo");
        event.preventDefault();
        editor.dispatchCommand(UNDO_COMMAND, undefined);
      }
    };

    return editor.registerRootListener(
      (rootElement: HTMLElement | null, prevRootElement: HTMLElement | null) => {
        if (prevRootElement !== null) {
          prevRootElement.removeEventListener("keydown", onKeyDown);
        }
        if (rootElement !== null) {
          rootElement.addEventListener("keydown", onKeyDown);
        }
      },
    );
  }, [editor]);

  return null;
}
