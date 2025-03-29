import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $createRangeSelection,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_DOWN_COMMAND,
  LexicalEditor,
} from "lexical";
import { useEffect } from "react";
import { $isCharNode, CharNode } from "shared/nodes/scripture/usj/CharNode";
import { $isNoteNode, NoteNode } from "shared/nodes/scripture/usj/NoteNode";
import {
  getNodeElementTagName,
  getNoteCallerPreviewText,
} from "shared/nodes/scripture/usj/node.utils";
import {
  $isImmutableNoteCallerNode,
  ImmutableNoteCallerNode,
} from "../nodes/scripture/usj/ImmutableNoteCallerNode";

export default function NoteNodePlugin(): null {
  const [editor] = useLexicalComposerContext();
  useNoteNode(editor);
  useArrowKeys(editor);
  return null;
}

/**
 * This hook is responsible for handling NoteNode and NoteNodeCaller interactions.
 * @param editor - The LexicalEditor instance used to access the DOM.
 */
function useNoteNode(editor: LexicalEditor) {
  useEffect(() => {
    if (!editor.hasNodes([CharNode, NoteNode, ImmutableNoteCallerNode])) {
      throw new Error(
        "NoteNodePlugin: CharNode, NoteNode or ImmutableNoteCallerNode not registered on editor!",
      );
    }

    const doubleClickListener = (event: MouseEvent) =>
      editor.update(() => $handleDoubleClick(event));

    return mergeRegister(
      // Update NoteNodeCaller preview text when NoteNode children text is changed.
      editor.registerNodeTransform(CharNode, $noteCharNodeTransform),

      // Handle double-click of a word immediately following a NoteNode (no space between).
      editor.registerRootListener(
        (rootElement: HTMLElement | null, prevRootElement: HTMLElement | null) => {
          if (prevRootElement !== null) {
            prevRootElement.removeEventListener("dblclick", doubleClickListener);
          }
          if (rootElement !== null) {
            rootElement.addEventListener("dblclick", doubleClickListener);
          }
        },
      ),
    );
  }, [editor]);
}

/**
 * Changes in NoteNode children text are updated in the NoteNodeCaller preview text.
 * @param node - CharNode thats needs its preview text updated.
 */
function $noteCharNodeTransform(node: CharNode): void {
  const parent = node.getParentOrThrow();
  const children = parent.getChildren();
  const noteCaller = children.find((child) => $isImmutableNoteCallerNode(child));
  if (!$isCharNode(node) || !$isNoteNode(parent) || !noteCaller) return;

  const previewText = getNoteCallerPreviewText(children);
  noteCaller.setPreviewText(previewText);
}

/**
 * Ensure that when double-clicking on a word after a note node (no space between) that it only
 * selects that word and does not include the note in the selection.
 * @param event - The MouseEvent triggered by the double-click interaction
 */
function $handleDoubleClick(event: MouseEvent) {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return;

  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = anchor.getNode();
  const focusNode = focus.getNode();

  if ($isNoteNode(anchorNode) && $isTextNode(focusNode)) {
    event.preventDefault();

    // Create new selection only including the TextNode
    const newSelection = $createRangeSelection();
    newSelection.anchor.set(focusNode.getKey(), 0, "text");
    newSelection.focus.set(focusNode.getKey(), focus.offset, "text");
    $setSelection(newSelection);
  }
}

/**
 * When moving forward with arrow keys, if a note node is next, move to the following node.
 * @param editor - The LexicalEditor instance used to access the DOM.
 */
function useArrowKeys(editor: LexicalEditor) {
  useEffect(() => {
    const $handleKeyDown = (event: KeyboardEvent): boolean => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return false;

      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return false;

      const anchorNode = selection.anchor.getNode();
      const isAtEnd = selection.anchor.offset === anchorNode.getTextContent().length;

      // Find the closest paragraph element to get the text direction
      const paragraphNode = $findMatchingParent(
        anchorNode,
        (node) => getNodeElementTagName(node, editor) === "p",
      );
      if (!paragraphNode) return false;

      const paragraphElement = editor.getElementByKey(paragraphNode.getKey());
      if (!paragraphElement) return false;

      const inputDiv = paragraphElement.parentElement;
      if (!inputDiv) return false;

      // If moving forward from the end of a text node and a note follows
      if (
        isAtEnd &&
        ((inputDiv.dir === "ltr" && event.key === "ArrowRight") ||
          (inputDiv.dir === "rtl" && event.key === "ArrowLeft"))
      ) {
        const nextSibling = anchorNode.getNextSibling();
        if ($isNoteNode(nextSibling)) {
          // Find the next text node after the NoteNode
          const nodeAfterNote = nextSibling.getNextSibling();
          if (nodeAfterNote) {
            // Move to the start of the next text node
            selection.anchor.set(nodeAfterNote.getKey(), 0, "text");
            selection.focus.set(nodeAfterNote.getKey(), 0, "text");
            event.preventDefault();
            return true;
          }
        }
      }

      return false;
    };

    return editor.registerCommand(KEY_DOWN_COMMAND, $handleKeyDown, COMMAND_PRIORITY_HIGH);
  }, [editor]);
}
