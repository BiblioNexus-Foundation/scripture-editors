import { $getNodeByKey, EditorState, ElementNode, LexicalNode } from "lexical";
import { PerfAction } from "./PerfOperation";
import { SerializedUsfmElementNode, UsfmElementNode } from "shared/nodes/UsfmElementNode";
/**
 * this module provides utility functions for the Perf plugin.
 * @module
 */

/**
 * Checks if a node has moved within the lexical tree.
 * @param previousNode - The previous node.
 * @param currentNode - The current node.
 * @returns A boolean indicating whether the node has moved.
 */
export const didNodeMove = (previousNode: LexicalNode, currentNode: LexicalNode): boolean => {
  //TODO: Check if this is the correct way to compare the nodes, the correct way should be to compare the keys and not the nodes themselves
  return !(
    previousNode.__parent === currentNode.__parent &&
    previousNode.__prev === currentNode.__prev &&
    previousNode.__next === currentNode.__next
  );
};

/**
 * Determines the action performed on a lexical node based on its previous and current state.
 * @param previousNode The previous state of the lexical node.
 * @param currentNode The current state of the lexical node.
 * @returns The action performed on the lexical node.
 */
export function getNodeAction(previousNode?: LexicalNode, currentNode?: LexicalNode): PerfAction {
  if (previousNode && currentNode) {
    return didNodeMove(previousNode, currentNode) ? PerfAction.Move : PerfAction.Replace;
  } else {
    return previousNode ? PerfAction.Delete : PerfAction.Add;
  }
}

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
  const kind = getPerfKindFromNode(node, parent);
  const nodeKey = node.getKey();
  const index = parent ? parent.getChildrenKeys?.().findIndex((key) => nodeKey === key) : 0;

  if (kind === "sequence") {
    const target = node.getAttributes?.()?.["data-target"];
    pathArray.unshift(target ?? "main"); // Add the target to the path array
    return pathArray;
  }

  pathArray.unshift(index); // Add the index to the path array

  if (kind === "content") {
    pathArray.unshift("content"); // Add "content" to the path array
  }

  if (kind === "block") {
    pathArray.unshift("blocks"); // Add "blocks" to the path array
  }

  return parent ? recursiveGetNodePath(parent, pathArray) : pathArray; // Recursively call the function with the parent node
}

// Function to determine the perf kind based on the path length
export function getPerfKindbyPathLength(len: number) {
  switch (true) {
    case len === 1:
      return "sequence"; // If the path length is 1, it's a sequence
    case len === 3:
      return "block"; // If the path length is 3, it's a block
    default:
      return "contentElement"; // Otherwise, it's a content element
  }
}

/**
 * Function to determine the perf node kind based on the node.
 * @param node - The node to determine the kind for.
 * @param parent - The parent node of the given node.
 * @returns The kind of the node.
 */
export function getPerfKindFromNode(
  node: UsfmElementNode | ElementNode,
  parent: UsfmElementNode | ElementNode | null,
) {
  if (node && checkIsSequence(node)) return "sequence"; // If the node is a sequence, return "sequence"
  if (parent && checkIsSequence(parent)) return "block"; // If the parent is a sequence, return "block"
  return "content"; // Otherwise, return "content"
}

/**
 * Function to check if a node is a sequence.
 * @param node - The node to check.
 * @returns A boolean indicating whether the node is a sequence.
 */
export function checkIsSequence(node: UsfmElementNode | ElementNode) {
  return ["root", "graft"].includes(node?.getType() || "");
}

/**
 * Function to recursively get the JSON representation of a node and its children.
 * @param node - The node to get the JSON representation for.
 * @returns The JSON representation of the node and its children.
 */
export const getNodeJson = (node: UsfmElementNode) => {
  const _nodeJson: SerializedUsfmElementNode = node.exportJSON();
  if (_nodeJson?.children) {
    _nodeJson.children = node.getChildren<UsfmElementNode>().map((node) => getNodeJson(node));
  }
  return _nodeJson;
};
