export type UsjDocument = {
  /** the kind of node/element/marker this is */
  type: "USJ";
  /** the USJ spec version */
  version: string;
  /** the JSON representation of scripture contents from USFM/USX */
  content: Exclude<UsjNode, UsjDocument>[];
};

export type UsjStructuralNode = UsjBook | UsjChapter | UsjPara | UsjTable | UsjSidebar;
export type UsjInlineNode = UsjChar | UsjVerse | UsjMilestone | UsjFigure | UsjNote;
export type UsjNode = UsjDocument | UsjStructuralNode | UsjInlineNode;

//unsupported:
//
export const UsjTypes = {
  document: "USJ",
  structural: {
    book: "book",
    chapter: "chapter",
    para: "para",
    table: "table",
    sidebar: "sidebar",
  },
  inline: {
    char: "char",
    verse: "verse",
    ms: "ms",
    figure: "figure",
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
  caller?: SingleCharString;
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

export function assertBookCode(code: string): void {
  if (!/^[0-6A-Z]{3}$/.test(code)) {
    throw new Error(`Invalid book code: ${code}`);
  }
}

export function assertChapterNumber(num: string): void {
  if (!/^[1-9][0-9]{0,2}(-[1-9][0-9]{0,2})?$/.test(num)) {
    throw new Error(`Invalid chapter number: ${num}`);
  }
}

export function assertVerseNumber(num: string): void {
  if (!/^[1-9][0-9]{0,2}(-[1-9][0-9]{0,2})?$/.test(num)) {
    throw new Error(`Invalid verse number: ${num}`);
  }
}

export function assertSid(sid: string): void {
  if (!/^[0-6A-Z]{3}( [1-9][0-9]{0,2}(:[1-9][0-9]{0,2}(-[1-9][0-9]{0,2})?)?)?$/.test(sid)) {
    throw new Error(`Invalid sid: ${sid}`);
  }
}

export function assertMarker(marker: string): void {
  if (!/^[^ \t\r\n]+$/.test(marker)) {
    throw new Error(`Invalid marker: ${marker}`);
  }
}

export function createBookCode(code: string): string {
  assertBookCode(code);
  return code;
}

export function createChapterNumber(num: string): string {
  assertChapterNumber(num);
  return num;
}

export function createVerseNumber(num: string): string {
  assertVerseNumber(num);
  return num;
}

export function createSid(sid: string): string {
  assertSid(sid);
  return sid;
}

export function createMarker(marker: string): string {
  assertMarker(marker);
  return marker;
}

export function assertNonWhitespaceString(str: string): asserts str is NonWhitespaceString {
  if (!/^[^ \t\r\n](.*[^ \t\r\n])?$/.test(str)) {
    throw new Error(`Invalid string (must not start/end with whitespace): ${str}`);
  }
}

export function assertSingleCharString(str: string): asserts str is SingleCharString {
  if (!/^[^ \t\n]$/.test(str)) {
    throw new Error(`Invalid string (must be single non-whitespace character): ${str}`);
  }
}

export function createNonWhitespaceString(str: string): NonWhitespaceString {
  assertNonWhitespaceString(str);
  return str as NonWhitespaceString;
}

export function createSingleCharString(str: string): SingleCharString {
  assertSingleCharString(str);
  return str as SingleCharString;
}

export function validateColspan(span: number): void {
  if (span < 1) {
    throw new Error(`Invalid colspan: ${span} (must be >= 1)`);
  }
}

export function validateUsjNodeType(type: string): asserts type is UsjNodeType {
  const validTypes = new Set<UsjNodeType>([
    "book",
    "chapter",
    "para",
    "table",
    "sidebar",
    "verse",
    "char",
    "whitespace",
    "table:row",
    "table:cell",
    "ms",
    "figure",
    "note",
  ]);

  if (!validTypes.has(type as UsjNodeType)) {
    throw new Error(
      `Invalid USJ node type: ${type}. Valid types are: ${Array.from(validTypes).join(", ")}`,
    );
  }
}
