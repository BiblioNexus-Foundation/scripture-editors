/* eslint-disable no-debugger */
import {
  $createTextNode,
  $getPreviousSelection,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  BaseSelection,
  BLUR_COMMAND,
  ElementNode,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  LexicalEditor,
  LexicalNode,
  TextNode,
} from "lexical";
import { CURSOR_POSITION_HELPER_CHAR as CURSOR_PLACEHOLDER_CHAR } from "../../constants/helperCharacters";
import { mergeRegister } from "@lexical/utils";
import { $createRangeSelection } from "lexical";
import { $setSelection } from "lexical";

enum CursorPosition {
  Middle = 0,
  Start = 1,
  End = 2,
}

export function registerCursorHandlers(
  editor: LexicalEditor,
  canHavePlaceholder?: (node: LexicalNode) => boolean,
  // updateTags: string[],
) {
  const defaultCanHavePlaceholder = (node: LexicalNode) => node.getType() !== "graft";
  const checkPlaceholder = canHavePlaceholder || defaultCanHavePlaceholder;

  // function editorUpdate(
  //   editor: LexicalEditor,
  //   update: (() => void) | (() => void),
  //   updateTags: string[],
  // ) {
  //   editor.update(() => {
  //     update();
  //     updateTags.forEach((tag) => $addUpdateTag(tag));
  //   });
  // }

  return mergeRegister(
    registerCursorSelectionReconciler(editor),
    registerCursorRemovalOnEditorBlur(editor),
    registerCursorRemovalOnTextTransform(editor),
    registerCursorRemovalOnSelectionChange(editor),
    registerCursorInsertOnRightArrowDown(editor, checkPlaceholder),
    registerCursorInsertOnLeftArrowDown(editor, checkPlaceholder),
  );
}

function registerCursorInsertOnLeftArrowDown(
  editor: LexicalEditor,
  canHavePlaceholder: (node: LexicalNode) => boolean,
): () => void {
  return editor.registerCommand(
    KEY_ARROW_LEFT_COMMAND,
    (e) => {
      if (e.repeat) {
        return false;
      }
      const result = handleArrowCommand(editor, CursorPosition.Start, "left", canHavePlaceholder);
      if (result) {
        e.preventDefault();
      }
      return result;
    },
    0,
  );
}

function registerCursorInsertOnRightArrowDown(
  editor: LexicalEditor,
  canHavePlaceholder: (node: LexicalNode) => boolean,
): () => void {
  return editor.registerCommand(
    KEY_ARROW_RIGHT_COMMAND,
    (e) => {
      if (e.repeat) {
        return false;
      }
      const result = handleArrowCommand(editor, CursorPosition.End, "right", canHavePlaceholder);
      if (result) {
        e.preventDefault();
      }
      return result;
    },
    0,
  );
}

function registerCursorRemovalOnEditorBlur(editor: LexicalEditor): () => void {
  return editor.registerCommand(
    BLUR_COMMAND,
    () => {
      const editorSate = editor.getEditorState();
      editorSate.read(() => {
        const selection = $getSelection();
        if (!selection) return false;
        const selectionData = $getSelectionData(selection);
        if (!selectionData) return false;

        const node = selectionData.node;
        const textContent = node.getTextContent();
        if (textContent.includes(CURSOR_PLACEHOLDER_CHAR)) {
          editor.update(
            () => {
              node.setTextContent(textContent.replaceAll(CURSOR_PLACEHOLDER_CHAR, ""));
            },
            { tag: "history-merge" },
          );
        }
      });

      return false;
    },
    0,
  );
}

function registerCursorSelectionReconciler(editor: LexicalEditor): () => void {
  return editor.registerUpdateListener(({ editorState, prevEditorState }) => {
    const previousSelectionData = prevEditorState.read(() => $getSelectionData($getSelection()));
    if (!previousSelectionData) return;
    editorState.read(() => {
      const currentSelectionData = $getSelectionData($getSelection());
      console.log(
        "OFFSET",
        currentSelectionData?.offset,
        currentSelectionData?.selection.anchor.offset,
      );
      if ([1, 2].includes(currentSelectionData?.node.getTextContentSize() ?? 0)) {
        console.log({ previousSelectionData, currentSelectionData });
      }
    });
  });
}

