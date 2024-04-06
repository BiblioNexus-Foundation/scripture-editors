import { PerfDocument } from "../plugins/PerfOperations/perfTypes";
import { SerializedElementNode, SerializedLexicalNode } from "lexical";

export function transformPerfDocumentToLexicalState(
  perfDocument: PerfDocument,
  sequenceId: string,
  perfMapper: () => void,
): SerializedEditorState<SerializedLexicalNode>;

export function transformPerfNodeToLexicalNode<
  T extends SerializedLexicalNode | SerializedElementNode,
>({
  node,
  kind,
  perfSequences,
}: {
  node: PerfContentElement | PerfBlock | PerfSequence;
  kind: string;
  perfSequences: PerfDocument.Sequences;
}): T;
