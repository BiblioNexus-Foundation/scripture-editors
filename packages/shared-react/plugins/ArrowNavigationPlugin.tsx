import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_DOWN_COMMAND,
  LexicalEditor,
  LexicalNode,
  RangeSelection,
} from "lexical";
import { useEffect } from "react";
import {
  $isImmutableChapterNode,
  ImmutableChapterNode,
} from "shared/nodes/scripture/usj/ImmutableChapterNode";
import {
  $isImmutableVerseNode,
  ImmutableVerseNode,
} from "../nodes/scripture/usj/ImmutableVerseNode";
import { $isNoteNode, NoteNode } from "shared/nodes/scripture/usj/NoteNode";
import { $getNextNode, $getPreviousNode } from "shared/nodes/scripture/usj/node.utils";
import { $isParaNode } from "shared/nodes/scripture/usj/ParaNode";

export function ArrowNavigationPlugin(): null {
  const [editor] = useLexicalComposerContext();
  useArrowKeys(editor);
  return null;
}

/**
 * When moving with arrow keys, if a chapter or verse node is next, move to the following node.
 * Also handles navigation around adjacent verse/note nodes.
 * @param editor - The LexicalEditor instance used to access the DOM.
 */
function useArrowKeys(editor: LexicalEditor) {
  useEffect(() => {
    if (!editor.hasNodes([ImmutableChapterNode, ImmutableVerseNode, NoteNode])) {
      throw new Error(
        "ArrowNavigationPlugin: ImmutableChapterNode, ImmutableVerseNode or NoteNode not registered on editor!",
      );
    }

    const $handleKeyDown = (event: KeyboardEvent): boolean => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return false;

      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return false;

      const inputDiv = editor.getRootElement();
      if (!inputDiv) return false;

      const anchorNode = selection.anchor.getNode();
      const direction = inputDiv.dir || "ltr";
      const isMovingForward = checkIsMovingForward(direction, event.key);
      const isMovingBackward = checkIsMovingBackward(direction, event.key);

      let isHandled = false;

      if (isMovingForward && $canMoveForward(anchorNode, selection)) {
        isHandled = $handleForwardNavigation(anchorNode);
      } else if (isMovingBackward && $canMoveBackward(anchorNode, selection)) {
        isHandled = $handleBackwardNavigation(anchorNode);
      }

      if (isHandled) {
        event.preventDefault();
        return true;
      }

      return false;
    };

    return editor.registerCommand(KEY_DOWN_COMMAND, $handleKeyDown, COMMAND_PRIORITY_HIGH);
  }, [editor]);
}

// --- Helper functions for direction checking ---

function checkIsMovingForward(direction: string, key: string): boolean {
  return (
    (direction === "ltr" && key === "ArrowRight") || (direction === "rtl" && key === "ArrowLeft")
  );
}

function checkIsMovingBackward(direction: string, key: string): boolean {
  return (
    (direction === "ltr" && key === "ArrowLeft") || (direction === "rtl" && key === "ArrowRight")
  );
}

// Helper to check if the cursor can move forward from the current position
function $canMoveForward(anchorNode: LexicalNode, selection: RangeSelection): boolean {
  const isParaNode = $isParaNode(anchorNode);
  const isAtNodeEnd = selection.anchor.offset === anchorNode.getTextContentSize();
  return isParaNode || isAtNodeEnd;
}

// Helper to check if the cursor can move backward from the current position
function $canMoveBackward(anchorNode: LexicalNode, selection: RangeSelection): boolean {
  const isParaNode = $isParaNode(anchorNode);
  const isAtNodeStart = selection.anchor.offset === 0;
  return isParaNode || isAtNodeStart;
}

// Helper to handle forward arrow key navigation logic
function $handleForwardNavigation(anchorNode: LexicalNode): boolean {
  const nextNode = $getNextNode(anchorNode);
  if ($isImmutableChapterNode(nextNode) || $isImmutableVerseNode(nextNode)) {
    const nodeAfterNext = nextNode.getNextSibling();
    // If a verse is immediately followed by a note, select the end of the note
    if ($isNoteNode(nodeAfterNext)) nodeAfterNext.selectEnd();
    else nextNode.selectEnd();
    return true;
  }
  return false;
}

// Helper to handle backward arrow key navigation logic
function $handleBackwardNavigation(anchorNode: LexicalNode): boolean {
  const prevNode = $getPreviousNode(anchorNode);
  if ($isImmutableChapterNode(prevNode) || $isImmutableVerseNode(prevNode)) {
    prevNode.selectStart();
    return true;
  } else if ($isNoteNode(prevNode)) {
    const nodeBeforePrevious = prevNode.getPreviousSibling();
    // If a note is immediately preceded by a verse, select the start of the verse
    if ($isImmutableVerseNode(nodeBeforePrevious)) {
      nodeBeforePrevious.selectStart();
      return true;
    }
  }
  return false;
}
