import { $getNodeByKey, EditorState } from "lexical";
import { UsfmElementNode } from "shared/nodes/UsfmElementNode";
import { PerfOperation, PerfAction } from "./PerfOperation";
import {
  findClosestNonOrphanAncestorKey,
  getNodeAction,
  getNodeJson,
  getPerfKindbyPathLength,
  recursiveGetNodePath,
} from "./utils";

// Function to get the PerfAction object for a given node
export function getPerfOperation(
  nodeKey: string,
  prevEditorState: EditorState,
  editorState: EditorState,
): PerfOperation {
  const previousNode = editorState._nodeMap.get(nodeKey);
  const currentNode = prevEditorState._nodeMap.get(nodeKey);
  const action = getNodeAction(previousNode, currentNode);

  // Read the previous editor state to start filling the PerfAction object
  const perfOperation: PerfOperation = prevEditorState.read(() => {
    const node: UsfmElementNode | null = $getNodeByKey(nodeKey);
    if (!node) {
      return {
        action,
        nodeKey: findClosestNonOrphanAncestorKey(nodeKey, editorState) as string,
      };
    }
    const path = recursiveGetNodePath(node);
    return {
      path,
      kind: getPerfKindbyPathLength(path.length),
      action,
      nodeKey,
    };
  }) as PerfOperation;

  // Read the current editor state to get additional information for the PerfAction object
  editorState.read(() => {
    const node: UsfmElementNode | null = $getNodeByKey(perfOperation.nodeKey);
    if (!node) return null;
    const lexicalSerializedState = getNodeJson(node);
    if (perfOperation.action === PerfAction.Add) {
      const pathArray = recursiveGetNodePath(node);
      perfOperation.kind = getPerfKindbyPathLength(pathArray.length);
      perfOperation.path = pathArray;
    }
    if (perfOperation.action === PerfAction.Move) {
      const pathArray = recursiveGetNodePath(node);
      perfOperation.to = pathArray;
    }
    if (perfOperation.action !== PerfAction.Delete)
      perfOperation.lexicalState = lexicalSerializedState;
  });

  return perfOperation;
}