function registerCursorRemovalOnSelectionChange(editor: LexicalEditor): () => void {
  return editor.registerUpdateListener(
    ({ editorState, prevEditorState, dirtyLeaves, dirtyElements, tags }) => {
      if (tags.has("history-merge")) return;

      const previousSelectionData = prevEditorState.read(() => $getSelectionData($getSelection()));
      // Skip if there's no previous selection or if there are dirty nodes
      if (!previousSelectionData || dirtyLeaves.size > 0 || dirtyElements.size > 0) return;

      editorState.read(() => {
        const currentSelectionData = $getSelectionData($getSelection());
        if (!currentSelectionData) return;

        // Helper function to remove placeholder characters from a node
        const removePlaceholders = (data: ReturnType<typeof $getSelectionData>) => {
          if (data?.placeholderData.count) {
            editor.update(
              () => {
                data.placeholderData.positions.forEach((position) => {
                  data.node.spliceText(position, 1, "", false);
                });
              },
              { tag: "history-merge" },
            );
          }
        };

        // Remove placeholders from the current node
        removePlaceholders(currentSelectionData);

        // If the selection has moved to a different node, remove placeholders from the previous node
        if (currentSelectionData.node.getKey() !== previousSelectionData.node.getKey()) {
          removePlaceholders(previousSelectionData);
        }
      });
    },
  );
}

function registerCursorRemovalOnTextTransform(editor: LexicalEditor): () => void {
  return editor.registerNodeTransform(TextNode, (node) => {
    const textContent = node.getTextContent();
    const previousSelectionData = $getSelectionData($getPreviousSelection());
    if (!previousSelectionData) return;
    const helperOffset = textContent.indexOf(CURSOR_PLACEHOLDER_CHAR);
    if (helperOffset === -1) return;
    if (previousSelectionData.node.getKey() !== node.getKey()) return;
    if (previousSelectionData.position === CursorPosition.Start) {
      const currentSelectionData = $getSelectionData($getSelection());
      if (!currentSelectionData) return;
      const { selection } = currentSelectionData;
      const anchorOffset = selection.anchor.offset;
      const focusOffset = selection.focus.offset;
      node.setTextContent(textContent.replaceAll(CURSOR_PLACEHOLDER_CHAR, ""));
      if (helperOffset < focusOffset) {
        node.select(anchorOffset - 1, focusOffset - 1);
      }
    }
  });
}

function insertPlaceholder(
  node: LexicalNode,
  position: CursorPosition.Start | CursorPosition.End,
  restoreSelection = false,
) {
  const newNode = $createTextNode(CURSOR_PLACEHOLDER_CHAR);
  if (position === CursorPosition.Start) {
    node.insertBefore(newNode, restoreSelection);
    return newNode;
  } else if (position === CursorPosition.End) {
    node.insertAfter(newNode, restoreSelection);
    return newNode;
  }
  throw new Error("Wrong position for cursor placeholder");
}

