import { ParagraphNode } from "lexical";
import { BookNode } from "./BookNode";
import { ChapterNode } from "./ChapterNode";
import { ImmutableChapterNumberNode } from "./ImmutableChapterNumberNode";
import { ImmutableVerseNode } from "./ImmutableVerseNode";
import { VerseNode } from "./VerseNode";
import { CharNode } from "./CharNode";
import { NoteNode } from "./NoteNode";
import { MilestoneNode } from "./MilestoneNode";
import { MarkerNode } from "./MarkerNode";
import { ImpliedParaNode } from "./ImpliedParaNode";
import { ParaNode } from "./ParaNode";
import { UnknownNode } from "./UnknownNode";

const scriptureUsjNodes = [
  BookNode,
  ChapterNode,
  ImmutableChapterNumberNode,
  ImmutableVerseNode,
  VerseNode,
  CharNode,
  NoteNode,
  MilestoneNode,
  MarkerNode,
  UnknownNode,
  ImpliedParaNode,
  ParaNode,
  {
    replace: ParagraphNode,
    with: () => {
      return new ParaNode();
    },
  },
];
export default scriptureUsjNodes;
