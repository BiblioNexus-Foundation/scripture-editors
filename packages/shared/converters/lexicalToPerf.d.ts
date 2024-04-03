import { SerializedUsfmElementNode } from "../nodes/UsfmElementNode";
import { PerfBlock, PerfContentElement, PerfSequence } from "../plugins/PerfOperations/types";

export function transformLexicalStateToPerf(
  lexicalStateNode: SerializedUsfmElementNode,
  kind: string,
): { targetNode: PerfSequence | PerfBlock | PerfContentElement; sequences: PerfSequence[] };

export function getDatafromAttributes(attributes: { [key: string]: unknown }): unknown;
