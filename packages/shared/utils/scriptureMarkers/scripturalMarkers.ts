/** Generated file using `nx generate markers-data` with 'https://raw.githubusercontent.com/ubsicap/usfm/refs/heads/master/sty/usfm.sty' */
export const MarkerTypes = {
  book: "book",
  para: "para",
  char: "char",
  note: "note",
  table: "table",
  row: "table:row",
  cell: "table:cell",
  figure: "figure",
  chapter: "chapter",
  verse: "verse",
  ms: "ms",
  sidebar: "sidebar",
  ref: "ref",
  optbreak: "optbreak",
  whitespace: "whitespace",
} as const;

type MarkerType = (typeof MarkerTypes)[keyof typeof MarkerTypes];

const milestoneMarkers = [
  "ts-s",
  "ts-e",
  "ts",
  "t-s",
  "t-e",
  "qt1-s",
  "qt1-e",
  "qt2-s",
  "qt2-e",
  "qt3-s",
  "qt3-e",
  "qt4-s",
  "qt4-e",
  "qt5-s",
  "qt5-e",
  "qt-s",
  "qt-e",
  "zaln-s",
  "zaln-e",
];

const charMarkers = [
  "vp",
  "qac",
  "qs",
  "add",
  "addpn",
  "bk",
  "dc",
  "efm",
  "fm",
  "fv",
  "k",
  "nd",
  "ndx",
  "ord",
  "png",
  "pn",
  "pro",
  "qt",
  "rq",
  "sig",
  "sls",
  "tl",
  "wg",
  "wh",
  "wa",
  "wj",
  "jmp",
  "no",
  "it",
  "bdit",
  "bd",
  "em",
  "sc",
  "sup",
  "xt",
  "w",
  "rb",
];

const charContent = [
  "char",
  "figure",
  "milestone",
  "footnote",
  "crossReference",
  "reference",
  "break",
];

