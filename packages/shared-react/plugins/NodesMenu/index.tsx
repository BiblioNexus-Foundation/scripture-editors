import { $getSelection, $isRangeSelection } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useState } from "react";
import FloatingBoxAtCursor from "../FloatingBox/FloatingBoxAtCursor";
import { NodeOption, NodeSelectionMenu } from "./NodeSelectionMenu";

export default function NodesMenu({ trigger, items }: { trigger: string; items?: NodeOption[] }) {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);

  // Close the menu when the escape key is pressed
  const hideMenu = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        editor.focus();
      }
    },
    [editor],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", hideMenu);
      return () => {
        document.removeEventListener("keydown", hideMenu);
      };
    }
  }, [isOpen, hideMenu]);

  // Open the menu when the trigger key is pressed
  useEffect(() => {
    const showMenu = (e: KeyboardEvent) => {
      if (e.key === trigger) {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    const unregisterRootListener = editor.registerRootListener((root) => {
      if (!root) return;
      root.addEventListener("keydown", showMenu);
      return () => {
        root.removeEventListener("keydown", showMenu);
      };
    });
    return () => {
      unregisterRootListener();
    };
  }, [editor, trigger]);

  // Close the menu when the selection changes
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        setIsOpen(false);
      });
    });
  }, [editor]);

  return (
    items && (
      <FloatingBoxAtCursor isOpen={isOpen}>
        {({ placement }) => (
          <NodeSelectionMenu
            options={items}
            onClose={() => setIsOpen(false)}
            inverse={placement === "top-start"}
          />
        )}
      </FloatingBoxAtCursor>
    )
  );
}
