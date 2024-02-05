import { Usj } from "./usj.model";

export const usxEmpty = '<usx version="3.0" />';

/**
 * Reformatted from:
 * @see https://github.com/mvh-solutions/nice-usfm-json/blob/main/samples/character/origin.xml
 */
export const usxGen1v1 = `
<usx version="3.0">
  <book code="GEN" style="id" />
  <chapter number="1" style="c" sid="GEN 1" />
    <para style="p">
      <verse number="1" style="v" sid="GEN 1:1" />the first verse <verse eid="GEN 1:1" />
      <verse number="2" style="v" sid="GEN 1:2" />the second verse <verse eid="GEN 1:2" />
      <verse number="15" style="v" sid="GEN 1:15" />Tell the Israelites that I, the <char style="nd">Lord</char>, the God of their ancestors, the God of Abraham, Isaac, and Jacob,<verse eid="GEN 1:15" />
    </para>
    <para style="q2">“There is no help for him in God.”<note caller="+" style="f"><char style="fr">3:2 </char><char style="ft">The Hebrew word rendered “God” is “אֱלֹהִ֑ים” (Elohim).</char></note> <char style="qs">Selah.</char></para>
  <chapter eid="GEN 1" />
</usx>
`;

export const usxGen1v1ImpliedPara = `
<usx version="3.0">
  <book code="GEN" style="id" />
  <chapter number="1" style="c" sid="GEN 1" />
    <verse number="1" style="v" sid="GEN 1:1" />the first verse <verse eid="GEN 1:1" />
    <verse number="2" style="v" sid="GEN 1:2" />the second verse <verse eid="GEN 1:2" />
    <verse number="15" style="v" sid="GEN 1:15" />Tell the Israelites that I, the <char style="nd">Lord</char>, the God of their ancestors, the God of Abraham, Isaac, and Jacob,<verse eid="GEN 1:15" />
  <chapter eid="GEN 1" />
</usx>
`;

export const usjEmpty: Usj = {
  type: "USJ",
  version: "0.0.1-alpha.2",
  content: [],
};

/** para index where the note exists */
export const NOTE_PARA_INDEX = 3;
/** index of the note in para children */
export const NOTE_INDEX = 1;
/** index of the note caller in note children */
export const NOTE_CALLER_INDEX = 0;

/**
 * Modified from:
 * @see https://github.com/mvh-solutions/nice-usfm-json/blob/main/samples/character/proposed.json
 *
 * Additional test features:
 * - preserve significant whitespace at the beginning or end of text
 * - preserve significant whitespace between elements
 */
export const usjGen1v1: Usj = {
  type: "USJ",
  version: "0.0.1-alpha.2",
  content: [
    {
      type: "book:id",
      code: "GEN",
    },
    {
      type: "chapter:c",
      number: "1",
      sid: "GEN 1",
    },
    {
      type: "para:p",
      content: [
        {
          type: "verse:v",
          number: "1",
          sid: "GEN 1:1",
        },
        "the first verse ",
        {
          type: "verse:v",
          number: "2",
          sid: "GEN 1:2",
        },
        "the second verse ",
        {
          type: "verse:v",
          number: "15",
          sid: "GEN 1:15",
        },
        "Tell the Israelites that I, the ",
        {
          type: "char:nd",
          content: ["Lord"],
        },
        ", the God of their ancestors, the God of Abraham, Isaac, and Jacob,",
      ],
    },
    {
      type: "para:q2",
      content: [
        "“There is no help for him in God.”",
        {
          type: "note:f",
          caller: "+",
          content: [
            {
              type: "char:fr",
              content: ["3:2 "],
            },
            {
              type: "char:ft",
              content: ["The Hebrew word rendered “God” is “אֱלֹהִ֑ים” (Elohim)."],
            },
          ],
        },
        " ",
        {
          type: "char:qs",
          content: ["Selah."],
        },
      ],
    },
  ],
};