export const scripturalElements: {
  [elementName: string]: {
    type: MarkerType;
    markers: string[];
    attributes:
      | {
          name: string;
          type: string;
          description?: string;
          pattern?: string;
          required?: boolean;
        }[]
      | null;
    contentElements?: string[] | null;
    contentText?: boolean;
    allowExtraAttributes?: boolean;
    extraAttributesTypes?: string[];
  };
} = {
  bookIdentification: {
    type: MarkerTypes.book,
    markers: ["id"],
    attributes: [
      {
        name: "code",
        type: "string",
        description: "The 3-letter book code in id element",
        pattern: "^[0-6A-Z]{3}$",
      },
    ],
    contentElements: null,
    contentText: true,
  },
  bookUsfmVersion: {
    type: MarkerTypes.para,
    markers: ["usfm"],
    attributes: null,
    contentElements: null,
    contentText: true,
  },
  bookHeaders: {
    type: MarkerTypes.para,
    markers: [
      "ide",
      "h",
      "h1",
      "h2",
      "h3",
      "toc",
      "toc1",
      "toc2",
      "toc3",
      "toca1",
      "toca2",
      "toca3",
      "sts",
    ],
    attributes: null,
    contentElements: null,
    contentText: true,
  },
  bookTitles: {
    type: MarkerTypes.para,
    markers: ["mt1", "mt2", "mt3", "mt4", "mt"],
    attributes: null,
    contentElements: ["footnote", "crossReference", "char", "break"],
    contentText: true,
  },
  bookIntroduction: {
    type: MarkerTypes.para,
    markers: [
      "imt1",
      "imt2",
      "imt3",
      "imt4",
      "imte1",
      "imte2",
      "imte",
      "imt",
      "ib",
      "ie",
      "imi",
      "imq",
      "im",
      "io1",
      "io2",
      "io3",
      "io4",
      "iot",
      "io",
      "ipc",
      "ipi",
      "ipq",
      "ipr",
      "ip",
      "iq1",
      "iq2",
      "iq3",
      "iq",
      "is1",
      "is2",
      "is",
      "iex",
    ],
    attributes: null,
    contentElements: [
      "char",
      "introChar",
      "footnote",
      "crossReference",
      "figure",
      "milestone",
      "reference",
      "sidebar",
    ],
    contentText: true,
  },
  introList: {
    type: MarkerTypes.para,
    markers: ["ili1", "ili2", "ili"],
    attributes: null,
    contentElements: [
      "char",
      "introChar",
      "listChar",
      "footnote",
      "crossReference",
      "figure",
      "milestone",
      "reference",
      "sidebar",
    ],
    contentText: true,
  },
  section: {
    type: MarkerTypes.para,
    markers: [
      "restore",
      "ms1",
      "ms2",
      "ms3",
      "ms",
      "mr",
      "mte1",
      "mte2",
      "mte",
      "r",
      "s1",
      "s2",
      "s3",
      "s4",
      "sr",
      "sp",
      "sd1",
      "sd2",
      "sd3",
      "sd4",
      "sd",
      "s",
      "cd",
    ],
    attributes: [
      {
        name: "vid",
        type: "string",
        description: "The style of the section",
        pattern: "[A-Z1-4]{3} ?[a-z0-9:-]*(&#x200F;?[-,][0-9]+)*",
        required: false,
      },
    ],
    contentElements: [
      "char",
      "footnote",
      "crossReference",
      "figure",
      "milestone",
      "break",
      "reference",
    ],
    contentText: true,
  },
  otherPara: {
    type: MarkerTypes.para,
    markers: ["lit", "cp", "pb", "qa", "k1", "k2"],
    attributes: [
      {
        name: "vid",
        type: "string",
        description: "The verse identifier",
        pattern: "[A-Z1-4]{3} ?[a-z0-9:-]*(&#x200F;?[-,][0-9]+)*",
        required: false,
      },
    ],
    contentElements: ["figure", "milestone", "reference", "footnote", "crossReference", "break"],
    contentText: true,
  },
  versePara: {
    type: MarkerTypes.para,
    markers: [
      "cls",
      "nb",
      "pc",
      "pi1",
      "pi2",
      "pi3",
      "pi",
      "po",
      "pr",
      "pmo",
      "pmc",
      "pmr",
      "pm",
      "ph1",
      "ph2",
      "ph3",
      "ph",
      "p",
      "q1",
      "q2",
      "q3",
      "q4",
      "qc",
      "qr",
      "qm1",
      "qm2",
      "qm3",
      "qm",
      "qd",
      "q",
      "b",
      "d",
      "mi1",
      "mi2",
      "mi3",
      "mi4",
      "mi",
      "m",
    ],
    attributes: [
      {
        name: "vid",
        type: "string",
        description: "The verse identifier",
        pattern: "[A-Z1-4]{3} ?[a-z0-9:-]*(&#x200F;?[-,][0-9]+)*",
        required: false,
      },
    ],
    contentElements: [
      "char",
      "figure",
      "milestone",
      "verse",
      "reference",
      "footnote",
      "crossReference",
      "break",
    ],
    contentText: true,
  },
  list: {
    type: MarkerTypes.para,
    markers: ["lh", "li1", "li2", "li3", "li4", "lim1", "lim2", "lim3", "lim4", "lim", "li", "lf"],
    attributes: [
      {
        name: "vid",
        type: "string",
        description: "The verse identifier",
        pattern: "[A-Z1-4]{3} ?[a-z0-9:-]*(&#x200F;?[-,][0-9]+)*",
        required: false,
      },
    ],
    contentElements: [
      "listChar",
      "char",
      "figure",
      "milestone",
      "verse",
      "reference",
      "footnote",
      "crossReference",
      "break",
    ],
    contentText: true,
  },
  table: {
    type: MarkerTypes.table,
    markers: [],
    attributes: [
      {
        name: "vid",
        type: "string",
        description: "The verse identifier",
        pattern: "[A-Z1-4]{3} ?[a-z0-9:-]*(&#x200F;?[-,][0-9]+)*",
        required: false,
      },
    ],
    contentElements: ["tableRow"],
    contentText: false,
  },
  tableRow: {
    type: MarkerTypes.row,
    markers: ["tr"],
    attributes: null,
    contentElements: ["verse", "tableContent"],
    contentText: false,
  },
  tableContent: {
    type: MarkerTypes.cell,
    markers: [
      "th1",
      "th2",
      "th3",
      "th4",
      "th5",
      "th6",
      "th7",
      "th8",
      "th9",
      "th10",
      "th11",
      "th12",
      "tc1",
      "tc2",
      "tc3",
      "tc4",
      "tc5",
      "tc6",
      "tc7",
      "tc8",
      "tc9",
      "tc10",
      "tc11",
      "tc12",
      "tcr1",
      "tcr2",
      "tcr3",
      "tcr4",
      "tcr5",
      "tcr6",
      "tcr7",
      "tcr8",
      "tcr9",
      "tc10",
      "tc11",
      "tc12",
      "tcc1",
      "tcc2",
      "tcc3",
      "tcc4",
      "tcc5",
      "tcc6",
      "tcc7",
      "tcc8",
      "tcc9",
      "tcc10",
      "tcc11",
      "tcc12",
      "thc1",
      "thc2",
      "thc3",
      "thc4",
      "thc5",
      "thc6",
      "thc7",
      "thc8",
      "thc9",
      "thc10",
      "thc11",
      "tch12",
      "thr1",
      "thr2",
      "thr3",
      "thr4",
      "thr5",
      "thr6",
      "thr7",
      "thr8",
      "thr9",
      "thr10",
      "thr11",
      "thr12",
    ],
    attributes: [
      {
        name: "align",
        type: "string",
        description: "The alignment of the cell",
        pattern: "start|center|end",
        required: true,
      },
      {
        name: "colspan",
        type: "number",
        description: "The number of columns the cell should span",
        required: false,
      },
    ],
    contentElements: [
      "char",
      "figure",
      "milestone",
      "verse",
      "footnote",
      "crossReference",
      "break",
    ],
    contentText: true,
  },
  IntroChar: {
    type: MarkerTypes.char,
    markers: ["ior", "iqt"],
    attributes: [
      {
        name: "closed",
        type: "boolean",
        description: "Whether the character is closed",
        required: false,
      },
    ],
    contentElements: [
      "char",
      "figure",
      "milestone",
      "reference",
      "footnote",
      "crossReference",
      "break",
    ],
    contentText: true,
  },
  char: {
    type: MarkerTypes.char,
    markers: charMarkers,
    attributes: [
      {
        name: "closed",
        type: "boolean",
        description: "Whether the character is closed",
        required: false,
      },
    ],
    allowExtraAttributes: true,
    extraAttributesTypes: ["string"],
    contentElements: charContent,
    contentText: true,
  },
  listChar: {
    type: MarkerTypes.char,
    markers: ["litl", "lik", "liv1", "liv2", "liv3", "liv4", "liv5", "liv"],
    attributes: [
      {
        name: "closed",
        type: "boolean",
        description: "Whether the character is closed",
        required: false,
      },
    ],
    contentElements: [
      "char",
      "figure",
      "milestone",
      "footnote",
      "crossReference",
      "break",
      "reference",
    ],
  },
  figure: {
    type: MarkerTypes.figure,
    markers: ["fig"],
    attributes: [
      {
        name: "closed",
        type: "boolean",
        description: "Whether the character is closed",
        required: false,
      },
      {
        name: "alt",
        type: "string",
        description: "The alternative text",
        required: false,
      },
      {
        name: "src",
        type: "string",
        description: "The source of the figure",
        required: false,
      },
      {
        name: "size",
        type: "string",
        description: "The size of the figure",
        required: false,
      },
      {
        name: "loc",
        type: "string",
        description: "The location of the figure",
        required: false,
      },
      {
        name: "copy",
        type: "string",
        description: "The copy of the figure",
        required: false,
      },
      {
        name: "ref",
        type: "string",
        description: "The reference of the figure",
        required: false,
      },
    ],
    allowExtraAttributes: true,
    extraAttributesTypes: ["string"],
    contentText: true,
  },
  milestone: {
    type: MarkerTypes.ms,
    markers: milestoneMarkers,
    attributes: null,
    allowExtraAttributes: true,
    extraAttributesTypes: ["string"],
    contentText: false,
  },
  chapter: {
    type: MarkerTypes.chapter,
    markers: ["c"],
    attributes: [
      {
        name: "number",
        type: "string",
        description: "The number of the chapter",
        required: true,
      },
      {
        name: "sid",
        type: "string",
        description: "The identifier of the chapter",
        required: false,
      },
      {
        name: "altnumber",
        type: "string",
        description: "The alternative number of the chapter",
        required: false,
      },
      {
        name: "pubnumber",
        type: "string",
        description: "The publication number of the chapter",
        required: false,
      },
    ],
    contentText: false,
  },
  bookChapterLabel: {
    type: MarkerTypes.para,
    markers: ["cl"],
    attributes: null,
    contentText: true,
  },
  verse: {
    type: MarkerTypes.verse,
    markers: ["v"],
    attributes: [
      {
        name: "number",
        type: "string",
        description: "The number of the verse",
        required: true,
      },
      {
        name: "altnumber",
        type: "string",
        description: "The alternative number of the verse",
        required: false,
      },
      {
        name: "pubnumber",
        type: "string",
        description: "The publication number of the verse",
        required: false,
      },
      {
        name: "sid",
        type: "string",
        description: "The identifier of the verse",
        required: false,
      },
    ],
    contentText: false,
  },
  footnote: {
    type: MarkerTypes.note,
    markers: ["fe", "f", "efe", "ef"],
    attributes: [
      {
        name: "caller",
        type: "string",
        description: "The caller of the footnote",
        required: true,
      },
      {
        name: "category",
        type: "string",
        description: "The category of the footnote",
        required: false,
      },
    ],
    contentElements: ["footnoteChar"],
    contentText: true,
  },
  footnoteChar: {
    type: MarkerTypes.char,
    markers: ["fr", "ft", "fk", "fqa", "fq", "fl", "fw", "fdc", "fp"],
    attributes: null,
    contentElements: ["char", "figure", "milestone", "reference", "break"],
    contentText: true,
  },
  crossReference: {
    type: MarkerTypes.note,
    markers: ["x", "ex"],
    attributes: [
      {
        name: "caller",
        type: "string",
        description: "The caller of the cross reference",
        required: true,
      },
      {
        name: "category",
        type: "string",
        description: "The category of the cross reference",
        required: false,
      },
    ],
    contentElements: ["crossReferenceChar"],
    contentText: false,
  },
  crossReferenceChar: {
    type: MarkerTypes.char,
    markers: ["xop", "xo", "xta", "xt", "xk", "xq", "xot", "xnt", "xdc"],
    attributes: [
      {
        name: "closed",
        type: "boolean",
        description: "Whether the character is closed",
        required: false,
      },
    ],
    contentElements: ["char", "figure", "milestone", "reference", "break"],
    contentText: true,
  },
  sidebar: {
    type: MarkerTypes.sidebar,
    markers: ["esb"],
    attributes: [
      {
        name: "category",
        type: "string",
        description: "The category of the sidebar",
        required: false,
      },
    ],
    contentElements: [
      "versePara",
      "otherPara",
      "section",
      "footnote",
      "crossReference",
      "list",
      "table",
    ],
    contentText: false,
  },
  reference: {
    type: MarkerTypes.ref,
    markers: [],
    attributes: [
      {
        name: "loc",
        type: "string",
        description: "The location of the reference",
        pattern: "[A-Z1-4]{3}(-[A-Z1-4]{3})? ?[a-z0-9:-]*",
        required: false,
      },
      {
        name: "gen",
        type: "boolean",
        description: "Whether the reference is generated",
        required: false,
      },
    ],
    contentElements: ["referenceChar"],
    contentText: true,
  },
  break: {
    type: MarkerTypes.optbreak,
    markers: [],
    attributes: null,
    contentText: false,
  },
  remark: {
    type: MarkerTypes.para,
    markers: ["rem"],
    attributes: null,
    contentText: true,
  },
};

