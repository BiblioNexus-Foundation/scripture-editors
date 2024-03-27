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
