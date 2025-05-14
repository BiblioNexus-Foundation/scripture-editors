import { ImmutableUnmatchedNode } from "../features/ImmutableUnmatchedNode";
import { MarkerNode } from "../features/MarkerNode";
import { UnknownNode } from "../features/UnknownNode";
import { BookNode } from "./BookNode";
import { ChapterNode } from "./ChapterNode";
import { CharNode } from "./CharNode";
import { ImmutableChapterNode } from "./ImmutableChapterNode";
import { ImpliedParaNode } from "./ImpliedParaNode";
import { MilestoneNode } from "./MilestoneNode";
import { NoteNode } from "./NoteNode";
import { ParaNode } from "./ParaNode";
import { VerseNode } from "./VerseNode";
import { Klass, LexicalNode, LexicalNodeReplacement, ParagraphNode } from "lexical";

export const usjBaseNodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> = [
  BookNode,
  ImmutableChapterNode,
  ChapterNode,
  VerseNode,
  CharNode,
  NoteNode,
  MilestoneNode,
  MarkerNode,
  UnknownNode,
  ImmutableUnmatchedNode,
  ImpliedParaNode,
  ParaNode,
  {
    replace: ParagraphNode,
    withKlass: ParaNode,
    with: (node: ParaNode) => new ParaNode(node.__marker, node.__unknownAttributes),
  },
];
