import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_DOWN_COMMAND,
  LexicalEditor,
} from "lexical";
import { useEffect } from "react";
import { getNodeElementTagName } from "shared/nodes/scripture/usj/node.utils";
import { SET_DIRECTION_COMMAND, TextDirection } from "./text-direction.model";

function useTextDirection(editor: LexicalEditor, textDirection: TextDirection) {
  useEffect(() => {
    return editor.registerCommand(
      SET_DIRECTION_COMMAND,
      () => {
        const rootElement = editor.getRootElement();
        if (!rootElement || textDirection === "auto") return false;

        rootElement.dir = textDirection;
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, textDirection]);

  useEffect(() => {
    return editor.registerUpdateListener(({ dirtyElements }) => {
      if (dirtyElements.size > 0) {
        editor.dispatchCommand(SET_DIRECTION_COMMAND, undefined);
      }
    });
  }, [editor]);
}

/**
 * Change the direction of the left and right arrow keys if the immediate text direction is
 * different than the property setting.
 * @param editor - The LexicalEditor instance used to access the DOM.
 */
function useArrowKeys(editor: LexicalEditor) {
  useEffect(() => {
    const $handleKeyDown = (event: KeyboardEvent): boolean => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return false;

      return editor.getEditorState().read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;

        // Find the closest paragraph element
        const anchorNode = selection.anchor.getNode();
        const paragraphNode = $findMatchingParent(
          anchorNode,
          (node) => getNodeElementTagName(node, editor) === "p",
        );
        if (!paragraphNode) return false;

        // Get the DOM element corresponding to the paragraph node
        const paragraphElement = editor.getElementByKey(paragraphNode.getKey());
        if (!paragraphElement) return false;

        // Check if directions are different
        const inputDiv = paragraphElement.parentElement;
        if (!inputDiv || paragraphElement.dir === inputDiv.dir) return false;

        editor.update(() => {
          const updatedSelection = $getSelection();
          if ($isRangeSelection(updatedSelection)) {
            // Move in the opposite direction
            const isBackward =
              (inputDiv.dir === "rtl" && event.key === "ArrowLeft") ||
              (inputDiv.dir === "ltr" && event.key === "ArrowRight");
            updatedSelection.modify("move", isBackward, "character");
          }
        });
        event.preventDefault();
        return true;
      });
    };

    return editor.registerCommand(KEY_DOWN_COMMAND, $handleKeyDown, COMMAND_PRIORITY_HIGH);
  }, [editor]);
}

export default function TextDirectionPlugin({
  textDirection,
}: {
  textDirection: TextDirection;
}): null {
  const [editor] = useLexicalComposerContext();
  useTextDirection(editor, textDirection);
  useArrowKeys(editor);
  return null;
}
