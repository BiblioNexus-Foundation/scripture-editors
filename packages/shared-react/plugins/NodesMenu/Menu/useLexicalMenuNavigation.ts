import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_TAB_COMMAND,
} from "lexical";
import { useMenuActions } from "./useMenuActions";

export const useLexicalMenuNavigation = (menu: ReturnType<typeof useMenuActions> | null) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!menu) return;

    const unregisterNavigation = mergeRegister(
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        (event) => {
          menu.moveDown();
          event.preventDefault();
          event.stopImmediatePropagation();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        (event) => {
          menu.moveUp();
          event.preventDefault();
          event.stopImmediatePropagation();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => {
          menu.select();
          if (!event) return false;
          event.preventDefault();
          event.stopImmediatePropagation();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_TAB_COMMAND,
        (event) => {
          menu.select();
          if (!event) return false;
          event.preventDefault();
          event.stopImmediatePropagation();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );

    return unregisterNavigation;
  }, [editor, menu]);
};