export const usjGen1v1ImpliedPara: Usj = {
  type: "USJ",
  version: "0.0.1-alpha.2",
  content: [
    {
      type: "book:id",
      code: "GEN",
    },
    {
      type: "chapter:c",
      number: "1",
      sid: "GEN 1",
    },
    {
      type: "verse:v",
      number: "1",
      sid: "GEN 1:1",
    },
    "the first verse ",
    {
      type: "verse:v",
      number: "2",
      sid: "GEN 1:2",
    },
    "the second verse ",
    {
      type: "verse:v",
      number: "15",
      sid: "GEN 1:15",
    },
    "Tell the Israelites that I, the ",
    {
      type: "char:nd",
      content: ["Lord"],
    },
    ", the God of their ancestors, the God of Abraham, Isaac, and Jacob,",
  ],
};

export const editorStateEmpty = {
  root: {
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
    children: [
      {
        direction: null,
        format: "",
        indent: 0,
        type: "para",
        usxStyle: "p",
        classList: [],
        version: 1,
        children: [],
      },
    ],
  },
};

/** Lexical editor state JSON (depends on nodes used). */
export const editorStateGen1v1 = {
  root: {
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
    children: [
      {
        direction: null,
        format: "",
        indent: 0,
        type: "book",
        code: "GEN",
        text: "",
        usxStyle: "id",
        version: 1,
        children: [],
      },
      { type: "immutable-chapter", number: "1", usxStyle: "c", sid: "GEN 1", version: 1 },
      {
        direction: null,
        format: "",
        indent: 0,
        type: "para",
        usxStyle: "p",
        classList: [],
        version: 1,
        children: [
          { type: "immutable-verse", number: "1", usxStyle: "v", sid: "GEN 1:1", version: 1 },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "the first verse ",
            type: "text",
            version: 1,
          },
          { type: "immutable-verse", number: "2", usxStyle: "v", sid: "GEN 1:2", version: 1 },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "the second verse ",
            type: "text",
            version: 1,
          },
          { type: "immutable-verse", number: "15", usxStyle: "v", sid: "GEN 1:15", version: 1 },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Tell the Israelites that I, the ",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Lord",
            type: "char",
            usxStyle: "nd",
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: ", the God of their ancestors, the God of Abraham, Isaac, and Jacob,",
            type: "text",
            version: 1,
          },
        ],
      },
      {
        direction: null,
        format: "",
        indent: 0,
        type: "para",
        usxStyle: "q2",
        classList: [],
        version: 1,
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "“There is no help for him in God.”",
            type: "text",
            version: 1,
          },
          {
            type: "note",
            usxStyle: "f",
            caller: "+",
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "immutable-note-caller",
                caller: "a",
                previewText: "3:2  The Hebrew word rendered “God” is “אֱלֹהִ֑ים” (Elohim).",
                version: 1,
              },
              {
                type: "char",
                usxStyle: "fr",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "display: none",
                text: "3:2 ",
                version: 1,
              },
              {
                type: "char",
                usxStyle: "ft",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "display: none",
                text: "The Hebrew word rendered “God” is “אֱלֹהִ֑ים” (Elohim).",
                version: 1,
              },
            ],
          },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: " ",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Selah.",
            type: "char",
            usxStyle: "qs",
            version: 1,
          },
        ],
      },
    ],
  },
};

export const editorStateGen1v1ImpliedPara = {
  root: {
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
    children: [
      {
        direction: null,
        format: "",
        indent: 0,
        type: "book",
        code: "GEN",
        text: "",
        usxStyle: "id",
        version: 1,
        children: [],
      },
      {
        direction: null,
        format: "",
        indent: 0,
        type: "implied-para",
        version: 1,
        children: [
          { type: "immutable-chapter", number: "1", usxStyle: "c", sid: "GEN 1", version: 1 },
          { type: "immutable-verse", number: "1", usxStyle: "v", sid: "GEN 1:1", version: 1 },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "the first verse ",
            type: "text",
            version: 1,
          },
          { type: "immutable-verse", number: "2", usxStyle: "v", sid: "GEN 1:2", version: 1 },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "the second verse ",
            type: "text",
            version: 1,
          },
          { type: "immutable-verse", number: "15", usxStyle: "v", sid: "GEN 1:15", version: 1 },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Tell the Israelites that I, the ",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Lord",
            type: "char",
            usxStyle: "nd",
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: ", the God of their ancestors, the God of Abraham, Isaac, and Jacob,",
            type: "text",
            version: 1,
          },
        ],
      },
    ],
  },
};
