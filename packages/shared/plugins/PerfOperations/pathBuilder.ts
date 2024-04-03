import { LexicalNode } from "lexical";
import { getPerfKindFromNode } from "./utils";
import { PerfKind } from "./types";
import { UsfmElementNode } from "../../nodes/UsfmElementNode";

export const getPathBuilder = (MainSequenceId: string) => (node: UsfmElementNode | LexicalNode) => {
  const pathArray: Array<string | number> = [];
  let currentNode: typeof node | null = node;
  const nodeKind = getPerfKindFromNode(currentNode);
  if (nodeKind === PerfKind.Sequence) return false;

  while (currentNode) {
    const parent: UsfmElementNode | null = currentNode.getParent();
    const nodeKey = currentNode.getKey();
    const kind = getPerfKindFromNode(currentNode);

    if (kind === PerfKind.Sequence && currentNode instanceof UsfmElementNode) {
      const target = currentNode.getAttributes?.()?.["perf-target"];
      pathArray.unshift(target ?? MainSequenceId); // Add the target to the path array
      currentNode = null; // Stop the loop
    } else {
      const index = parent
        ? parent.getChildrenKeys?.().findIndex((key) => nodeKey === key)
        : MainSequenceId;

      pathArray.unshift(index); // Add the index to the path array

      if (kind === PerfKind.ContentElement) {
        pathArray.unshift("content"); // Add "content" to the path array
      }

      if (kind === PerfKind.Block) {
        pathArray.unshift("blocks"); // Add "blocks" to the path array
      }
      currentNode = parent; // Move up to the parent node
    }
  }

  return pathArray;
};
