import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, EditorState, LexicalNode } from "lexical";
import { UsfmElementNode } from "shared/nodes/UsfmElementNode";
import { UpdateListener } from "lexical/LexicalEditor";
import { getPerfOperation } from "./Perf/getPerfOperation";
import { PerfOperation } from "./Perf/PerfOperation";
import { getPerfKindFromNode } from "./Perf/utils";

export const OnChangePlugin = ({ onChange }: { onChange: UpdateListener }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(
      ({ editorState, dirtyElements, dirtyLeaves, prevEditorState, normalizedNodes, tags }) => {
        console.log({
          editorState,
          dirtyElements,
          dirtyLeaves,
          prevEditorState,
          normalizedNodes,
          tags,
        });
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

          console.log({ perfActions, dirtyLeaves });
          // Group the common ancestor keys of perf actions
          // const commonAncestors = groupCommonAncestorKeys(perfActions);
          // // Generate ranges for each common ancestor
          // console.log({commonAncestors})
          // const ranges = Object.values(commonAncestors).map(
          //   ({ commonAncestorKeys, originalArrays }) => {
          //     const commonAncestorPath = commonAncestorKeys.join("/");
          //     // Get the numbers from the common ancestor object
          //     const numbers = getNumbersFromObject({ commonAncestorKeys, originalArrays });
          //     // Generate ranges from the numbers
          //     console.log({numbers})
          //     const ranges = generateRanges(numbers);
          //     return { path: commonAncestorPath, numbers, ranges };
          //   },
          // );
          // console.log("LEAVES", { dirtyLeaves, perfActions, commonAncestors, ranges });
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
  /**
   * Represents a collection of performance actions.
   *
   * @remarks
   * The `PerfActions` interface is used to store perf actions associated with a sequence ID.
   * Each sequence ID is mapped to an array of `PerfAction` objects.
   */
  interface PerfActions {
    [sequenceId: string]: PerfOperation[];
  }
  const perfActions: PerfActions = {};
  const oldNodes: (LexicalNode | null)[] = [];
  const newNodes: (LexicalNode | null)[] = [];
  for (const nodeKey of dirtyLeaves) {
    // Get perf action for each dirty leaf node
    prevEditorState.read(() => {
      oldNodes.push($getNodeByKey(nodeKey));
    });
    editorState.read(() => {
      newNodes.push($getNodeByKey(nodeKey));
    });
    const perfAction = getPerfOperation(nodeKey, prevEditorState, editorState);
    if (!Object.hasOwn(perfActions, perfAction.path[0])) {
      perfActions[perfAction.path[0]] = [];
    }
    perfActions[perfAction.path[0]].push(perfAction);
  }
  console.log({ oldNodes, newNodes });
  return perfActions;
}

// // Function to find the common ancestor keys from an array of keys
// function findCommonAncestorKeys(
//   arrayOfKeys: Array<Array<string | number>>,
// ): Array<string | number> {
//   let commonAncestorKeys = [...arrayOfKeys[0]]; // Initialize with the first array of keys
//   for (let i = 1; i < arrayOfKeys.length; i++) {
//     const currentArray = arrayOfKeys[i];
//     let commonLength = 0;
//     // Find the common length of keys between the current array and the common ancestor keys
//     while (
//       commonLength < commonAncestorKeys.length &&
//       commonAncestorKeys[commonLength] === currentArray[commonLength]
//     ) {
//       commonLength++;
//     }
//     commonAncestorKeys = commonAncestorKeys.slice(0, commonLength); // Update the common ancestor keys
//   }
//   return commonAncestorKeys;
// }

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
    const kind = getPerfKindFromNode(node, parent); // Get the kind of the node
    const index = parent ? parent.getChildrenKeys?.().findIndex((key) => nodeKey === key) : 0; // Get the index of the node in its parent's children
    const children = node.getChildren?.(); // Get the children of the node
    return { node, index, kind, children, type, target };
  });
}

export function groupCommonAncestorKeys(arrayOfKeys: Array<{ pathArray: Array<string | number> }>) {
  // Group the keys by the first key
  const groupedKeys: {
    [key: string]: Array<{ pathArray: Array<string | number> }>;
  } = arrayOfKeys.reduce(
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
    commonAncestorKeysByGroup[firstKey] = {
      commonAncestorKeys,
      originalArrays,
    };
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

/**
 * Generates ranges from an array of numbers.
 *
 * @param array - The array of numbers.
 * @returns An array of strings representing the ranges.
 *
 * @remarks
 * This function takes an array of numbers and generates ranges from it. A range is defined as a sequence of consecutive numbers.
 * For example, given the input array [1, 2, 3, 6, 7, 8, 10], the function will return ["1-3", "6-8", "10"].
 */
export function generateRanges(array: number[]): string[] {
  //TODO: NEEDS FIXING
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

export function getNumbersFromObject(obj: KeyGroup): Array<number> {
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
