import { LexicalNode } from "lexical";

import { exportNodeToJSON, getPerfKindFromNode } from "./utils";

import { Mapper } from "../History/operations/defaults";
import { $isUsfmElementNode, UsfmElementNode } from "../../nodes/UsfmElementNode";
import {
  OperationAdd,
  OperationRemove,
  OperationReplace,
  OperationType,
  Path,
} from "../History/operations/index.d";
import { transformLexicalStateToPerf } from "../../converters/lexicalToPerf";
import { PerfKind, PerfKindMap } from "./types";

export const operationBuilder: Mapper = ({
  node,
  operationType,
  path,
}: {
  node: UsfmElementNode | LexicalNode;
  path: Path;
  from?: Path;
  operationType: OperationType;
}) => {
  if (operationType === OperationType.Move) {
    console.log("SKIPPED MOVE OPERATION");
    return undefined;
  }
  if (!$isUsfmElementNode(node)) return undefined;
  const { "perf-type": perfType } = node.getAttributes?.() ?? {};
  const kind = getPerfKindFromNode(node);

  if (perfType === "graft" || kind === PerfKind.Block) {
    switch (operationType) {
      case OperationType.Add:
        return buildAddOperation(node, path);
      case OperationType.Remove:
        return buildRemoveOperation(path);
      case OperationType.Replace:
        return buildReplaceOperation(node, path);
    }
  }
  return undefined;
};

const buildAddOperation = (node: UsfmElementNode, path: Path): OperationAdd => {
  const kind = getPerfKindFromNode(node);
  return {
    path,
    value: transformLexicalStateToPerf(exportNodeToJSON(node), kind).targetNode,
    type: OperationType.Add,
  };
};

const buildRemoveOperation = (path: Path): OperationRemove => {
  return {
    path,
    type: OperationType.Remove,
  };
};

const buildReplaceOperation = (node: UsfmElementNode, path: Path): OperationReplace => {
  const kind = getPerfKindFromNode(node);
  return {
    path,
    value: transformLexicalStateToPerf(exportNodeToJSON(node), kind)
      .targetNode as PerfKindMap[typeof kind],
    type: OperationType.Replace,
  };
};