function handleArrowCommand(
  editor: LexicalEditor,
  targetPosition: CursorPosition,
  direction: "left" | "right",
  canHavePlaceholder: (node: LexicalNode) => boolean,
): boolean {
  const selectionData = $getSelectionData($getSelection());
  if (!selectionData) return false;
  const {
    node: currentNode,
    offset,
    isEdge,
    isCursorPlaceHolder,
    cleanContentSize,
    position,
  } = selectionData;

  // Check if the node can have a placeholder
  if (!canHavePlaceholder(currentNode)) {
    return false;
  }

  const textContent = currentNode.getTextContent();
  // If current node already contains a cursor placeholder it should be removed
  if (isCursorPlaceHolder) {
    const isMovingAwayFromEdge =
      (direction === "right" && position === CursorPosition.Start) ||
      (direction === "left" && position === CursorPosition.End);
    //node only has a cursor placeholder
    const nodeIsEmpty = cleanContentSize === 0;

    if (nodeIsEmpty) {
      editor.update(
        () => {
          currentNode.setTextContent("");
        },
        { tag: "history-merge" },
      );
    } else {
      editor.update(
        () => {
          const placeholderIndex = textContent.indexOf(CURSOR_PLACEHOLDER_CHAR);
          currentNode.spliceText(placeholderIndex, 1, "");
          if (isMovingAwayFromEdge && cleanContentSize > 1) {
            const newOffset = direction === "left" ? offset - 1 : offset + 1;
            const selection = $createRangeSelection();
            selection.anchor.set(currentNode.getKey(), newOffset, "text");
            selection.focus.set(currentNode.getKey(), newOffset, "text");
            $setSelection(selection);
          }
        },
        { tag: "history-merge" },
      );
    }

    if (isMovingAwayFromEdge && cleanContentSize > 1) return true;
    //If is not moving away from edge execution should continue
  }

  if (selectionData.position !== targetPosition && cleanContentSize > 1) {
    return false;
  }

  // Insert placeholder if cursor is not at an edge but it is moving to an edge
  if (!isEdge) {
    if (position === CursorPosition.Start && direction === "left") {
      editor.update(
        () => {
          insertPlaceholder(currentNode, CursorPosition.Start);
          currentNode.select(0, 0);
        },
        {
          tag: "history-merge",
        },
      );
      return true; // Prevent default behavior
    } else if (position === CursorPosition.End && direction === "right") {
      editor.update(
        () => {
          insertPlaceholder(currentNode, CursorPosition.End);
          const newOffset = currentNode.getTextContentSize();
          currentNode.select(newOffset, newOffset);
        },
        {
          tag: "history-merge",
        },
      );
      return true; // Prevent default behavior
    }
  }

  if (cleanContentSize === 1) {
    const newNode = $createTextNode(CURSOR_PLACEHOLDER_CHAR);
    if (position === CursorPosition.Start && direction === "right") {
      editor.update(
        () => {
          currentNode.insertAfter(newNode);
          newNode.select(0, 0);
        },
        { tag: "history-merge" },
      );
      return true;
    } else if (position === CursorPosition.End && direction === "left") {
      editor.update(
        () => {
          currentNode.insertBefore(newNode);
          newNode.select(1, 1);
        },
        { tag: "history-merge" },
      );
      return true;
    }
  }
  //Cursor is at an edge and moving out of node

  const siblingNode =
    direction === "right" ? currentNode.getNextSibling() : currentNode.getPreviousSibling();

  if (!siblingNode) {
    return handleNoSibling(currentNode, editor, direction, canHavePlaceholder);
  }

  if (!canHavePlaceholder(siblingNode)) {
    const findEligibleDescendant = (node: LexicalNode): LexicalNode | null => {
      if (canHavePlaceholder(node)) {
        return node;
      }
      if ($isElementNode(node)) {
        const child = direction === "right" ? node.getFirstChild() : node.getLastChild();
        if (child) {
          return findEligibleDescendant(child);
        }
      }
      return null;
    };

    const eligibleDescendant = findEligibleDescendant(siblingNode);
    if (eligibleDescendant) {
      editor.update(
        () => {
          const cursorPositionHelperNode = $createTextNode(CURSOR_PLACEHOLDER_CHAR);
          if ($isTextNode(eligibleDescendant)) {
            insertPlaceholder(
              eligibleDescendant,
              direction === "right" ? CursorPosition.Start : CursorPosition.End,
              true,
            );
          } else if ($isElementNode(eligibleDescendant)) {
            handleElementSibling(eligibleDescendant, editor, direction);
          }
          const offset = direction === "right" ? 1 : 0;
          cursorPositionHelperNode.select(offset, offset);
        },
        { tag: "history-merge" },
      );
      return true;
    }
    // If no eligible descendant is found, continue with the default behavior
    return false;
  }

  if ($isTextNode(siblingNode)) {
    insertPlaceholder(
      siblingNode,
      direction === "right" ? CursorPosition.Start : CursorPosition.End,
      true,
    );
  }

  if ($isElementNode(siblingNode)) {
    return handleElementSibling(siblingNode, editor, direction);
  }

  console.warn("UNHANDLED CURSOR HELPER CASE");
  return false;
}

function handleElementSibling(
  siblingNode: ElementNode,
  editor: LexicalEditor,
  direction: "left" | "right",
): boolean {
  if (siblingNode.isInline()) {
    const cursorPositionHelperNode = $createTextNode(CURSOR_PLACEHOLDER_CHAR);
    if (siblingNode.isEmpty()) {
      editor.update(
        () => {
          siblingNode.append(cursorPositionHelperNode);
          cursorPositionHelperNode.select(1, 1);
        },
        { tag: "history-merge" },
      );
      return true;
    } else {
      editor.update(
        () => {
          const targetChild =
            direction === "right" ? siblingNode.getFirstChild() : siblingNode.getLastChild();
          if (!targetChild) return;
          direction === "right"
            ? targetChild.insertBefore(cursorPositionHelperNode) &&
              cursorPositionHelperNode.select(1, 1)
            : targetChild.insertAfter(cursorPositionHelperNode) &&
              cursorPositionHelperNode.select(0, 0);
        },
        { tag: "history-merge" },
      );
    }
    return true;
  } else {
    //SIBLING IS BLOCK
    return false;
  }
}

