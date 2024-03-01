import { SerializedEditorState } from "lexical";
import { Usj } from "./usj.model";
import { NBSP } from "../../nodes/scripture/usj/node.utils";
import { SerializedParaNode } from "../../nodes/scripture/usj/ParaNode";

export const usxEmpty = '<usx version="3.0"/>';

/**
 * Reformatted from:
 * @see https://github.com/mvh-solutions/nice-usfm-json/blob/main/samples/character/origin.xml
 */
export const usxGen1v1 = `
<usx version="3.0">
  <book style="id" code="GEN" />
  <chapter style="c" number="1" sid="GEN 1" />
    <para style="p">
      <verse style="v" number="1" sid="GEN 1:1" />the first verse <verse eid="GEN 1:1" />
      <verse style="v" number="2" sid="GEN 1:2" />the second verse <verse eid="GEN 1:2" />
      <verse style="v" number="15" sid="GEN 1:15"/>Tell the Israelites that I, the <char style="nd">Lord</char>, the God of their ancestors, the God of Abraham, Isaac, and Jacob,<verse eid="GEN 1:15" />
    </para>
    <para style="q2"><verse style="v" number="16" sid="GEN 1:16"/>“There is no help for him in God.”<note style="f" caller="+"><char style="fr">3:2 </char><char style="ft">The Hebrew word rendered “God” is “אֱלֹהִ֑ים” (Elohim).</char></note> <char style="qs">Selah.</char><verse eid="GEN 1:16" /></para>
  <chapter eid="GEN 1" />
</usx>
`;

export const usxGen1v1ImpliedPara = `
<usx version="3.0">
  <book style="id" code="GEN" />
  <chapter style="c" number="1" sid="GEN 1" />
    <verse style="v" number="1" sid="GEN 1:1" />the first verse <verse eid="GEN 1:1" />
    <verse style="v" number="2" sid="GEN 1:2" />the second verse <verse eid="GEN 1:2" />
    <verse style="v" number="15" sid="GEN 1:15" />Tell the Israelites that I, the <char style="nd">Lord</char>, the God of their ancestors, the God of Abraham, Isaac, and Jacob,<verse eid="GEN 1:15" />
  <chapter eid="GEN 1" />
</usx>
`;

export const usjEmpty: Usj = { type: "USJ", version: "0.2.1", content: [] };

/** para index where the note exists */
export const NOTE_PARA_INDEX = 3;
/** index of the note in para children */
export const NOTE_INDEX = 2;
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
  version: "0.2.1",
  content: [
    { type: "book", marker: "id", code: "GEN" },
    { type: "chapter", marker: "c", number: "1", sid: "GEN 1" },
    {
      type: "para",
      marker: "p",
      content: [
        { type: "verse", marker: "v", number: "1", sid: "GEN 1:1" },
        "the first verse ",
        { type: "verse", marker: "v", number: "2", sid: "GEN 1:2" },
        "the second verse ",
        { type: "verse", marker: "v", number: "15", sid: "GEN 1:15" },
        "Tell the Israelites that I, the ",
        { type: "char", marker: "nd", content: ["Lord"] },
        ", the God of their ancestors, the God of Abraham, Isaac, and Jacob,",
      ],
    },
    {
      type: "para",
      marker: "q2",
      content: [
        { type: "verse", marker: "v", number: "16", sid: "GEN 1:16" },
        "“There is no help for him in God.”",
        {
          type: "note",
          marker: "f",
          caller: "+",
          content: [
            { type: "char", marker: "fr", content: ["3:2 "] },
            {
              type: "char",
              marker: "ft",
              content: ["The Hebrew word rendered “God” is “אֱלֹהִ֑ים” (Elohim)."],
            },
          ],
        },
        " ",
        { type: "char", marker: "qs", content: ["Selah."] },
      ],
    },
  ],
};