export type ScripturalElement = (typeof scripturalElements)[keyof typeof scripturalElements];

export const scripturalMarkers: Record<
  string,
  {
    description: string;
    hasEndMarker: boolean;
    element?: ScripturalElement | ScripturalElement[];
  }
> = {
  id: {
    description: "File identification information (BOOKID, FILENAME, EDITOR, MODIFICATION DATE)",
    hasEndMarker: false,
    element: scripturalElements.bookIdentification,
  },
  usfm: {
    description: "File markup version information",
    hasEndMarker: false,
    element: scripturalElements.bookUsfmVersion,
  },
  ide: {
    description: "File encoding information",
    hasEndMarker: false,
    element: scripturalElements.bookHeaders,
  },
  h: {
    description: "Running header text for a book (basic)",
    hasEndMarker: false,
    element: scripturalElements.bookHeaders,
  },
  h1: {
    description: "Running header text",
    hasEndMarker: false,
    element: scripturalElements.bookHeaders,
  },
  h2: {
    description: "Running header text, left side of page",
    hasEndMarker: false,
    element: scripturalElements.bookHeaders,
  },
  h3: {
    description: "Running header text, right side of page",
    hasEndMarker: false,
    element: scripturalElements.bookHeaders,
  },
  toc: {
    description: "Table of contents",
    hasEndMarker: false,
    element: scripturalElements.bookHeaders,
  },
  toc1: {
    description: "Long table of contents text",
    hasEndMarker: false,
    element: scripturalElements.bookHeaders,
  },
  toc2: {
    description: "Short table of contents text",
    hasEndMarker: false,
    element: scripturalElements.bookHeaders,
  },
  toc3: {
    description: "Book Abbreviation",
    hasEndMarker: false,
    element: scripturalElements.bookHeaders,
  },
  toca1: {
    description: "Alternative language long table of contents text",
    hasEndMarker: false,
    element: scripturalElements.bookHeaders,
  },
  toca2: {
    description: "Alternative language short table of contents text",
    hasEndMarker: false,
    element: scripturalElements.bookHeaders,
  },
  toca3: {
    description: "Alternative language book Abbreviation",
    hasEndMarker: false,
    element: scripturalElements.bookHeaders,
  },
  rem: {
    description: "Comments and remarks",
    hasEndMarker: false,
    element: scripturalElements.remark,
  },
  sts: {
    description: "Status of this file",
    hasEndMarker: false,
    element: scripturalElements.bookHeaders,
  },
  restore: {
    description: "Project restore information",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  imt: {
    description: "Introduction major title, level 1 (if single level) (basic)",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  imt1: {
    description: "Introduction major title, level 1 (if multiple levels)",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  imt2: {
    description: "Introduction major title, level 2",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  imt3: {
    description: "Introduction major title, level 3",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  imt4: {
    description: "Introduction major title, level 4 (usually within parenthesis)",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  imte: {
    description: "Introduction major title at introduction end, level 1 (if single level)",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  imte1: {
    description: "Introduction major title at introduction end, level 1 (if multiple levels)",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  imte2: {
    description: "Introduction major title at introduction end, level 2",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  is: {
    description: "Introduction section heading, level 1 (if single level) (basic)",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  is1: {
    description: "Introduction section heading, level 1 (if multiple levels)",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  is2: {
    description: "Introduction section heading, level 2",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  iot: {
    description: "Introduction outline title (basic)",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  io: {
    description: "Introduction outline text, level 1 (if single level)",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  io1: {
    description: "Introduction outline text, level 1 (if multiple levels) (basic)",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  io2: {
    description: "Introduction outline text, level 2",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  io3: {
    description: "Introduction outline text, level 3",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  io4: {
    description: "Introduction outline text, level 4",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  ior: {
    description:
      "Introduction references range for outline entry; for marking references separately",
    hasEndMarker: true,
    element: scripturalElements.IntroChar,
  },
  ip: {
    description: "Introduction prose paragraph (basic)",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  im: {
    description: "Introduction prose paragraph, with no first line indent (may occur after poetry)",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  ipi: {
    description: "Introduction prose paragraph, indented, with first line indent",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  imi: {
    description: "Introduction prose paragraph text, indented, with no first line indent",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  ili: {
    description: "A list entry, level 1 (if single level)",
    hasEndMarker: false,
    element: scripturalElements.introList,
  },
  ili1: {
    description: "A list entry, level 1 (if multiple levels)",
    hasEndMarker: false,
    element: scripturalElements.introList,
  },
  ili2: {
    description: "A list entry, level 2",
    hasEndMarker: false,
    element: scripturalElements.introList,
  },
  ipq: {
    description: "Introduction prose paragraph, quote from the body text",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  imq: {
    description:
      "Introduction prose paragraph, quote from the body text, with no first line indent",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  ipr: {
    description: "Introduction prose paragraph, right aligned",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  ib: {
    description: "Introduction blank line",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  iq: {
    description: "Introduction poetry text, level 1 (if single level)",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  iq1: {
    description: "Introduction poetry text, level 1 (if multiple levels)",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  iq2: {
    description: "Introduction poetry text, level 2",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  iq3: {
    description: "Introduction poetry text, level 3",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  iex: {
    description:
      "Introduction explanatory or bridge text (e.g. explanation of missing book in Short Old Testament)",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  iqt: {
    description: "For quoted scripture text appearing in the introduction",
    hasEndMarker: true,
    element: scripturalElements.IntroChar,
  },
  ie: {
    description: "Introduction ending marker",
    hasEndMarker: false,
    element: scripturalElements.bookIntroduction,
  },
  c: {
    description: "Chapter number",
    hasEndMarker: false,
    element: scripturalElements.chapter,
  },
  ca: {
    description:
      "Second (alternate) chapter number (for coding dual versification; useful for places where different traditions of chapter breaks need to be supported in the same translation)",
    hasEndMarker: true,
    element: undefined,
  },
  cp: {
    description:
      "Published chapter number (chapter string that should appear in the published text)",
    hasEndMarker: false,
    element: scripturalElements.otherPara,
  },
  cl: {
    description:
      "Chapter label used for translations that add a word such as 'Chapter' before chapter numbers (e.g. Psalms). The subsequent text is the chapter label.",
    hasEndMarker: false,
    element: scripturalElements.bookChapterLabel,
  },
  cd: {
    description: "Chapter Description (Publishing option D, e.g. in Russian Bibles)",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  v: {
    description: "A verse number",
    hasEndMarker: false,
    element: scripturalElements.verse,
  },
  va: {
    description:
      "Second (alternate) verse number (for coding dual numeration in Psalms; see also NRSV Exo 22.1-4)",
    hasEndMarker: true,
    element: undefined,
  },
  vp: {
    description: "Published verse marker (verse string that should appear in the published text)",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  p: {
    description: "Paragraph text, with first line indent (basic)",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  m: {
    description: "Paragraph text, with no first line indent (may occur after poetry) (basic)",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  po: {
    description: "Letter opening",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  pr: {
    description: "Text refrain (paragraph text, right aligned)",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  cls: {
    description: "Letter Closing",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  pmo: {
    description: "Embedded text opening",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  pm: {
    description: "Embedded text paragraph",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  pmc: {
    description: "Embedded text closing",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  pmr: {
    description: "Embedded text refrain (e.g. Then all the people shall say, 'Amen!')",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  pi: {
    description:
      "Paragraph text, level 1 indent (if single level), with first line indent; often used for discourse (basic)",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  pi1: {
    description:
      "Paragraph text, level 1 indent (if multiple levels), with first line indent; often used for discourse",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  pi2: {
    description: "Paragraph text, level 2 indent, with first line indent; often used for discourse",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  pi3: {
    description: "Paragraph text, level 3 indent, with first line indent; often used for discourse",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  pc: {
    description: "Paragraph text, centered (for Inscription)",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  mi: {
    description: "Paragraph text, indented, with no first line indent; often used for discourse",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  nb: {
    description:
      "Paragraph text, with no break from previous paragraph text (at chapter boundary) (basic)",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  q: {
    description: "Poetry text, level 1 indent (if single level)",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  q1: {
    description: "Poetry text, level 1 indent (if multiple levels) (basic)",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  q2: {
    description: "Poetry text, level 2 indent (basic)",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  q3: {
    description: "Poetry text, level 3 indent",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  q4: {
    description: "Poetry text, level 4 indent",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  qc: {
    description: "Poetry text, centered",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  qr: {
    description: "Poetry text, Right Aligned",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  qs: {
    description: "Poetry text, Selah",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  qa: {
    description: "Poetry text, Acrostic marker/heading",
    hasEndMarker: false,
    element: scripturalElements.otherPara,
  },
  qac: {
    description: "Poetry text, Acrostic markup of the first character of a line of acrostic poetry",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  qm: {
    description: "Poetry text, embedded, level 1 indent (if single level)",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  qm1: {
    description: "Poetry text, embedded, level 1 indent (if multiple levels)",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  qm2: {
    description: "Poetry text, embedded, level 2 indent",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  qm3: {
    description: "Poetry text, embedded, level 3 indent",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  qd: {
    description:
      "A Hebrew musical performance annotation, similar in content to Hebrew descriptive title.",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  b: {
    description: "Poetry text stanza break (e.g. stanza break) (basic)",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  mt: {
    description: "The main title of the book (if single level)",
    hasEndMarker: false,
    element: scripturalElements.bookTitles,
  },
  mt1: {
    description: "The main title of the book (if multiple levels) (basic)",
    hasEndMarker: false,
    element: scripturalElements.bookTitles,
  },
  mt2: {
    description: "A secondary title usually occurring before the main title (basic)",
    hasEndMarker: false,
    element: scripturalElements.bookTitles,
  },
  mt3: {
    description: "A secondary title occurring after the main title",
    hasEndMarker: false,
    element: scripturalElements.bookTitles,
  },
  mt4: {
    description: "A small secondary title sometimes occurring within parentheses",
    hasEndMarker: false,
    element: scripturalElements.bookTitles,
  },
  mte: {
    description:
      "The main title of the book repeated at the end of the book, level 1 (if single level)",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  mte1: {
    description:
      "The main title of the book repeated at the end of the book, level 1 (if multiple levels)",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  mte2: {
    description: "A secondary title occurring before or after the 'ending' main title",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  ms: {
    description: "A major section division heading, level 1 (if single level) (basic)",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  ms1: {
    description: "A major section division heading, level 1 (if multiple levels)",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  ms2: {
    description: "A major section division heading, level 2",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  ms3: {
    description: "A major section division heading, level 3",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  mr: {
    description: "A major section division references range heading (basic)",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  s: {
    description: "A section heading, level 1 (if single level) (basic)",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  s1: {
    description: "A section heading, level 1 (if multiple levels)",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  s2: {
    description: "A section heading, level 2 (e.g. Proverbs 22-24)",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  s3: {
    description: "A section heading, level 3 (e.g. Genesis 'The First Day')",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  s4: {
    description: "A section heading, level 4",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  sr: {
    description: "A section division references range heading",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  r: {
    description: "Parallel reference(s) (basic)",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  sp: {
    description: "A heading, to identify the speaker (e.g. Job)",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  d: {
    description: "A Hebrew text heading, to provide description (e.g. Psalms)",
    hasEndMarker: false,
    element: scripturalElements.versePara,
  },
  sd: {
    description: "Vertical space used to divide the text into sections, level 1 (if single level)",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  sd1: {
    description:
      "Vertical space used to divide the text into sections, level 1 (if multiple levels)",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  sd2: {
    description: "Vertical space used to divide the text into sections, level 2",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  sd3: {
    description: "Vertical space used to divide the text into sections, level 3",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  sd4: {
    description: "Vertical space used to divide the text into sections, level 4",
    hasEndMarker: false,
    element: scripturalElements.section,
  },
  lh: {
    description: "List header (introductory remark)",
    hasEndMarker: false,
    element: scripturalElements.list,
  },
  li: {
    description: "A list entry, level 1 (if single level)",
    hasEndMarker: false,
    element: scripturalElements.list,
  },
  li1: {
    description: "A list entry, level 1 (if multiple levels)",
    hasEndMarker: false,
    element: scripturalElements.list,
  },
  li2: {
    description: "A list entry, level 2",
    hasEndMarker: false,
    element: scripturalElements.list,
  },
  li3: {
    description: "A list entry, level 3",
    hasEndMarker: false,
    element: scripturalElements.list,
  },
  li4: {
    description: "A list entry, level 4",
    hasEndMarker: false,
    element: scripturalElements.list,
  },
  lf: {
    description: "List footer (concluding remark)",
    hasEndMarker: false,
    element: scripturalElements.list,
  },
  lim: {
    description: "An embedded list entry, level 1 (if single level)",
    hasEndMarker: false,
    element: scripturalElements.list,
  },
  lim1: {
    description: "An embedded list entry, level 1 (if multiple levels)",
    hasEndMarker: false,
    element: scripturalElements.list,
  },
  lim2: {
    description: "An embedded list entry, level 2",
    hasEndMarker: false,
    element: scripturalElements.list,
  },
  lim3: {
    description: "An embedded list item, level 3",
    hasEndMarker: false,
    element: scripturalElements.list,
  },
  lim4: {
    description: "An embedded list entry, level 4",
    hasEndMarker: false,
    element: scripturalElements.list,
  },
  litl: {
    description: "List entry total text",
    hasEndMarker: true,
    element: scripturalElements.listChar,
  },
  lik: {
    description: "Structured list entry key text",
    hasEndMarker: true,
    element: scripturalElements.listChar,
  },
  liv: {
    description: "Structured list entry value 1 content (if single value)",
    hasEndMarker: true,
    element: scripturalElements.listChar,
  },
  liv1: {
    description: "Structured list entry value 1 content (if multiple values)",
    hasEndMarker: true,
    element: scripturalElements.listChar,
  },
  liv2: {
    description: "Structured list entry value 2 content",
    hasEndMarker: true,
    element: scripturalElements.listChar,
  },
  liv3: {
    description: "Structured list entry value 3 content",
    hasEndMarker: true,
    element: scripturalElements.listChar,
  },
  liv4: {
    description: "Structured list entry value 4 content",
    hasEndMarker: true,
    element: scripturalElements.listChar,
  },
  liv5: {
    description: "Structured list entry value 5 content",
    hasEndMarker: true,
    element: scripturalElements.listChar,
  },
  f: {
    description: "A Footnote text item (basic)",
    hasEndMarker: true,
    element: scripturalElements.footnote,
  },
  fe: {
    description: "An Endnote text item",
    hasEndMarker: true,
    element: scripturalElements.footnote,
  },
  fr: {
    description: "The origin reference for the footnote (basic)",
    hasEndMarker: true,
    element: scripturalElements.footnoteChar,
  },
  ft: {
    description: "Footnote text, Protocanon (basic)",
    hasEndMarker: true,
    element: scripturalElements.footnoteChar,
  },
  fk: {
    description: "A footnote keyword (basic)",
    hasEndMarker: true,
    element: scripturalElements.footnoteChar,
  },
  fq: {
    description: "A footnote scripture quote or alternate rendering (basic)",
    hasEndMarker: true,
    element: scripturalElements.footnoteChar,
  },
  fqa: {
    description: "A footnote alternate rendering for a portion of scripture text",
    hasEndMarker: true,
    element: scripturalElements.footnoteChar,
  },
  fl: {
    description:
      "A footnote label text item, for marking or 'labelling' the type or alternate translation being provided in the note.",
    hasEndMarker: true,
    element: scripturalElements.footnoteChar,
  },
  fw: {
    description:
      "A footnote witness list, for distinguishing a list of sigla representing witnesses in critical editions.",
    hasEndMarker: true,
    element: scripturalElements.footnoteChar,
  },
  fp: {
    description: "A Footnote additional paragraph marker",
    hasEndMarker: true,
    element: scripturalElements.footnoteChar,
  },
  fv: {
    description: "A verse number within the footnote text",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  fdc: {
    description: "Footnote text, applies to Deuterocanon only",
    hasEndMarker: true,
    element: scripturalElements.footnoteChar,
  },
  fm: {
    description: "An additional footnote marker location for a previous footnote",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  x: {
    description: "A list of cross references (basic)",
    hasEndMarker: true,
    element: scripturalElements.crossReference,
  },
  xo: {
    description: "The cross reference origin reference (basic)",
    hasEndMarker: true,
    element: scripturalElements.crossReferenceChar,
  },
  xop: {
    description:
      "Published cross reference origin reference (origin reference that should appear in the published text)",
    hasEndMarker: true,
    element: scripturalElements.crossReferenceChar,
  },
  xt: {
    description: "The cross reference target reference(s), protocanon only (basic)",
    hasEndMarker: true,
    element: [scripturalElements.char, scripturalElements.crossReferenceChar],
  },
  xta: {
    description: "Cross reference target references added text",
    hasEndMarker: true,
    element: scripturalElements.crossReferenceChar,
  },
  xk: {
    description: "A cross reference keyword",
    hasEndMarker: true,
    element: scripturalElements.crossReferenceChar,
  },
  xq: {
    description: "A cross-reference quotation from the scripture text",
    hasEndMarker: true,
    element: scripturalElements.crossReferenceChar,
  },
  xot: {
    description: "Cross-reference target reference(s), Old Testament only",
    hasEndMarker: true,
    element: scripturalElements.crossReferenceChar,
  },
  xnt: {
    description: "Cross-reference target reference(s), New Testament only",
    hasEndMarker: true,
    element: scripturalElements.crossReferenceChar,
  },
  xdc: {
    description: "Cross-reference target reference(s), Deuterocanon only",
    hasEndMarker: true,
    element: scripturalElements.crossReferenceChar,
  },
  rq: {
    description: "A cross-reference indicating the source text for the preceding quotation.",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  qt: {
    description: "For Old Testament quoted text appearing in the New Testament (basic)",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  nd: {
    description: "For name of deity (basic)",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  tl: {
    description: "For transliterated words",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  dc: {
    description: "Deuterocanonical/LXX additions or insertions in the Protocanonical text",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  bk: {
    description: "For the quoted name of a book",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  sig: {
    description: "For the signature of the author of an Epistle",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  pn: {
    description: "For a proper name",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  png: {
    description: "For a geographic proper name",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  addpn: {
    description: "For chinese words to be dot underline & underline",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  wj: {
    description: "For marking the words of Jesus",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  k: {
    description: "For a keyword",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  sls: {
    description:
      "To represent where the original text is in a secondary language or from an alternate text source",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  ord: {
    description: "For the text portion of an ordinal number",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  add: {
    description: "For a translational addition to the text",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  lit: {
    description: "For a comment or note inserted for liturgical use",
    hasEndMarker: false,
    element: scripturalElements.otherPara,
  },
  no: {
    description: "A character style, use normal text",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  it: {
    description: "A character style, use italic text",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  bd: {
    description: "A character style, use bold text",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  bdit: {
    description: "A character style, use bold + italic text",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  em: {
    description: "A character style, use emphasized text style",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  sc: {
    description: "A character style, for small capitalization text",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  sup: {
    description:
      "A character style, for superscript text. Typically for use in critical edition footnotes.",
    hasEndMarker: true,
    element: scripturalElements.char,
  },
  pb: {
    description:
      "Page Break used for new reader portions and children's bibles where content is controlled by the page",
    hasEndMarker: false,
    element: scripturalElements.otherPara,
  },
};

export type ScripturalMarker = (typeof scripturalMarkers)[keyof typeof scripturalMarkers];

export const getChildrenMarkers = (marker: string) => {
  const baseMarker = scripturalMarkers[marker];

  if (!baseMarker) return undefined;

  const mergedChildren = Array.isArray(baseMarker.element)
    ? [
        ...baseMarker.element.reduce((acc, el) => {
          el.contentElements?.forEach((element) =>
            scripturalElements[element].markers.forEach((marker) => acc.add(marker)),
          );
          return acc;
        }, new Set<string>()),
      ]
    : baseMarker.element?.contentElements
        ?.map((elementKey) => {
          const element = scripturalElements[elementKey];
          if (!element) {
            console.warn(`Element ${elementKey} not found in scripturalElements`);
            return [];
          }
          return element.markers;
        })
        .flat();

  return mergedChildren;
};

export const getMarkersAlike = (marker: string) => {
  const baseMarker = scripturalMarkers[marker];
  if (!Array.isArray(baseMarker.element)) {
    return baseMarker.element?.markers;
  }
  return baseMarker.element.reduce((acc, el) => {
    el.markers.forEach((marker) => acc.push(marker));
    return acc;
  }, [] as string[]);
};

export function getMarker(marker: string): ScripturalMarker | undefined {
  return scripturalMarkers[marker];
}
