import { Perf } from "shared/converters/lexicalToPerf";

// Const enum for PerfAction action property
export const enum PerfKind {
  Sequence = "sequence",
  Block = "block",
  ContentElement = "contentElement",
}

export type LexicalPerfNode = Perf;