export const usjGen1v1ImpliedPara: Usj = {
  type: "USJ",
  version: "0.2.1",
  content: [
    { type: "book", marker: "id", code: "GEN" },
    { type: "chapter", marker: "c", number: "1", sid: "GEN 1" },
    { type: "verse", marker: "v", number: "1", sid: "GEN 1:1" },
    "the first verse ",
    { type: "verse", marker: "v", number: "2", sid: "GEN 1:2" },
    "the second verse ",
    { type: "verse", marker: "v", number: "15", sid: "GEN 1:15" },
    "Tell the Israelites that I, the ",
    { type: "char", marker: "nd", content: ["Lord"] },
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
        marker: "p",
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
        marker: "id",
        code: "GEN",
        text: "",
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [],
      },
      { type: "immutable-chapter", marker: "c", number: "1", sid: "GEN 1", version: 1 },
      {
        type: "para",
        marker: "p",
        classList: [],
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [
          { type: "immutable-verse", marker: "v", number: "1", sid: "GEN 1:1", version: 1 },
          {
            type: "text",
            text: "the first verse ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          { type: "immutable-verse", marker: "v", number: "2", sid: "GEN 1:2", version: 1 },
          {
            type: "text",
            text: "the second verse ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          { type: "immutable-verse", marker: "v", number: "15", sid: "GEN 1:15", version: 1 },
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
            marker: "nd",
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
        marker: "q2",
        classList: [],
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [
          { type: "immutable-verse", marker: "v", number: "16", sid: "GEN 1:16", version: 1 },
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
            marker: "f",
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
                marker: "fr",
                text: "3:2 ",
                style: "display: none",
                detail: 0,
                format: 0,
                mode: "normal",
                version: 1,
              },
              {
                type: "char",
                marker: "ft",
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
            marker: "qs",
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
        marker: "id",
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
        marker: "c",
        number: "1",
        sid: "GEN 1",
        text: `\\c${NBSP}1 `,
        classList: ["plain-font"],
        version: 1,
      },
      {
        type: "para",
        marker: "p",
        classList: ["no-indent", "plain-font"],
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "marker",
            marker: "p",
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
          { type: "linebreak", version: 1 },
          {
            type: "verse",
            marker: "v",
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
          { type: "linebreak", version: 1 },
          {
            type: "verse",
            marker: "v",
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
          { type: "linebreak", version: 1 },
          {
            type: "verse",
            marker: "v",
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
            marker: "nd",
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
            marker: "nd",
            text: `${NBSP}Lord`,
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "marker",
            marker: "nd",
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
        marker: "q2",
        classList: ["no-indent", "plain-font"],
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "marker",
            marker: "q2",
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
          { type: "linebreak", version: 1 },
          {
            type: "verse",
            marker: "v",
            number: "16",
            sid: "GEN 1:16",
            text: `\\v${NBSP}16 `,
            classList: ["plain-font"],
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
            marker: "f",
            caller: "+",
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "marker",
                marker: "f",
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
                marker: "fr",
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
                marker: "fr",
                text: `${NBSP}3:2 `,
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                version: 1,
              },
              {
                type: "marker",
                marker: "ft",
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
                marker: "ft",
                text: `${NBSP}The Hebrew word rendered “God” is “אֱלֹהִ֑ים” (Elohim).`,
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                version: 1,
              },
              {
                type: "marker",
                marker: "f",
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
            marker: "qs",
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
            marker: "qs",
            text: `${NBSP}Selah.`,
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "marker",
            marker: "qs",
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
        marker: "id",
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
          { type: "immutable-chapter", marker: "c", number: "1", sid: "GEN 1", version: 1 },
          { type: "immutable-verse", marker: "v", number: "1", sid: "GEN 1:1", version: 1 },
          {
            type: "text",
            text: "the first verse ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          { type: "immutable-verse", marker: "v", number: "2", sid: "GEN 1:2", version: 1 },
          {
            type: "text",
            text: "the second verse ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          { type: "immutable-verse", marker: "v", number: "15", sid: "GEN 1:15", version: 1 },
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
            marker: "nd",
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
