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

    const handleCommand = (action: () => void, event?: KeyboardEvent): boolean => {
      action();
      if (!event) return false;
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    };

    const commands = [
      { key: KEY_ARROW_DOWN_COMMAND, action: () => menu.moveDown() },
      { key: KEY_ARROW_UP_COMMAND, action: () => menu.moveUp() },
      { key: KEY_ENTER_COMMAND, action: () => menu.select() },
      { key: KEY_TAB_COMMAND, action: () => menu.select() },
    ];

    const unregisterNavigation = mergeRegister(
      ...commands.map(({ key, action }) =>
        editor.registerCommand(key, (event) => handleCommand(action, event), COMMAND_PRIORITY_LOW),
      ),
    );

    return unregisterNavigation;
  }, [editor, menu]);
};
