import { useLayoutEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COPY_COMMAND, CUT_COMMAND, LexicalCommand, createCommand } from "lexical";
import { pasteSelection, pasteSelectionAsPlainText } from "./clipboard.utils";

export const SAVE_COMMAND: LexicalCommand<KeyboardEvent> = createCommand("SAVE_COMMAND");

const ClipboardPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useLayoutEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "c") {
        event.preventDefault();
        editor.dispatchCommand(COPY_COMMAND, null);
      } else if ((event.ctrlKey || event.metaKey) && event.key === "x") {
        event.preventDefault();
        editor.dispatchCommand(CUT_COMMAND, null);
      } else if (event.shiftKey && (event.ctrlKey || event.metaKey) && event.key === "v") {
        event.preventDefault();
        pasteSelectionAsPlainText(editor);
      } else if ((event.ctrlKey || event.metaKey) && event.key === "v") {
        event.preventDefault();
        pasteSelection(editor);
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
};

export default ClipboardPlugin;
