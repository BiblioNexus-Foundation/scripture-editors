import { $getNodeByKey, EditorState, ElementNode, LexicalNode } from "lexical";
import { PerfAction, PerfKind } from "./PerfOperation";
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
export function getPerfKindFromNode(node: UsfmElementNode | ElementNode) {
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
export function checkIsSequence(node: UsfmElementNode | ElementNode) {
  return ["root", "graft"].includes(node.getType() || "");
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

/**
 * Retrieves the common path from the dirty elements based on the provided editor state.
 * @param dirtyElements - A map of dirty elements.
 * @param editorState - The editor state.
 * @returns An array representing the path from the dirty elements.
 */
export function getPathFromElements(dirtyElements: Map<string, boolean>, editorState: EditorState) {
  const perfPathArray = [];
  for (const [nodeKey] of dirtyElements) {
    const { index, kind, target } = getNodeInfo(editorState, nodeKey);
    if (kind === "sequence") {
      perfPathArray.unshift(target ?? "main"); // Add target to the path array if it's a sequence
      break;
    }
    perfPathArray.unshift(index); // Add index to the path array
    if (kind === "content") {
      perfPathArray.unshift("content"); // Add "content" to the path array if it's a content element
    }
    if (kind === "block") {
      perfPathArray.unshift("blocks"); // Add "blocks" to the path array if it's a block
    }
  }
  return perfPathArray;
}

// Function to get information about a node in the editor state
/**
 * Retrieves information about a node in the editor state.
 * @param editorState - The current editor state.
 * @param nodeKey - The key of the node to retrieve information for.
 * @returns An object containing information about the node.
 */
function getNodeInfo(
  editorState: EditorState,
  nodeKey: string,
): {
  node?: UsfmElementNode;
  index?: number;
  kind?: string;
  children?: LexicalNode[];
  type?: string;
  target?: string;
} {
  return editorState.read(() => {
    const node: UsfmElementNode | null = $getNodeByKey(nodeKey);
    if (!node) return {}; // If the node doesn't exist, return an empty object
    const parent = node.getParent();
    const atts = node.getAttributes?.() || {};
    const type = atts["data-type"];
    const target = atts["data-target"];
    const kind = getPerfKindFromNode(node); // Get the kind of the node
    const index = parent ? parent.getChildrenKeys?.().findIndex((key) => nodeKey === key) : 0; // Get the index of the node in its parent's children
    const children = node.getChildren?.(); // Get the children of the node
    return { node, index, kind, children, type, target };
  });
}
