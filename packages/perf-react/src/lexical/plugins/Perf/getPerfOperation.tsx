import { $getNodeByKey, EditorState } from "lexical";
import { SerializedUsfmElementNode, UsfmElementNode } from "shared/nodes/UsfmElementNode";
import { transformLexicalStateToPerf } from "shared/converters/lexicalToPerf";
import { PerfOperation, PerfAction, PerfKind, LexicalPerfNode } from "./PerfOperation";
import {
  findClosestNonOrphanAncestorKey,
  getNodeJson,
  getPerfKindbyPathLength,
  recursiveGetNodePath,
} from "./utils";

/**
 * Retrieves the PerfOperation object for a given node.
 * @param nodeKey - The key of the node.
 * @param prevEditorState - The previous editor state.
 * @param editorState - The current editor state.
 * @returns The PerfOperation object.
 */
export function getPerfOperation(
  nodeKey: string,
  prevEditorState: EditorState,
  editorState: EditorState,
): PerfOperation {
  const nodeState: { previous: UsfmElementNode | null; current: UsfmElementNode | null } = {
    previous: null,
    current: null,
  };
  return prevEditorState.read(() => {
    // Retrieve the previous node
    nodeState.previous = $getNodeByKey(nodeKey);
    if (!nodeState.previous) {
      // If the previous node doesn't exist, it's an add operation
      return buildAddOperation(editorState, nodeKey, nodeState);
    }
    const previousPath = recursiveGetNodePath(nodeState.previous);
    return editorState.read(() => {
      const commonOperationProps = buildCommonOperationProps(previousPath, nodeKey);
      // Retrieve the current node
      nodeState.current = $getNodeByKey(nodeKey);
      if (!nodeState.current) {
        // If the current node doesn't exist, it's a delete operation
        return buildDeleteOperation(commonOperationProps);
      }

      const lexicalNode: LexicalPerfNode = buildLexicalNode(
        getNodeJson(nodeState.current),
        commonOperationProps.kind,
      );
      const currentPath = recursiveGetNodePath(nodeState.current);
      if (currentPath.join() !== previousPath.join())
        // If the current path is different from the previous path, it's a move operation
        return buildMoveOperation({ lexicalNode, ...commonOperationProps }, currentPath);
      // Otherwise, it's a replace operation
      return buildReplaceOperation({ lexicalNode, ...commonOperationProps });
    });
  });
}

const buildLexicalNode = (node: SerializedUsfmElementNode, kind: PerfKind): LexicalPerfNode => ({
  node,
  toPerf() {
    console.log({ kind });
    return transformLexicalStateToPerf(this.node, kind);
  },
});

/**
 * Builds the common operation properties.
 * @param path - The path of the node.
 * @param nodeKey - The key of the node.
 * @returns The common operation properties.
 */
function buildCommonOperationProps(path: (string | number)[], nodeKey: string) {
  return {
    path,
    kind: getPerfKindbyPathLength(path.length),
    nodeKey,
  };
}

/**
 * Builds the replace operation.
 * @param commonOperationProps - The common operation properties.
 * @returns The replace operation.
 */
function buildReplaceOperation(commonOperationProps: {
  path: (string | number)[];
  kind: PerfKind;
  nodeKey: string;
  lexicalNode: LexicalPerfNode;
}): PerfOperation {
  return {
    action: PerfAction.Replace,
    ...commonOperationProps,
  };
}

/**
 * Builds the move operation.
 * @param commonOperationProps - The common operation properties.
 * @param currentPath - The current path of the node.
 * @returns The move operation.
 */
function buildMoveOperation(
  commonOperationProps: {
    path: (string | number)[];
    kind: PerfKind;
    nodeKey: string;
    lexicalNode: LexicalPerfNode;
  },
  currentPath: (string | number)[],
): PerfOperation {
  return {
    action: PerfAction.Move,
    ...commonOperationProps,
    path: currentPath,
    from: commonOperationProps.path,
    kind: getPerfKindbyPathLength(currentPath.length),
  };
}

/**
 * Builds the delete operation.
 * @param commonOperationProps - The common operation properties.
 * @returns The delete operation.
 */
