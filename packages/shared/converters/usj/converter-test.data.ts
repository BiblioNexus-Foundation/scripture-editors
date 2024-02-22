import { SerializedEditorState } from "lexical";
import { Usj } from "./usj.model";
import { NBSP } from "../../nodes/scripture/usj/node.utils";
import { SerializedParaNode } from "../../nodes/scripture/usj/ParaNode";

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
/** index of chapter 1 */
export const CHAPTER_1_INDEX = 1;
/** para index where the verse exists */
export const VERSE_PARA_INDEX = 2;
/** index of the verse in para children */
export const VERSE_2_INDEX = 2;
export const VERSE_2_EDITABLE_INDEX = 6;

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

export const editorStateEmpty: SerializedEditorState<SerializedParaNode> = {
  root: {
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
    children: [
      {
        type: "para",
        usxStyle: "p",
        classList: [],
        direction: null,
        format: "",
        indent: 0,
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
        type: "book",
        usxStyle: "id",
        code: "GEN",
        text: "",
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [],
      },
      { type: "immutable-chapter", usxStyle: "c", number: "1", sid: "GEN 1", version: 1 },
      {
        type: "para",
        usxStyle: "p",
        classList: [],
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [
          { type: "immutable-verse", usxStyle: "v", number: "1", sid: "GEN 1:1", version: 1 },
          {
            type: "text",
            text: "the first verse ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          { type: "immutable-verse", usxStyle: "v", number: "2", sid: "GEN 1:2", version: 1 },
          {
            type: "text",
            text: "the second verse ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          { type: "immutable-verse", usxStyle: "v", number: "15", sid: "GEN 1:15", version: 1 },
          {
            type: "text",
            text: "Tell the Israelites that I, the ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "char",
            usxStyle: "nd",
            text: "Lord",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "text",
            text: ", the God of their ancestors, the God of Abraham, Isaac, and Jacob,",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
        ],
      },
      {
        type: "para",
        usxStyle: "q2",
        classList: [],
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "text",
            text: "“There is no help for him in God.”",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
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
                text: "3:2 ",
                style: "display: none",
                detail: 0,
                format: 0,
                mode: "normal",
                version: 1,
              },
              {
                type: "char",
                usxStyle: "ft",
                text: "The Hebrew word rendered “God” is “אֱלֹהִ֑ים” (Elohim).",
                style: "display: none",
                detail: 0,
                format: 0,
                mode: "normal",
                version: 1,
              },
            ],
          },
          {
            type: "text",
            text: " ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "char",
            usxStyle: "qs",
            text: "Selah.",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
        ],
      },
    ],
  },
} as unknown as SerializedEditorState;

/** Lexical editor state JSON (depends on nodes used). */
export const editorStateGen1v1Editable = {
  root: {
    type: "root",
    direction: null,
    format: "",
    indent: 0,
    version: 1,
    children: [
      {
        type: "book",
        usxStyle: "id",
        code: "GEN",
        direction: null,
        format: "",
        indent: 0,
        text: "",
        version: 1,
        children: [],
      },
      {
        type: "chapter",
        usxStyle: "c",
        number: "1",
        sid: "GEN 1",
        text: `\\c${NBSP}1 `,
        classList: ["plain-font"],
        version: 1,
      },
      {
        type: "para",
        usxStyle: "p",
        classList: ["no-indent", "plain-font"],
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "marker",
            usxStyle: "p",
            isOpening: true,
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "",
            version: 1,
          },
          {
            type: "text",
            text: NBSP,
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "linebreak",
            version: 1,
          },
          {
            type: "verse",
            usxStyle: "v",
            number: "1",
            sid: "GEN 1:1",
            text: `\\v${NBSP}1 `,
            classList: ["plain-font"],
            version: 1,
          },
          {
            type: "text",
            text: "the first verse ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "linebreak",
            version: 1,
          },
          {
            type: "verse",
            usxStyle: "v",
            number: "2",
            sid: "GEN 1:2",
            text: `\\v${NBSP}2 `,
            classList: ["plain-font"],
            version: 1,
          },
          {
            type: "text",
            text: "the second verse ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "linebreak",
            version: 1,
          },
          {
            type: "verse",
            usxStyle: "v",
            number: "15",
            sid: "GEN 1:15",
            text: `\\v${NBSP}15 `,
            classList: ["plain-font"],
            version: 1,
          },
          {
            type: "text",
            text: "Tell the Israelites that I, the ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "marker",
            usxStyle: "nd",
            isOpening: true,
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "",
            version: 1,
          },
          {
            type: "char",
            usxStyle: "nd",
            text: `${NBSP}Lord`,
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "marker",
            usxStyle: "nd",
            isOpening: false,
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "",
            version: 1,
          },
          {
            type: "text",
            text: ", the God of their ancestors, the God of Abraham, Isaac, and Jacob,",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
        ],
      },
      {
        type: "para",
        usxStyle: "q2",
        classList: ["no-indent", "plain-font"],
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "marker",
            usxStyle: "q2",
            isOpening: true,
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "",
            version: 1,
          },
          {
            type: "text",
            text: NBSP,
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "text",
            text: "“There is no help for him in God.”",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
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
                type: "marker",
                usxStyle: "f",
                isOpening: true,
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "",
                version: 1,
              },
              {
                type: "text",
                text: `${NBSP}+ `,
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                version: 1,
              },
              {
                type: "marker",
                usxStyle: "fr",
                isOpening: true,
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "",
                version: 1,
              },
              {
                type: "char",
                usxStyle: "fr",
                text: `${NBSP}3:2 `,
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                version: 1,
              },
              {
                type: "marker",
                usxStyle: "ft",
                isOpening: true,
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "",
                version: 1,
              },
              {
                type: "char",
                usxStyle: "ft",
                text: `${NBSP}The Hebrew word rendered “God” is “אֱלֹהִ֑ים” (Elohim).`,
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                version: 1,
              },
              {
                type: "marker",
                usxStyle: "f",
                isOpening: false,
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "",
                version: 1,
              },
            ],
          },
          {
            type: "text",
            text: " ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "marker",
            usxStyle: "qs",
            isOpening: true,
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "",
            version: 1,
          },
          {
            type: "char",
            usxStyle: "qs",
            text: `${NBSP}Selah.`,
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "marker",
            usxStyle: "qs",
            isOpening: false,
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "",
            version: 1,
          },
        ],
      },
    ],
  },
} as unknown as SerializedEditorState;

export const editorStateGen1v1ImpliedPara = {
  root: {
    type: "root",
    direction: null,
    format: "",
    indent: 0,
    version: 1,
    children: [
      {
        type: "book",
        code: "GEN",
        usxStyle: "id",
        text: "",
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [],
      },
      {
        type: "implied-para",
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [
          { type: "immutable-chapter", usxStyle: "c", number: "1", sid: "GEN 1", version: 1 },
          { type: "immutable-verse", usxStyle: "v", number: "1", sid: "GEN 1:1", version: 1 },
          {
            type: "text",
            text: "the first verse ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          { type: "immutable-verse", usxStyle: "v", number: "2", sid: "GEN 1:2", version: 1 },
          {
            type: "text",
            text: "the second verse ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          { type: "immutable-verse", usxStyle: "v", number: "15", sid: "GEN 1:15", version: 1 },
          {
            type: "text",
            text: "Tell the Israelites that I, the ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "char",
            usxStyle: "nd",
            text: "Lord",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "text",
            text: ", the God of their ancestors, the God of Abraham, Isaac, and Jacob,",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
        ],
      },
    ],
  },
} as unknown as SerializedEditorState;
