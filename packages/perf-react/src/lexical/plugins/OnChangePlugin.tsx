import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, EditorState, ElementNode, LexicalNode } from "lexical";
import { UsfmElementNode, SerializedUsfmElementNode } from "shared/nodes/UsfmElementNode";
import { UpdateListener } from "lexical/LexicalEditor";

export const OnChangePlugin = ({ onChange }: { onChange: UpdateListener }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(
      ({ editorState, dirtyElements, dirtyLeaves, prevEditorState, normalizedNodes, tags }) => {
        if (dirtyElements.size > 0) {
          // Get the path array from dirty elements
          const perfPathArray = getPathFromElements(dirtyElements, editorState);
          // Get the nodes corresponding to dirty elements
          const nodes = [...dirtyElements].map(([nodeKey]) =>
            editorState.read(() => $getNodeByKey(nodeKey)),
          );
          console.log("ELEMENTS", { dirtyElements, perfPathArray, nodes });
        }
        if (dirtyLeaves.size > 0) {
          // Get the performance actions from dirty leaves
          const perfActions = getActionsFromLeaves(dirtyLeaves, editorState, prevEditorState);
          onChange({
            editorState,
            dirtyElements,
            dirtyLeaves,
            prevEditorState,
            normalizedNodes,
            tags,
          });
          // Group the common ancestor keys of perf actions
          const commonAncestors = groupCommonAncestorKeys(perfActions);
          // Generate ranges for each common ancestor
          const ranges = Object.values(commonAncestors).map(
            ({ commonAncestorKeys, originalArrays }) => {
              const commonAncestorPath = commonAncestorKeys.join("/");
              // Get the numbers from the common ancestor object
              const numbers = getNumbersFromObject({ commonAncestorKeys, originalArrays });
              // Generate ranges from the numbers
              const ranges = generateRanges(numbers);
              return { path: commonAncestorPath, numbers, ranges };
            },
          );
          console.log("LEAVES", { dirtyLeaves, perfActions, commonAncestors, ranges });
        }
      },
    );
  }, [editor, onChange]);

  return null;
};

// Function to get actions from dirty leaves
function getActionsFromLeaves(
  dirtyLeaves: Set<string>,
  editorState: EditorState,
  prevEditorState: EditorState,
) {
  const perfActions = [];
  for (const nodeKey of dirtyLeaves) {
    // Get perf action for each dirty leaf node
    const perfAction = getPerfAction(nodeKey, prevEditorState, editorState);
    perfActions.push(perfAction);
  }
  return perfActions;
}

// Function to determine the perf kind based on the path length
function getPerfKindbyPathLength(len: number) {
  switch (true) {
    case len === 1:
      return "sequence"; // If the path length is 1, it's a sequence
    case len === 3:
      return "block"; // If the path length is 3, it's a block
    default:
      return "contentElement"; // Otherwise, it's a content element
  }
}

// Interface for the PerfAction object
interface PerfAction {
  pathArray: Array<string | number>; // Array representing the path to the node
  path: string; // String representing the path to the node
  kind: string; // Type of node (sequence, block, contentElement)
  nodeJson: SerializedUsfmElementNode; // Serialized JSON representation of the node
  action: "added" | "deleted" | "replaced"; // Action performed on the node
  nodeKey: string; // Key of the node
}

// Function to get the PerfAction object for a given node
function getPerfAction(
  nodeKey: string,
  prevEditorState: EditorState,
  editorState: EditorState,
): PerfAction {
  const deleted = !editorState._nodeMap.has(nodeKey);
  // Read the previous editor state to start filling the PerfAction object
  const perfAction: PerfAction = prevEditorState.read(() => {
    const node: UsfmElementNode | null = $getNodeByKey(nodeKey);
    if (!node) {
      // If the node didn't exist, it means it was added
      return {
        action: "added",
        nodeKey: findClosestNonOrphanAncestorKey(nodeKey, editorState) as string,
      };
    }
    // If the node existed, it means it was replaced or deleted
    const pathArray = recursiveGetNodePath(node);
    return {
      pathArray,
      path: pathArray.join("/"),
      kind: getPerfKindbyPathLength(pathArray.length),
      action: deleted ? "deleted" : "replaced",
      nodeKey,
    };
  }) as PerfAction;

  // Read the current editor state to get additional information for the PerfAction object
  editorState.read(() => {
    const node: UsfmElementNode | null = $getNodeByKey(perfAction.nodeKey);
    if (!node) return null;
    const nodeJson = getNodeJson(node);
    if (perfAction.action === "added") {
      const pathArray = recursiveGetNodePath(node);
      perfAction.kind = getPerfKindbyPathLength(pathArray.length);
      perfAction.path = pathArray.join("/");
      perfAction.pathArray = pathArray;
    }
    if (["added", "replaced"].includes(perfAction.action)) perfAction.nodeJson = nodeJson;
  });

  return perfAction;
}

