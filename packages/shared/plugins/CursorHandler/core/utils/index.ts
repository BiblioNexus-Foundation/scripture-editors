import {
  $createTextNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootNode,
  $isTextNode,
  LexicalNode,
  TextNode,
} from "lexical";
import { CURSOR_PLACEHOLDER_CHAR } from "./constants";
import { CursorData, CursorPosition } from "./CursorSelectionContext";

export function $isCursorAtEdgeofBlock() {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return false;
  const endpoints = selection.getStartEndPoints();
  if (!endpoints) return false;
  const endNode = endpoints[1].getNode();
  const endNodeContent = endNode.getTextContent().replace(CURSOR_PLACEHOLDER_CHAR, "");
  if (endpoints[1].offset === 0 || endNodeContent.length === endpoints[1].offset) {
    function isNodeAtEdgeofBlock(node: LexicalNode): boolean {
      const parent = node.getParent();
      const nextSibling = node.getNextSibling();
      if ($isRootNode(parent)) return true;
      if (!parent || nextSibling) return false;
      if (!parent.isInline()) {
        return true;
      }
      return isNodeAtEdgeofBlock(parent);
    }
    const isAtEdge = isNodeAtEdgeofBlock(endNode);
    if (isAtEdge) {
      return true;
    }
    return false;
  }
  return false;
}

export function $createCursorPlaceholderNode() {
  return $createTextNode(CURSOR_PLACEHOLDER_CHAR);
}

export function $insertCursorPlaceholder(
  node: LexicalNode,
  position: CursorPosition.Start | CursorPosition.End,
  restoreSelection = false,
) {
  const cursorPlaceholderNode = $createCursorPlaceholderNode();
  if (position === CursorPosition.Start) node.insertBefore(cursorPlaceholderNode, restoreSelection);
  else node.insertAfter(cursorPlaceholderNode, restoreSelection);
  return cursorPlaceholderNode;
}

export function $removeCursorPlaceholder(node: TextNode) {
  const textContent = node.getTextContent();
  node.setTextContent(textContent.replaceAll(CURSOR_PLACEHOLDER_CHAR, ""));
}

export function $getValidAncestor(
  node: LexicalNode,
  cursor: CursorData,
  canHavePlaceholder: (node: LexicalNode) => boolean,
) {
  const ancestor = node.getParent();
  if (!ancestor || !$isElementNode(ancestor) || !ancestor.isInline()) {
    return { ancestor: null, ancestorSibling: null };
  }

  const ancestorParent = ancestor.getParent();
  if (!ancestorParent || $isRootNode(ancestorParent)) {
    return { ancestor: null, ancestorSibling: null };
  }

  const parentCanHavePlaceholder = canHavePlaceholder(ancestorParent);
  const canHavePlaceholderAsSibling = cursor.isMovingRight
    ? ancestor.canInsertTextAfter()
    : ancestor.canInsertTextBefore();

  const canInsert = parentCanHavePlaceholder && canHavePlaceholderAsSibling;

  const ancestorSibling = cursor.isMovingRight
    ? ancestor.getNextSibling()
    : ancestor.getPreviousSibling();

  if (!ancestorSibling && !canInsert) {
    return $getValidAncestor(ancestor, cursor, canHavePlaceholder);
  }

  if ($isTextNode(ancestorSibling) && !canInsert) {
    return { ancestor: null, ancestorSibling: null };
  }

  return { ancestor, ancestorSibling };
}

export function $findDescendantEligibleForPlaceholder(
  node: LexicalNode,
  cursor: CursorData,
  canHavePlaceholder: (node: LexicalNode) => boolean,
): LexicalNode | null {
  if (canHavePlaceholder(node)) {
    return node;
  }
  if ($isElementNode(node)) {
    const child = cursor.isMovingRight ? node.getFirstChild() : node.getLastChild();
    if (child) {
      return $findDescendantEligibleForPlaceholder(child, cursor, canHavePlaceholder);
    }
  }
  return null;
}
