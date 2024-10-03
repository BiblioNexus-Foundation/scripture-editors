/* eslint-disable no-debugger */
import {
  $addUpdateTag,
  $createTextNode,
  $getPreviousSelection,
  $getSelection,
  $isElementNode,
  $isRootNode,
  $isTextNode,
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
import { $processSelection, CursorData, CursorPosition } from "./processSelection";

export function registerCursorHandlers(
  editor: LexicalEditor,
  canHavePlaceholder: (node: LexicalNode) => boolean = () => true,
  updateTags?: string[],
) {
  const unRegisterCursorHandlers = mergeRegister(
    registerCursorRemovalOnEditorBlur(),
    registerCursorRemovalOnTextTransform(),
    registerCursorRemovalOnSelectionChange(),
    registerCursorInsertOnRightArrowDown(),
    registerCursorInsertOnLeftArrowDown(),
  );

  function editorUpdate(update: (() => void) | (() => void), tag?: string) {
    const options = tag ? { tag: tag } : undefined;
    editor.update(() => {
      update();
      updateTags?.forEach((tag) => $addUpdateTag(tag));
    }, options);
  }

  function registerCursorRemovalOnEditorBlur(): () => void {
    return editor.registerCommand(
      BLUR_COMMAND,
      () => {
        const editorSate = editor.getEditorState();
        editorSate.read(() => {
          const selection = $getSelection();
          if (!selection) return false;
          const selectionData = $processSelection(selection);
          if (!selectionData) return false;

          const node = selectionData.node;
          const textContent = node.getTextContent();
          if (textContent.includes(CURSOR_PLACEHOLDER_CHAR)) {
            editorUpdate(() => {
              $removeCursorPlaceholder(node);
            });
          }
        });
        return false;
      },
      0,
    );
  }

  function registerCursorRemovalOnSelectionChange(): () => void {
    return editor.registerUpdateListener(
      ({ editorState, prevEditorState, dirtyLeaves, dirtyElements, tags }) => {
        if (tags.has("history-merge")) return;

        const previousSelectionData = prevEditorState.read(() =>
          $processSelection($getSelection()),
        );
        // Skip if there's no previous selection or if there are dirty nodes
        if (!previousSelectionData || dirtyLeaves.size > 0 || dirtyElements.size > 0) return;

        editorState.read(() => {
          const currentSelectionData = $processSelection($getSelection());
          if (!currentSelectionData) return;

          // Helper function to remove placeholder characters from a node
          const removePlaceholders = (data: ReturnType<typeof $processSelection>) => {
            if (data?.placeholders.count) {
              editorUpdate(() => {
                $removeCursorPlaceholder(data.node);
              });
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

  function registerCursorRemovalOnTextTransform(): () => void {
    return editor.registerNodeTransform(TextNode, (node) => {
      const textContent = node.getTextContent();
      const previousSelectionData = $processSelection($getPreviousSelection());
      if (!previousSelectionData) return;
      const helperOffset = textContent.indexOf(CURSOR_PLACEHOLDER_CHAR);
      if (helperOffset === -1) return;
      if (previousSelectionData.node.getKey() !== node.getKey()) return;
      if (previousSelectionData.cursor.position === CursorPosition.Start) {
        const currentSelectionData = $processSelection($getSelection());
        if (!currentSelectionData) return;
        const { selection } = currentSelectionData;
        const anchorOffset = selection.anchor.offset;
        const focusOffset = selection.focus.offset;
        $removeCursorPlaceholder(node);
        if (helperOffset < focusOffset) {
          node.select(anchorOffset - 1, focusOffset - 1);
        }
      }
    });
  }

  function registerCursorInsertOnLeftArrowDown() {
    return registerCursorInsertOnArrowDown("left");
  }

  function registerCursorInsertOnRightArrowDown() {
    return registerCursorInsertOnArrowDown("right");
  }

  function registerCursorInsertOnArrowDown(direction: "left" | "right"): () => void {
    const command = direction === "left" ? KEY_ARROW_LEFT_COMMAND : KEY_ARROW_RIGHT_COMMAND;

    return editor.registerCommand(
      command,
      (e) => {
        if (e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
          return false;
        }
        const result = handleArrowCommand(direction);
        if (result) {
          e.preventDefault();
        }
        return result;
      },
      0,
    );
  }

  function handleArrowCommand(direction: "left" | "right"): boolean {
    const selectionData = $processSelection($getSelection(), direction);
    if (!selectionData) return false;
    const { node: currentNode, cursor, content } = selectionData;

    // Check if the node can have a placeholder
    if (!canHavePlaceholder(currentNode)) {
      return false;
    }

    function handleCursorIsAtPlaceholder() {
      if (cursor.isMovingAwayFromEdge) {
        editorUpdate(() => {
          $removeCursorPlaceholder(currentNode);
          const newOffset = direction === "left" ? cursor.offset - 1 : cursor.offset + 1;
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
      //If is not moving away from edge execution should continue
    }

    // If current node already contains a cursor placeholder it should be removed
    if (cursor.isPlaceholder) {
      const isHandleCompleted = handleCursorIsAtPlaceholder();
      if (isHandleCompleted) return true;
    }

    // Prevent unnecessary cursor handling when the cursor is not at an edge or one character away from edge
    if (cursor.position === CursorPosition.Middle || cursor.isMovingAwayFromEdge) {
      return false;
    }

    if (cursor.isMovingTowardsEdge) {
      editorUpdate(() => {
        const cursorPosition = cursor.isMovingLeft ? CursorPosition.Start : CursorPosition.End;
        const selectOffset = cursor.isMovingLeft ? 1 : 0;
        const cursorPlaceholderNode = $insertCursorPlaceholder(currentNode, cursorPosition);
        cursorPlaceholderNode.select(selectOffset, selectOffset);
      });
      return true;
    }

    if (cursor.isSwitchingEdge) {
      editorUpdate(() => {
        const cursorPosition = cursor.isMovingRight ? CursorPosition.End : CursorPosition.Start;
        const selectOffset = cursor.isMovingRight ? 0 : 1;
        const cursorPlaceholderNode = $insertCursorPlaceholder(currentNode, cursorPosition);
        cursorPlaceholderNode.select(selectOffset, selectOffset);
      });
      return true;
    }

    const siblingNode = cursor.isMovingRight
      ? currentNode.getNextSibling()
      : currentNode.getPreviousSibling();

    if (!siblingNode) {
      return handleNoSibling(currentNode, cursor);
    }

    if (!canHavePlaceholder(siblingNode)) {
      const eligibleDescendant = findDescendantEligibleForPlaceholder(siblingNode, cursor);
      if (eligibleDescendant) {
        if ($isTextNode(eligibleDescendant)) {
          if (cursor.isMovingOutwards) {
            editorUpdate(() => {
              const cursorPosition = cursor.isMovingToNextNode
                ? CursorPosition.Start
                : CursorPosition.End;
              const selectOffset = cursor.isMovingToNextNode ? 1 : 0;
              const cursorPlaceholderNode = $insertCursorPlaceholder(
                eligibleDescendant,
                cursorPosition,
              );
              cursorPlaceholderNode.select(selectOffset, selectOffset);
            });
            return true; // Prevent default behavior
          }
        } else if ($isElementNode(eligibleDescendant)) {
          return handleElementSibling(eligibleDescendant, cursor);
        }

        return true;
      }
      // If no eligible descendant is found, continue with the default behavior
      return false;
    }

    if ($isTextNode(siblingNode)) {
      if (cursor.isMovingOutwards) {
        editorUpdate(() => {
          const cursorPosition = cursor.isMovingToNextNode
            ? CursorPosition.Start
            : CursorPosition.End;
          const selectOffset = cursor.isMovingToNextNode ? 1 : 0;
          const cursorPlaceholderNode = $insertCursorPlaceholder(siblingNode, cursorPosition);
          cursorPlaceholderNode.select(selectOffset, selectOffset);
        });
        return true;
      }
    }

    if ($isElementNode(siblingNode)) {
      return handleElementSibling(siblingNode, cursor);
    }

    console.warn("UNHANDLED CURSOR HELPER CASE");
    return false;
  }

  function handleElementSibling(siblingNode: ElementNode, cursor: CursorData): boolean {
    if (siblingNode.isInline()) {
      if (siblingNode.isEmpty()) {
        editorUpdate(() => {
          const cursorPlaceholderNode = $createCursorPlaceholderNode();
          siblingNode.append(cursorPlaceholderNode);
          cursorPlaceholderNode.select(1, 1);
        });
        return true;
      } else {
        editorUpdate(() => {
          const targetChild = cursor.isMovingRight
            ? siblingNode.getFirstChild()
            : siblingNode.getLastChild();
          if (!targetChild) return;

          const cursorPosition = cursor.isMovingRight ? CursorPosition.Start : CursorPosition.End;
          const selectOffset = cursor.isMovingRight ? 1 : 0;
          const cursorPlaceholderNode = $insertCursorPlaceholder(targetChild, cursorPosition);
          cursorPlaceholderNode.select(selectOffset, selectOffset);
        });
      }
      return true;
    } else {
      //SIBLING IS BLOCK
      return false;
    }
  }

  function findDescendantEligibleForPlaceholder(
    node: LexicalNode,
    cursor: CursorData,
  ): LexicalNode | null {
    if (canHavePlaceholder(node)) {
      return node;
    }
    if ($isElementNode(node)) {
      const child = cursor.isMovingRight ? node.getFirstChild() : node.getLastChild();
      if (child) {
        return findDescendantEligibleForPlaceholder(child, cursor);
      }
    }
    return null;
  }

  function handleNoSibling(currentNode: LexicalNode, cursor: CursorData): boolean {
    function getValidAncestor(node: LexicalNode, cursor: CursorData) {
      const ancestor = node.getParent();
      if (!ancestor) return { ancestor: null, ancestorSibling: null };
      if (!$isElementNode(ancestor) || !ancestor.isInline()) {
        return { ancestor: null, ancestorSibling: null };
      }
      const ancestorParent = ancestor.getParent();
      if (!ancestorParent || $isRootNode(ancestorParent))
        return { ancestor: null, ancestorSibling: null };

      const parentCanHavePlaceholder = canHavePlaceholder(ancestorParent);
      const canHavePlaceholderAsSibling = cursor.isMovingRight
        ? ancestor.canInsertTextAfter()
        : ancestor.canInsertTextBefore();

      //check that ancestor can have a placeholder and insert after or before depending on direction
      const canInsert = parentCanHavePlaceholder && canHavePlaceholderAsSibling;

      //check that ancestor has a previous sibling or next sibling depending on direction
      const ancestorSibling = cursor.isMovingRight
        ? ancestor.getNextSibling()
        : ancestor.getPreviousSibling();

      if (!ancestorSibling && !canInsert) {
        return getValidAncestor(ancestor, cursor);
      }

      if ($isTextNode(ancestorSibling) && !canInsert) {
        return { ancestor: null, ancestorSibling: null };
      }

      return { ancestor, ancestorSibling };
    }
    const { ancestor, ancestorSibling } = getValidAncestor(currentNode, cursor);

    if (!ancestor && !ancestorSibling) {
      return false;
    }

    if (!ancestorSibling) {
      editorUpdate(() => {
        const cursorPosition = cursor.isMovingLeft ? CursorPosition.Start : CursorPosition.End;
        const selectOffset = cursor.isMovingLeft ? 0 : 1;
        const cursorPlaceholderNode = $insertCursorPlaceholder(ancestor, cursorPosition);
        cursorPlaceholderNode.select(selectOffset, selectOffset);
      });
      return true;
    }

    if ($isTextNode(ancestorSibling)) {
      editorUpdate(() => {
        const cursorPosition = cursor.isMovingLeft ? CursorPosition.End : CursorPosition.Start;
        const selectOffset = cursor.isMovingLeft ? 0 : 1;
        const cursorPlaceholderNode = $insertCursorPlaceholder(ancestorSibling, cursorPosition);
        cursorPlaceholderNode.select(selectOffset, selectOffset);
      });
      return true;
    }

    if ($isElementNode(ancestorSibling)) {
      const nodeParent = ancestorSibling.getParent();
      if (nodeParent && canHavePlaceholder(nodeParent)) {
        editorUpdate(() => {
          const cursorPosition = cursor.isMovingRight ? CursorPosition.End : CursorPosition.Start;
          const cursorPlaceholderNode = $insertCursorPlaceholder(ancestor, cursorPosition, false);
          cursorPlaceholderNode.select(1, 1);
        });
        return true;
      }

      const targetNode = findDescendantEligibleForPlaceholder(ancestorSibling, cursor);
      if (!targetNode) return false;
      editorUpdate(() => {
        const placeholder = cursor.isMovingRight
          ? $insertCursorPlaceholder(targetNode, CursorPosition.Start, false)
          : $insertCursorPlaceholder(targetNode, CursorPosition.End, false);
        placeholder.select(1, 1);
      });
      return true;
    }
    return false;
  }

  return unRegisterCursorHandlers;
}

function $createCursorPlaceholderNode() {
  return $createTextNode(CURSOR_PLACEHOLDER_CHAR);
}

function $insertCursorPlaceholder(
  node: LexicalNode,
  position: CursorPosition.Start | CursorPosition.End,
  restoreSelection = false,
) {
  const cursorPlaceholderNode = $createCursorPlaceholderNode();
  position === CursorPosition.Start
    ? node.insertBefore(cursorPlaceholderNode, restoreSelection)
    : node.insertAfter(cursorPlaceholderNode, restoreSelection);
  return cursorPlaceholderNode;
}

function $removeCursorPlaceholder(node: TextNode) {
  const textContent = node.getTextContent();
  node.setTextContent(textContent.replaceAll(CURSOR_PLACEHOLDER_CHAR, ""));
}