function handleNoSibling(
  currentNode: LexicalNode,
  editor: LexicalEditor,
  direction: "left" | "right",
  canHavePlaceholder: (node: LexicalNode) => boolean,
): boolean {
  const currentParent = currentNode.getParent();
  if (!$isElementNode(currentParent) || !currentParent.isInline()) {
    return false;
  }
  const parentSibling =
    direction === "right" ? currentParent.getNextSibling() : currentParent.getPreviousSibling();

  const canInsert = direction === "right" ? currentParent.canInsertTextAfter() : true;

  if (!parentSibling && !canInsert) {
    return false;
  }

  if (!parentSibling) {
    editor.update(
      () => {
        const placeHolderNode =
          direction === "right"
            ? insertPlaceholder(currentParent, CursorPosition.End)
            : insertPlaceholder(currentParent, CursorPosition.Start);
        if (!placeHolderNode) return;
        const offset = direction === "right" ? 1 : 0;
        placeHolderNode.select(offset, offset);
      },
      { tag: "history-merge" },
    );
    return true;
  }

  if ($isTextNode(parentSibling)) {
    const textNodeParent = parentSibling.getParent();
    if (textNodeParent && !canHavePlaceholder(textNodeParent)) {
      return false;
    }
    editor.update(
      () => {
        insertPlaceholder(
          parentSibling,
          direction === "right" ? CursorPosition.Start : CursorPosition.End,
        );
        const offset = direction === "right" ? 0 : parentSibling.getTextContentSize();
        parentSibling.select(offset, offset);
        return;
      },
      { tag: "history-merge" },
    );
    return true;
  }

  if ($isElementNode(parentSibling)) {
    debugger;
    const nodeParent = parentSibling.getParent();
    if (nodeParent && canHavePlaceholder(nodeParent)) {
      editor.update(
        () => {
          const placeholder =
            direction === "right"
              ? insertPlaceholder(currentParent, CursorPosition.End, false)
              : insertPlaceholder(currentParent, CursorPosition.Start, false);
          debugger;
          placeholder.select(1, 1);
        },
        { tag: "history-merge" },
      );
      return true;
    }
    const findEligibleDescendant = (node: LexicalNode): LexicalNode | null => {
      if (canHavePlaceholder(node)) {
        return node;
      }
      if ($isElementNode(node)) {
        const child = direction === "right" ? node.getFirstChild() : node.getLastChild();
        if (child) {
          return findEligibleDescendant(child);
        }
      }
      return null;
    };
    const targetNode = findEligibleDescendant(parentSibling);
    if (!targetNode) return false;
    editor.update(
      () => {
        const placeholder =
          direction === "right"
            ? insertPlaceholder(targetNode, CursorPosition.Start, false)
            : insertPlaceholder(targetNode, CursorPosition.End, false);
        placeholder.select(1, 1);
      },
      { tag: "history-merge" },
    );
    return true;
  }
  return false;
}

function $getSelectionData(selection: BaseSelection | null) {
  if (!selection?.isCollapsed() || !$isRangeSelection(selection)) {
    return null;
  }

  const node = selection.isBackward() ? selection.focus.getNode() : selection.anchor.getNode();

  if (!$isTextNode(node)) {
    return null;
  }

  const textContent = node.getTextContent();

  function getPlaceholderData(content: string, placeholderChar: string) {
    const regex = new RegExp(placeholderChar, "g");
    const positions = Array.from(content.matchAll(regex), (match) => match.index ?? -1);
    const count = positions.length;
    return {
      count,
      positions,
      atStart: count > 0 && positions[0] === 0,
      atEnd: count > 0 && positions[count - 1] === content.length - 1,
    };
  }

  const placeholderData = getPlaceholderData(textContent, CURSOR_PLACEHOLDER_CHAR);
  const cleanContent = textContent.replaceAll(CURSOR_PLACEHOLDER_CHAR, "");
  const cleanContentSize = cleanContent.length;

  // Recalculate offset with cleanContent knowing that the cursor placeholder is not included
  const offset = placeholderData.positions.reduce(
    (offset, placeholderPos) => (placeholderPos < selection.anchor.offset ? offset - 1 : offset),
    selection.anchor.offset,
  );

  //calculate position
  let position: CursorPosition = CursorPosition.Middle;
  if (cleanContentSize === 1) {
    if (offset === 0) {
      position = CursorPosition.Start;
    } else {
      position = CursorPosition.End;
    }
  } else {
    //is at starting edge or near starting edge
    if (offset === 1 || offset === 0) {
      position = CursorPosition.Start;
    }
    //is at ending edge or near ending edge
    if (offset === cleanContentSize || offset === cleanContentSize - 1) {
      position = CursorPosition.End;
    }
  }

  /**
   * Cursor position is adjacent to a Cursor Placeholder
   */
  const isCursorPlaceHolder =
    (position === CursorPosition.Start && placeholderData.atStart) ||
    (position === CursorPosition.End && placeholderData.atEnd);

  /**
   * Cursor or Cursor Placeholder is at the very end or start of the node
   */
  const isEdge = offset === 0 || offset === cleanContentSize || isCursorPlaceHolder;
  return {
    selection,
    offset,
    node,
    position,
    isEdge,
    isCursorPlaceHolder,
    placeholderData,
    cleanContent,
    cleanContentSize,
  };
}
