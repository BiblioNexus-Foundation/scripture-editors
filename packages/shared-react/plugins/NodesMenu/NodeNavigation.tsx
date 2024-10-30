import { COMMAND_PRIORITY_HIGH } from "lexical";
import { KEY_DOWN_COMMAND } from "lexical";
import { useEffect } from "react";
import { useMenuActions } from "./Menu/useMenuActions";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export default function NodeNavigation() {
  const menu = useMenuActions();
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handleEvent = (event: KeyboardEvent) => {
      const actions: { [key: string]: () => void } = {
        ArrowDown: () => menu.moveDown(),
        ArrowUp: () => menu.moveUp(),
        Enter: () => menu.select(),
        Tab: () => menu.select(),
      };

      const action = actions[event.key];
      if (action) {
        action();
        event.preventDefault();
        event.stopPropagation();
        return true;
      }

      return false;
    };

    const unregisterCommand = editor.registerCommand(
      KEY_DOWN_COMMAND,
      handleEvent,
      COMMAND_PRIORITY_HIGH,
    );
    return () => {
      unregisterCommand();
    };
  }, [editor, menu]);

  return null;
}
