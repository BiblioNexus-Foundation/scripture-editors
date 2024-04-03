import {
  $getNodeByKey,
  $isElementNode,
  EditorState,
  ElementNode,
  LexicalNode,
  SerializedElementNode,
  SerializedLexicalNode,
} from "lexical";
import { PerfKind } from "./types";
import { SerializedUsfmElementNode, UsfmElementNode } from "../../nodes/UsfmElementNode";
/**
 * this module provides utility functions for the Perf plugin.
 * @module
 */

/**
 * Finds the closest non-orphan ancestor node and returns its key.
 * @param nodeKey - The key of the node to check.
 * @param editorState - The current editor state.
 * @returns The key of the closest non-orphan ancestor node, or null if no such ancestor exists.
 * @remarks This function drills up the tree to find the closest non-orphan ancestor node. if the current node has a parent, it returns the current node's key. If the current node does not have a parent, it recursively calls itself with the parent node's key until it finds a non-orphan ancestor and returns its key.
 */
export function findClosestNonOrphanAncestorKey(
  nodeKey: string,
  editorState: EditorState,
): string | null {
  const node = editorState._nodeMap.get(nodeKey);
  if (!node) return null;
  const parentKey = node.__parent;
  if (!parentKey) return nodeKey;
  const hadParent = !!$getNodeByKey(parentKey); // Did its current parent exist
  return hadParent ? nodeKey : findClosestNonOrphanAncestorKey(parentKey, editorState);
}

/**
 * Recursively gets the perf path from the given lexical node .
 * @param node - The node to get the path for.
 * @param pathArray - The array representing the path to the node.
 * @returns The array representing the path to the node.
 */
export function recursiveGetNodePath(
  node: UsfmElementNode,
  pathArray: Array<string | number> = [],
): Array<string | number> {
  const parent: UsfmElementNode | null = node.getParent();
  const kind = getPerfKindFromNode(node);
  const nodeKey = node.getKey();
  const index = parent ? parent.getChildrenKeys?.().findIndex((key) => nodeKey === key) : 0;

  if (kind === PerfKind.Sequence) {
    const target = node.getAttributes?.()?.["data-target"];
    pathArray.unshift(target ?? "main"); // Add the target to the path array
    return pathArray;
  }

  pathArray.unshift(index); // Add the index to the path array

  if (kind === PerfKind.ContentElement) {
    pathArray.unshift("content"); // Add "content" to the path array
  }

  if (kind === PerfKind.Block) {
    pathArray.unshift("blocks"); // Add "blocks" to the path array
  }

  return parent ? recursiveGetNodePath(parent, pathArray) : pathArray; // Recursively call the function with the parent node
}

// Function to determine the perf kind based on the path length
export function getPerfKindbyPathLength(len: number): PerfKind {
  switch (true) {
    case len === 1:
      return PerfKind.Sequence; // If the path length is 1, it's a sequence
    case len === 3:
      return PerfKind.Block; // If the path length is 3, it's a block
    default:
      return PerfKind.ContentElement; // Otherwise, it's a content element
  }
}

/**
 * Function to determine the perf node kind based on the node.
 * @param node - The node to determine the kind for.
 * @param parent - The parent node of the given node.
 * @returns The kind of the node.
 */
export function getPerfKindFromNode(node: LexicalNode | ElementNode) {
  if (node && checkIsSequence(node)) return PerfKind.Sequence; // If the node is a sequence, return "sequence"
  const parent = node.getParent();
  if (parent && checkIsSequence(parent)) return PerfKind.Block; // If the parent is a sequence, return PerfKind.Block
  return PerfKind.ContentElement; // Otherwise, return "content"
}

/**
 * Function to check if a node is a sequence.
 * @param node - The node to check.
 * @returns A boolean indicating whether the node is a sequence.
 */
export function checkIsSequence(node: LexicalNode | ElementNode) {
  return ["root", "graft"].includes(node.getType() || "");
}

/**
 * Function to recursively get the JSON representation of a node and its children.
 * @param node - The node to get the JSON representation for.
 * @returns The JSON representation of the node and its children.
 */
export const getNodeJson = (node: UsfmElementNode) => {
  const _nodeJson: SerializedUsfmElementNode = exportNodeToJSON(node);
  if (_nodeJson?.children) {
    _nodeJson.children = node.getChildren<UsfmElementNode>().map((node) => getNodeJson(node));
  }
  return _nodeJson;
};

export function exportNodeToJSON<SerializedNode extends SerializedLexicalNode>(
  node: LexicalNode,
): SerializedNode {
  const serializedNode = node.exportJSON();
  const nodeClass = node.constructor;

  if (serializedNode.type !== nodeClass.getType()) {
    throw new Error("Serialized node type does not match node type");
  }

  if ($isElementNode(node)) {
    const serializedChildren = (serializedNode as SerializedElementNode).children;
    if (!Array.isArray(serializedChildren)) {
      throw new Error("Children must be an array");
    }

    const children = node.getChildren();

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const serializedChildNode = exportNodeToJSON(child);
      serializedChildren.push(serializedChildNode);
    }
  }

  // @ts-expect-error - This is a private method
  return serializedNode;
}
