import { mergeRegister } from "@lexical/utils";
import {
  $createRangeSelection,
  $getSelection,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_ARROW_UP_COMMAND,
  LexicalEditor,
  LexicalNode,
  TextNode,
} from "lexical";
import {
  $getCursorSelectionContext,
  CursorData,
  CursorPosition,
} from "../utils/CursorSelectionContext";
import { $insertCursorPlaceholder, $removeCursorPlaceholder } from "../utils";
import { CharSelectionOffset, CursorMovementDirection } from "../utils/constants";
import { $handleNoSibling } from "./noSibling";
import { $handleSiblingNode } from "./sibling";

export function registerCursorInsertion(
  editor: LexicalEditor,
  canHavePlaceholder: (node: LexicalNode) => boolean = () => true,
  editorUpdate: (update: (() => void) | (() => void), tag?: string) => void,
) {
  const unregisterInsertionHandlers = mergeRegister(
    registerCursorInsertOnArrowDown(CursorMovementDirection.RIGHT),
    registerCursorInsertOnArrowDown(CursorMovementDirection.LEFT),
    registerCursorInsertOnArrowDown(CursorMovementDirection.DOWN),
    registerCursorInsertOnArrowDown(CursorMovementDirection.UP),
  );

  function registerCursorInsertOnArrowDown(
    direction:
      | CursorMovementDirection.LEFT
      | CursorMovementDirection.RIGHT
      | CursorMovementDirection.UP
      | CursorMovementDirection.DOWN,
  ): () => void {
    //TODO: Test for RTL direction
    const commands = {
      [CursorMovementDirection.LEFT]: KEY_ARROW_LEFT_COMMAND,
      [CursorMovementDirection.RIGHT]: KEY_ARROW_RIGHT_COMMAND,
      [CursorMovementDirection.UP]: KEY_ARROW_UP_COMMAND,
      [CursorMovementDirection.DOWN]: KEY_ARROW_DOWN_COMMAND,
    };

    const command = commands[direction];

    return editor.registerCommand(
      command,
      (event) => {
        if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
          return false;
        }
        const result = $handleArrowCommand(direction);
        if (result) {
          event.preventDefault();
        }
        return result;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }

  function $handleArrowCommand(
    direction:
      | CursorMovementDirection.LEFT
      | CursorMovementDirection.RIGHT
      | CursorMovementDirection.UP
      | CursorMovementDirection.DOWN,
  ): boolean {
    const selectionData = $getCursorSelectionContext($getSelection(), direction);
    if (!selectionData) return false;
    const { node: currentNode, cursor, content } = selectionData;

    if (!canHavePlaceholder(currentNode)) return false;

    if (cursor.isPlaceholder) {
      const isHandled = $handleExistingPlaceholder(currentNode, cursor, content);
      if (isHandled) return true;
    }

    if (cursor.isMovingUp || cursor.isMovingDown) {
      return false;
    }

    if (cursor.position === CursorPosition.Middle || cursor.isMovingAwayFromEdge) {
      return false;
    }

    if (cursor.isMovingTowardsEdge) {
      return $handleMovingTowardsEdge(currentNode, cursor);
    }

    if (cursor.isSwitchingEdge) {
      return $handleSwitchingEdge(currentNode, cursor);
    }

    const siblingNode = getSiblingNode(currentNode, cursor);
    if (!siblingNode) {
      return $handleNoSibling(currentNode, cursor, editorUpdate, canHavePlaceholder);
    }

    return $handleSiblingNode(siblingNode, cursor, editorUpdate, canHavePlaceholder);
  }

  /**
   * Cleans up the cursor placeholder when cursor is moving away from the edge of a node.
   * @param currentNode The current node.
   * @param cursor The cursor data.
   * @param content The content of the node.
   * @returns Whether the cursor was handled.
   */
  function $handleExistingPlaceholder(
    currentNode: TextNode,
    cursor: CursorData,
    content: { isEmpty: boolean },
  ): boolean {
    if (cursor.isMovingAwayFromEdge) {
      editorUpdate(() => {
        $removeCursorPlaceholder(currentNode);
        const newOffset = cursor.isMovingLeft ? cursor.offset - 1 : cursor.offset + 1;
        const selection = $createRangeSelection();
        selection.anchor.set(currentNode.getKey(), newOffset, "text");
        selection.focus.set(currentNode.getKey(), newOffset, "text");
        $setSelection(selection);
      });
      return true;
    }

    editorUpdate(() => {
      if (content.isEmpty) {
        currentNode.setTextContent("");
      } else {
        $removeCursorPlaceholder(currentNode);
      }
    });
    return false;
  }

  /**
   * Handles the cursor moving towards an edge, e.g. when the cursor is at one step away from the start of a node and the user presses the left arrow key to move the cursor to the start of the node.
   * @param currentNode The current node.
   * @param cursor The cursor data.
   * @returns Whether the cursor was handled.
   */
  function $handleMovingTowardsEdge(currentNode: LexicalNode, cursor: CursorData): boolean {
    editorUpdate(() => {
      const cursorPosition = cursor.isMovingLeft ? CursorPosition.Start : CursorPosition.End;
      const selectOffset = cursor.isMovingLeft
        ? CharSelectionOffset.AFTER
        : CharSelectionOffset.BEFORE;
      const cursorPlaceholderNode = $insertCursorPlaceholder(currentNode, cursorPosition);
      cursorPlaceholderNode.select(selectOffset, selectOffset);
    });
    return true;
  }

  /**
   * Handles the cursor switching edge case, e.g. when the cursor is at the end of a node that contains just one character and the user presses the left arrow key to move the cursor to the start of the node.
   * @param currentNode The current node.
   * @param cursor The cursor data.
   * @returns Whether the cursor was handled.
   */
  function $handleSwitchingEdge(currentNode: LexicalNode, cursor: CursorData): boolean {
    editorUpdate(() => {
      const cursorPosition = cursor.isMovingRight ? CursorPosition.End : CursorPosition.Start;
      const selectOffset = cursor.isMovingRight
        ? CharSelectionOffset.BEFORE
        : CharSelectionOffset.AFTER;
      const cursorPlaceholderNode = $insertCursorPlaceholder(currentNode, cursorPosition);
      cursorPlaceholderNode.select(selectOffset, selectOffset);
    });
    return true;
  }

  function getSiblingNode(currentNode: LexicalNode, cursor: CursorData): LexicalNode | null {
    return cursor.isMovingRight ? currentNode.getNextSibling() : currentNode.getPreviousSibling();
  }

  return unregisterInsertionHandlers;
}
