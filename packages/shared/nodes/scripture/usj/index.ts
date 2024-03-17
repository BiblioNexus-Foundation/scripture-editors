import { ParagraphNode } from "lexical";
import { BookNode } from "./BookNode";
import { ImmutableChapterNode } from "./ImmutableChapterNode";
import { ImmutableVerseNode } from "./ImmutableVerseNode";
import { ChapterNode } from "./ChapterNode";
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
  ImmutableChapterNode,
  ImmutableVerseNode,
  ChapterNode,
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
