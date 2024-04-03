import {
  BlockStructure,
  PerfBlockConstraint,
  SequenceStructure,
  PerfSequenceConstraint,
  ContentElementStructure,
  PerfContentElementConstraint,
} from "./perfTypes";

// Const enum for PerfAction action property
export const enum PerfKind {
  Sequence = "sequence",
  Block = "block",
  ContentElement = "contentElement",
}

export type PerfSequence = SequenceStructure & PerfSequenceConstraint;
export type PerfBlock = BlockStructure & PerfBlockConstraint;
export type PerfContentElement = ContentElementStructure & PerfContentElementConstraint;

export type PerfKindMap = {
  sequence: PerfSequence;
  block: PerfBlock;
  contentElement: PerfContentElement;
};
