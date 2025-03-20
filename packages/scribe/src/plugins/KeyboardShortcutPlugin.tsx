import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { IS_APPLE, mergeRegister } from "@lexical/utils";
import {
  UNDO_COMMAND,
  REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from "lexical";

export default function KeyboardShortcutPlugin({
  canUndo,
  canRedo,
  setCanUndo,
  setCanRedo,
}: {
  canUndo: boolean;
  canRedo: boolean;
  setCanUndo: (canUndo: boolean) => void;
  setCanRedo: (canRedo: boolean) => void;
}): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Register listeners for undo/redo capability changes
    return mergeRegister(
      editor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [editor, setCanUndo, setCanRedo]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const { key, shiftKey, metaKey, ctrlKey, altKey } = event;
      if (!(IS_APPLE ? metaKey : ctrlKey) || altKey) return;
      if (key.toLowerCase() === "z" && shiftKey && canRedo) {
        event.preventDefault();
        editor.dispatchCommand(REDO_COMMAND, undefined);
      } else if (key.toLowerCase() === "z" && canUndo) {
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
  }, [editor, canUndo, canRedo]);

  return null;
}