// Function to get the path from dirty elements
function getPathFromElements(dirtyElements: Map<string, boolean>, editorState: EditorState) {
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

// Function to recursively get the JSON representation of a node and its children
const getNodeJson = (node: UsfmElementNode) => {
  const _nodeJson: SerializedUsfmElementNode = node.exportJSON();
  if (_nodeJson?.children) {
    _nodeJson.children = node.getChildren<UsfmElementNode>().map((node) => getNodeJson(node));
  }
  return _nodeJson;
};

function checkIsSequence(node: UsfmElementNode | ElementNode) {
  return ["root", "graft"].includes(node?.getType() || "");
}

// Function to determine the perf node kind based on the node
function getPerfNodeKind(
  node: UsfmElementNode | ElementNode,
  parent: UsfmElementNode | ElementNode | null,
) {
  if (node && checkIsSequence(node)) return "sequence"; // If the node is a sequence, return "sequence"
  if (parent && checkIsSequence(parent)) return "block"; // If the parent is a sequence, return "block"
  return "content"; // Otherwise, return "content"
}

// Function to get information about a node in the editor state
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
    const kind = getPerfNodeKind(node, parent); // Get the kind of the node
    const index = parent ? parent.getChildrenKeys?.().findIndex((key) => nodeKey === key) : 0; // Get the index of the node in its parent's children
    const children = node.getChildren?.(); // Get the children of the node
    return { node, index, kind, children, type, target };
  });
}

/**
 * Recursively gets the node path from the given node to its root.
 * @param node - The node to get the path for.
 * @param pathArray - The array representing the path to the node.
 * @returns The array representing the path to the node.
 */
function recursiveGetNodePath(
  node: UsfmElementNode,
  pathArray: Array<string | number> = [],
): Array<string | number> {
  const parent: UsfmElementNode | null = node.getParent();
  const kind = getPerfNodeKind(node, parent);
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

/**
 * Finds the closest non-orphan ancestor node and returns its key.
 * @param nodeKey - The key of the node to check.
 * @param editorState - The current editor state.
 * @returns The key of the closest non-orphan ancestor node, or null if no such ancestor exists.
 */
function findClosestNonOrphanAncestorKey(nodeKey: string, editorState: EditorState): string | null {
  const node = editorState._nodeMap.get(nodeKey);
  if (!node) return null;
  const parentKey = node.__parent;
  if (!parentKey) return nodeKey;
  const hadParent = !!$getNodeByKey(parentKey); // Did its current parent exist
  return hadParent ? nodeKey : findClosestNonOrphanAncestorKey(parentKey, editorState);
}

function groupCommonAncestorKeys(arrayOfKeys: Array<{ pathArray: Array<string | number> }>) {
  // Group the keys by the first key
  const groupedKeys: { [key: string]: Array<{ pathArray: Array<string | number> }> } =
    arrayOfKeys.reduce(
      (groups: { [key: string]: Array<{ pathArray: Array<string | number> }> }, keys) => {
        const firstKey = keys.pathArray[0];
        if (!groups[firstKey]) {
          groups[firstKey] = [];
        }
        groups[firstKey].push(keys);
        return groups;
      },
      {},
    );

  // Find the common ancestor keys for each group and the original arrays that share them
  const commonAncestorKeysByGroup: {
    [key: string]: {
      commonAncestorKeys: Array<string | number>;
      originalArrays: Array<{ pathArray: Array<string | number> }>;
    };
  } = {};
  for (const firstKey in groupedKeys) {
    const commonAncestorKeys = findCommonAncestorKeys(
      groupedKeys[firstKey].map((keys) => keys.pathArray),
    );
    const originalArrays = groupedKeys[firstKey].filter(
      (keys) =>
        keys.pathArray.slice(0, commonAncestorKeys.length).join(",") ===
        commonAncestorKeys.join(","),
    );
    commonAncestorKeysByGroup[firstKey] = { commonAncestorKeys, originalArrays };
  }

  return commonAncestorKeysByGroup;
}

// Function to find the common ancestor keys from an array of keys
function findCommonAncestorKeys(
  arrayOfKeys: Array<Array<string | number>>,
): Array<string | number> {
  let commonAncestorKeys = [...arrayOfKeys[0]]; // Initialize with the first array of keys
  for (let i = 1; i < arrayOfKeys.length; i++) {
    const currentArray = arrayOfKeys[i];
    let commonLength = 0;
    // Find the common length of keys between the current array and the common ancestor keys
    while (
      commonLength < commonAncestorKeys.length &&
      commonAncestorKeys[commonLength] === currentArray[commonLength]
    ) {
      commonLength++;
    }
    commonAncestorKeys = commonAncestorKeys.slice(0, commonLength); // Update the common ancestor keys
  }
  return commonAncestorKeys;
}

//TODO: NEEDS FIXING
function generateRanges(array: number[]): string[] {
  // Sort the array in ascending order
  array.sort((a, b) => a - b);

  const ranges: string[] = [];
  let start = array[0];
  let end = array[0];

  for (const num of array.slice(1)) {
    // If the current number is not consecutive to the previous one,
    // push the range to the result and start a new range
    if (num !== end + 1) {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = num;
    }
    end = num;
  }

  // Push the last range to the result
  ranges.push(start === end ? `${start}` : `${start}-${end}`);

  return ranges;
}

type KeyGroup = {
  commonAncestorKeys: Array<string | number>;
  originalArrays: Array<{ pathArray: Array<string | number> }>;
};

function getNumbersFromObject(obj: KeyGroup): Array<number> {
  const numbers: Set<number> = new Set();

  // Get the position from the length of commonAncestorKeys
  const position = obj.commonAncestorKeys.length;

  // Iterate over each object in originalArrays
  for (const originalArray of obj.originalArrays) {
    // Get the number at the position in pathArray and add it to the numbers set
    const number = originalArray.pathArray[position];
    if (typeof number === "number") {
      numbers.add(number);
    }
  }

  // Convert the set to an array
  const numbersArray: Array<number> = Array.from(numbers);

  return numbersArray;
}
