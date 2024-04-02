import { UsfmElementNode } from "shared/nodes/UsfmElementNode";
import { Mapper } from "shared/plugins/History/operations/defaults";
import { LexicalNode } from "lexical";
import { Path } from "shared/plugins/History/operations/index.d";
import { getPerfKindFromNode } from "./utils";
import { Perf, transformLexicalStateToPerf } from "shared/converters/lexicalToPerf";
import {
  OperationAdd,
  OperationRemove,
  OperationReplace,
  OperationType,
} from "open-patcher/dist/types";

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
  if (!isUsfmElementNode(node)) return undefined;
  const { "perf-type": perfType } = node.getAttributes?.() ?? {};
  const kind = getPerfKindFromNode(node);

  if (perfType === "graft" || kind === "block") {
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

function isUsfmElementNode(node: LexicalNode): node is UsfmElementNode {
  return node instanceof UsfmElementNode;
}

const buildAddOperation = (node: UsfmElementNode, path: Path): OperationAdd => {
  const kind = getPerfKindFromNode(node);
  return {
    path,
    value: transformLexicalStateToPerf(node.exportJSON(), kind).targetNode as Perf,
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
    value: transformLexicalStateToPerf(node.exportJSON(), kind).targetNode as Perf,
    type: OperationType.Replace,
  };
};
