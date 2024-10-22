import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_TAB_COMMAND,
  LexicalEditor,
} from "lexical";
import { useEffect, useState } from "react";

export default function useLexicalMenuNavigation<
  MenuItem extends { action: (editor: LexicalEditor) => void },
>({
  onSelect = () => undefined,
  isMenuOpen,
  options,
}: {
  onSelect?: (item: MenuItem) => void;
  isMenuOpen: boolean;
  options: MenuItem[];
}) {
  const [editor] = useLexicalComposerContext();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const menu = {
    moveUp: () => {
      setSelectedIndex((selectedIndex - 1 + options.length) % options.length);
    },
    moveDown: () => {
      setSelectedIndex((selectedIndex + 1) % options.length);
    },
    select: () => {
      handleExecuteSelectedItem();
    },
  };

  const handleExecuteSelectedItem = () => {
    if (options[selectedIndex]) {
      editor.update(() => {
        options[selectedIndex].action(editor);
      });
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (!isMenuOpen) return;

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
          onSelect(options[selectedIndex]);
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
  }, [editor, isMenuOpen, options, selectedIndex, setSelectedIndex]);
  return { selectedIndex, setSelectedIndex };
}
