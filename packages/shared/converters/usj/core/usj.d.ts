export type UsjDocument = {
  /** the kind of node/element/marker this is */
  type: "USJ";
  /** the USJ spec version */
  version: string;
  /** the JSON representation of scripture contents from USFM/USX */
  content: Exclude<UsjNode, UsjDocument>[];
};

export type SingleCharString = string;

export type UsjStructuralNode = UsjBook | UsjChapter | UsjPara | UsjTable | UsjSidebar | UsjBreak;
export type UsjInlineNode = UsjChar | UsjVerse | UsjMilestone | UsjFigure | UsjNote | UsjRef;
export type UsjNode = UsjDocument | UsjStructuralNode | UsjInlineNode;

export const UsjTypes = {
  structural: {
    book: "book",
    chapter: "chapter",
    para: "para",
    table: "table",
    sidebar: "sidebar",
    figure: "figure",
    optbreak: "optbreak",
  },
  inline: {
    ref: "ref",
    char: "char",
    verse: "verse",
    ms: "ms",
    note: "note",
    whitespace: "whitespace",
    "table:row": "table:row",
    "table:cell": "table:cell",
  },
} as const satisfies {
  structural: Record<string, string>;
  inline: Record<string, string>;
};

// Type extraction
export type StructuralType = (typeof UsjTypes.structural)[keyof typeof UsjTypes.structural];
export type InlineType = (typeof UsjTypes.inline)[keyof typeof UsjTypes.inline];

export type BookCode = string;
export type ChapterNumber = string;
export type VerseNumber = string;
export type Sid = string;
export type MarkerString = string;

/**
 * A book node
 */
export type UsjBook = {
  type: "book";
  /** the marker for this node   */
  marker: "id";
  /** the 3-letter book code matching pattern ^[0-6A-Z]{3}$ */
  code: BookCode;
  content?: string[];
};

export type UsjChapter = {
  type: "chapter";
  marker: "c";
  number: ChapterNumber;
  sid?: Sid;
  altnumber?: string;
  pubnumber?: string;
};

export type UsjParaContent = string | UsjChar | UsjVerse | UsjMilestone | UsjFigure | UsjNote;

export type UsjCharType = Exclude<InlineType, "verse" | "ms" | "note" | "figure">;

export type NonWhitespaceString = string;

export type UsjChar = {
  type: UsjCharType;
  marker: MarkerString;
  content?: UsjParaContent[];
  "link-id"?: NonWhitespaceString;
  "link-href"?: NonWhitespaceString;
  [key: `x-${string}`]: string;
};

export type UsjVerse = {
  type: "verse";
  marker: MarkerString;
  number: VerseNumber;
  sid?: Sid;
  altnumber?: string;
  pubnumber?: string;
};

export type UsjMilestone = {
  type: "ms";
  marker: string;
  sid?: string;
  who?: string;
  eid?: string;
  [key: `x-${string}`]: string;
};

export type UsjFigure = {
  type: "figure";
  marker: MarkerString;
  content?: string[];
  file?: NonWhitespaceString;
  size?: string;
  ref?: NonWhitespaceString;
};

export type UsjNote = {
  type: "note";
  marker: MarkerString;
  content?: UsjParaContent[];
  caller: string;
};

export type UsjPara = {
  type: "para";
  marker: string;
  content?: UsjParaContent[];
  sid?: string;
};

export type UsjTable = {
  type: "table";
  marker?: string;
  content?: UsjRow[];
  sid?: string;
};

export type UsjRow = {
  type: "table:row";
  marker: string;
  content?: UsjCell[];
};

export type UsjCellAlign = "start" | "center" | "end";

export type UsjCell = {
  type: "table:cell";
  marker: MarkerString;
  content?: UsjParaContent[];
  align?: UsjCellAlign;
  colspan?: number;
};

export type UsjSidebar = {
  type: "sidebar";
  marker: "esb";
  content?: UsjPara[];
  category?: string;
};

export type UsjRef = {
  type: "ref";
  loc?: string;
  gen?: boolean;
};

export type UsjBreak = {
  type: "optbreak";
};
