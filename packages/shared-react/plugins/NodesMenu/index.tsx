import { $getSelection, $isRangeSelection } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useState } from "react";
import FloatingBoxAtCursor from "./FloatingBoxAtCursor";
import { NodeOption, NodeSelectionMenu } from "./NodeSelectionMenu";

export default function NodesMenu({ trigger, items }: { trigger: string; items?: NodeOption[] }) {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);

  // Close the menu when the escape key is pressed
  const hideMenu = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        console.log("hiding");
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
        console.log("removing");
        document.removeEventListener("keydown", hideMenu);
      };
    }
  }, [isOpen, hideMenu]);

  // Open the menu when the trigger key is pressed
  useEffect(() => {
    const showMenu = (e: KeyboardEvent) => {
      if (e.key === trigger) {
        e.preventDefault();
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          if (selection.anchor.key === selection.focus.key && selection.anchor.type === "text") {
            const textNode = selection.anchor.getNode();
            const text = textNode.getTextContent();
            const selectedText = text.slice(selection.anchor.offset, selection.focus.offset);
            console.log({ selectedText });
          }
        });
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