function buildDeleteOperation(commonOperationProps: {
  path: (string | number)[];
  kind: PerfKind;
  nodeKey: string;
}): PerfOperation {
  return {
    action: PerfAction.Delete,
    ...commonOperationProps,
  };
}

/**
 * Builds the add operation.
 * @param editorState - The editor state.
 * @param nodeKey - The key of the node.
 * @param nodeState - The node state.
 * @returns The add operation.
 */
function buildAddOperation(
  editorState: EditorState,
  nodeKey: string,
  nodeState: { current: UsfmElementNode | null },
): PerfOperation {
  return {
    action: PerfAction.Add,
    nodeKey: findClosestNonOrphanAncestorKey(nodeKey, editorState) as string,
    ...editorState.read(() => {
      nodeState.current = $getNodeByKey(nodeKey) as UsfmElementNode;
      const path = recursiveGetNodePath(nodeState.current);
      const lexicalNode = buildLexicalNode(
        getNodeJson(nodeState.current),
        getPerfKindbyPathLength(path.length),
      );
      const kind = getPerfKindbyPathLength(path.length);
      return {
        path,
        kind,
        lexicalNode,
        states: { current: nodeState.current },
      };
    }),
  };
}

export const handleDirtyLeaves = (
  dirtyLeaves: Set<string>,
  editorState: EditorState,
  prevEditorState: EditorState,
) => {
  if (dirtyLeaves.size > 0) {
    const perfActions = getPerfOperationsFromChangedLexicalEditorNode(
      dirtyLeaves,
      editorState,
      prevEditorState,
    );
    const newPerfActions = convertPerfActions(perfActions);
    console.log("LEAVES", { perfActions, newPerfActions, dirtyLeaves });
  }
};

/**
 * Represents a collection of Perf actions.
 *
 * @remarks
 * The `PerfActions` interface is used to store perf actions associated with a sequence ID.
 * Each sequence ID is mapped to an array of `PerfAction` objects.
 */
interface PerfActions {
  [sequenceId: string]: PerfOperation[];
}

/**
 * Retrieves Proskomma Editor Ready Format (PERF) operations from changed nodes in the Lexical Editor.
 *
 * @param dirtyNodes - The set or map of nodes that have been modified.
 * @param editorState - The current state of the editor.
 * @param prevEditorState - The previous state of the editor.
 * @returns A collection of PERF operations grouped by sequence ID.
 *
 * @remarks
 * This function is used in the context of a Lexical Editor, where nodes represent PERF documents.
 * It retrieves operations from nodes that have been modified ("dirty" nodes), and returns a collection
 * of these operations, organized by sequence ID. Each sequence ID is mapped to an array of `PerfOperation` objects.
 */
function getPerfOperationsFromChangedLexicalEditorNode(
  dirtyNodes: Set<string> | Map<string, boolean>,
  editorState: EditorState,
  prevEditorState: EditorState,
  options: { filterBy?: PerfKind } = { filterBy: PerfKind.ContentElement },
) {
  const perfActions: PerfActions = {};
  for (const dirtyNode of dirtyNodes) {
    const nodeKey = typeof dirtyNode === "string" ? dirtyNode : dirtyNode[0];
    // Get perf action for each dirty leaf nod
    const perfAction = getPerfOperation(nodeKey, prevEditorState, editorState);
    if (perfAction.kind !== options.filterBy) continue; //TODO: infer kind and evaluate before getPerfOperation to improve performance
    if (!Object.hasOwn(perfActions, perfAction.path[0])) {
      perfActions[perfAction.path[0]] = [];
    }
    perfActions[perfAction.path[0]].push(perfAction);
  }
  return perfActions;
}

const convertPerfActions = (perfActions: PerfActions) =>
  Object.keys(perfActions).reduce(
    (acc, sequenceId) => {
      acc[sequenceId] = perfActions[sequenceId].map((operation: PerfOperation) => {
        if (operation.lexicalNode) {
          return { ...operation, perfNode: operation.lexicalNode.toPerf() };
        }
        return operation;
      });
      return acc;
    },
    {} as { [key: string]: PerfOperation[] },
  );
