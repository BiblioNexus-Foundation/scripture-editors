import {
  BlockStructure,
  PerfBlockConstraint,
  SequenceStructure,
  PerfSequenceConstraint,
  ContentElementStructure,
  PerfContentElementConstraint,
  PerfDocument,
} from "./perfTypes";

// Const enum for PerfAction action property
export const enum PerfKind {
  Sequence = "sequence",
  Block = "block",
  ContentElement = "contentElement",
  ContentText = "contentText",
}

export type PerfSequence = SequenceStructure & PerfSequenceConstraint;
export type PerfBlock = BlockStructure & PerfBlockConstraint;
export type PerfContentElement = ContentElementStructure & PerfContentElementConstraint;
export type PerfSequences = PerfDocument["sequences"];

export type PerfKindMap = {
  sequence: PerfSequence;
  block: PerfBlock;
  contentElement: PerfContentElement;
};
