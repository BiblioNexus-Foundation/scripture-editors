import type { SerializedEditorState } from "lexical";
import { MarkerContent, Usj } from "./usj.model";

const NBSP = "\xa0";

export const usxEmpty = '<usx version="3.0" />';

export const usjEmpty: Usj = { type: "USJ", version: "0.2.1", content: [] };

export const editorStateEmpty = {
  root: {
    type: "root",
    direction: null,
    format: "",
    indent: 0,
    version: 1,
    children: [
      {
        type: "para",
        marker: "p",
        classList: ["text-spacing", "formatted-font"],
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        version: 1,
        children: [],
      },
    ],
  },
} as unknown as SerializedEditorState;

/**
 * Reformatted from:
 * @see https://github.com/mvh-solutions/nice-usfm-json/blob/main/samples/character/origin.xml
 */
export const usxGen1v1 = `
<usx version="3.0">
  <book style="id" code="GEN">Some Scripture Version</book>
  <chapter style="c" number="1" sid="GEN 1" />
    <para style="p">
      <verse style="v" number="1" sid="GEN 1:1" />the first verse <verse eid="GEN 1:1" />
      <verse style="v" number="2" sid="GEN 1:2" />the second verse <verse eid="GEN 1:2" />
      <verse style="v" number="15" sid="GEN 1:15"/>Tell the Israelites that I, the <char style="nd">Lord</char>, the God of their ancestors, the God of Abraham, Isaac, and Jacob,<verse eid="GEN 1:15" />
    </para>
    <para style="b" />
    <para style="q2"><verse style="v" number="16" sid="GEN 1:16"/>“There is no help for him in God.”<note style="f" caller="+"><char style="fr">3:2 </char><char style="ft">The Hebrew word rendered “God” is “אֱלֹהִ֑ים” (Elohim).</char></note> <char style="qs">Selah.</char><verse eid="GEN 1:16" /></para>
  <chapter eid="GEN 1" />
</usx>
`;

/** para index where the note exists */
export const NOTE_PARA_INDEX = 4;
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
    { type: "book", marker: "id", code: "GEN", content: ["Some Scripture Version"] },
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
    { type: "para", marker: "b" },
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

/** Lexical editor state JSON (depends on nodes used). */
export const editorStateGen1v1 = {
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
        version: 1,
        children: [
          {
            type: "text",
            text: "Some Scripture Version",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
        ],
      },
      {
        type: "immutable-chapter",
        marker: "c",
        number: "1",
        classList: ["text-spacing", "formatted-font"],
        sid: "GEN 1",
        version: 1,
      },
      {
        type: "para",
        marker: "p",
        classList: ["text-spacing", "formatted-font"],
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
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
        marker: "b",
        classList: ["text-spacing", "formatted-font"],
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        version: 1,
        children: [],
      },
      {
        type: "para",
        marker: "q2",
        classList: ["text-spacing", "formatted-font"],
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
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
        version: 1,
        children: [
          {
            type: "text",
            text: "Some Scripture Version",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
        ],
      },
      {
        type: "chapter",
        marker: "c",
        number: "1",
        sid: "GEN 1",
        classList: [],
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "text",
            text: `\\c${NBSP}1 `,
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
        marker: "p",
        classList: [],
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
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
        marker: "b",
        classList: [],
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        version: 1,
        children: [
          {
            type: "marker",
            marker: "b",
            detail: 0,
            format: 0,
            isOpening: true,
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
        ],
      },
      {
        type: "para",
        marker: "q2",
        classList: [],
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
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
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "text",
            text: "",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
        ],
      },
      {
        type: "implied-para",
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        version: 1,
        children: [
          {
            type: "immutable-chapter",
            marker: "c",
            number: "1",
            classList: ["text-spacing", "formatted-font"],
            sid: "GEN 1",
            version: 1,
          },
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

export const usjMarks: Usj = {
  type: "USJ",
  version: "0.2.1",
  content: [
    {
      type: "para",
      marker: "p",
      content: [
        "Some ",
        { type: "ms", marker: "zmsc-s" },
        "marked",
        { type: "ms", marker: "zmsc-e" },
        " text.",
      ],
    },
    {
      type: "para",
      marker: "p",
      content: [
        "Some ",
        { type: "ms", marker: "zmsc-s", sid: "1" },
        "marked",
        { type: "ms", marker: "zmsc-e", eid: "1" },
        " text.",
      ],
    },
    {
      type: "para",
      marker: "p",
      content: [
        "Some ",
        { type: "ms", marker: "zmsc-s", sid: "1" },
        "adjacent ",
        { type: "ms", marker: "zmsc-e", eid: "1" },
        { type: "ms", marker: "zmsc-s", sid: "2" },
        "marked",
        { type: "ms", marker: "zmsc-e", eid: "2" },
        " text.",
      ],
    },
    {
      type: "para",
      marker: "p",
      content: [
        "Some ",
        { type: "ms", marker: "zmsc-s", sid: "1" },
        "overlapping",
        { type: "ms", marker: "zmsc-s", sid: "2" },
        "marked",
        { type: "ms", marker: "zmsc-e", eid: "1" },
        " text.",
        { type: "ms", marker: "zmsc-e", eid: "2" },
      ],
    },
    {
      type: "para",
      marker: "p",
      content: [
        "Some ",
        { type: "ms", marker: "zmsc-s", sid: "1" },
        "nested",
        { type: "ms", marker: "zmsc-s", sid: "2" },
        "marked",
        { type: "ms", marker: "zmsc-e", eid: "2" },
        " text.",
        { type: "ms", marker: "zmsc-e", eid: "1" },
      ],
    },
  ],
};

export const editorStateMarks = {
  root: {
    type: "root",
    direction: null,
    format: "",
    indent: 0,
    version: 1,
    children: [
      {
        type: "para",
        marker: "p",
        classList: ["text-spacing", "formatted-font"],
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        version: 1,
        children: [
          {
            type: "text",
            text: "Some ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "typed-mark",
            typedIDs: { comment: [] },
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "text",
                text: "marked",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                version: 1,
              },
            ],
          },
          {
            type: "text",
            text: " text.",
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
        marker: "p",
        classList: ["text-spacing", "formatted-font"],
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        version: 1,
        children: [
          {
            type: "text",
            text: "Some ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "typed-mark",
            typedIDs: { comment: ["1"] },
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "text",
                text: "marked",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                version: 1,
              },
            ],
          },
          {
            type: "text",
            text: " text.",
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
        marker: "p",
        classList: ["text-spacing", "formatted-font"],
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        version: 1,
        children: [
          {
            type: "text",
            text: "Some ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "typed-mark",
            typedIDs: { comment: ["1"] },
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "text",
                text: "adjacent ",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                version: 1,
              },
            ],
          },
          {
            type: "typed-mark",
            typedIDs: { comment: ["2"] },
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "text",
                text: "marked",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                version: 1,
              },
            ],
          },
          {
            type: "text",
            text: " text.",
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
        marker: "p",
        classList: ["text-spacing", "formatted-font"],
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        version: 1,
        children: [
          {
            type: "text",
            text: "Some ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "typed-mark",
            typedIDs: { comment: ["1"] },
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "text",
                text: "overlapping",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                version: 1,
              },
            ],
          },
          {
            type: "typed-mark",
            typedIDs: { comment: ["1", "2"] },
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "text",
                text: "marked",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                version: 1,
              },
            ],
          },
          {
            type: "typed-mark",
            typedIDs: { comment: ["2"] },
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "text",
                text: " text.",
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
      {
        type: "para",
        marker: "p",
        classList: ["text-spacing", "formatted-font"],
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        version: 1,
        children: [
          {
            type: "text",
            text: "Some ",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
          {
            type: "typed-mark",
            typedIDs: { comment: ["1"] },
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "text",
                text: "nested",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                version: 1,
              },
            ],
          },
          {
            type: "typed-mark",
            typedIDs: { comment: ["1", "2"] },
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "text",
                text: "marked",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                version: 1,
              },
            ],
          },
          {
            type: "typed-mark",
            typedIDs: { comment: ["1"] },
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "text",
                text: " text.",
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
    ],
  },
} as unknown as SerializedEditorState;

/** para index where the note exists */
export const NOTE_PARA_WITH_UNKNOWN_ITEMS_INDEX = 2;

export const usjWithUnknownItems = {
  type: "USJ",
  version: "0.2.1",
  content: [
    // unknown attributes
    { type: "book", marker: "id", code: "GEN", "attr-unknown": "watAttr" },
    { type: "chapter", marker: "c", number: "1", "attr-unknown": "watAttr" },
    {
      type: "para",
      marker: "p",
      "attr-unknown": "watAttr",
      content: [
        { type: "verse", marker: "v", number: "1", "attr-unknown": "watAttr" },
        "First part of the first verse ",
        {
          type: "note",
          marker: "f",
          caller: "+",
          "attr-unknown": "watAttr",
          content: [{ type: "char", marker: "fr", "attr-unknown": "watAttr", content: ["3:2 "] }],
        },
        { type: "ms", marker: "ts", "attr-unknown": "watAttr" },
        // unknown nodes
        {
          type: "wat",
          marker: "z",
          "attr-unknown": "watAttr",
          content: ["wat content?"],
        },
      ],
    } as MarkerContent,
    { type: "optbreak", marker: undefined },
    { type: "ref", marker: undefined, loc: "MRK 9:50", gen: "true", content: ["Mk 9.50"] },
    { type: "sidebar", marker: "esb", content: ["sidebar content"] },
    { type: "periph", marker: undefined, alt: "periph title", content: ["periph content"] },
    {
      type: "figure",
      marker: "fig",
      file: "file.jpg",
      size: "span",
      ref: "1.18",
      content: ["figure content"],
    },
    {
      type: "table",
      marker: undefined,
      content: [
        {
          type: "table:row",
          marker: "tr",
          content: [{ type: "table:cell", marker: "tc1", content: ["cell1"] }],
        },
      ],
    },
  ],
} as Usj;

export const editorStateWithUnknownItems = {
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
        unknownAttributes: { "attr-unknown": "watAttr" },
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "text",
            text: "",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
        ],
      },
      {
        type: "immutable-chapter",
        marker: "c",
        number: "1",
        classList: ["text-spacing", "formatted-font"],
        unknownAttributes: { "attr-unknown": "watAttr" },
        version: 1,
      },
      {
        type: "para",
        marker: "p",
        classList: ["text-spacing", "formatted-font"],
        unknownAttributes: { "attr-unknown": "watAttr" },
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        version: 1,
        children: [
          {
            type: "immutable-verse",
            marker: "v",
            number: "1",
            unknownAttributes: { "attr-unknown": "watAttr" },
            version: 1,
          },
          {
            type: "text",
            text: "First part of the first verse ",
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
            unknownAttributes: { "attr-unknown": "watAttr" },
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "immutable-note-caller",
                caller: "a",
                previewText: "3:2",
                version: 1,
              },
              {
                type: "char",
                marker: "fr",
                text: "3:2 ",
                unknownAttributes: { "attr-unknown": "watAttr" },
                style: "display: none",
                detail: 0,
                format: 0,
                mode: "normal",
                version: 1,
              },
            ],
          },
          {
            type: "ms",
            marker: "ts",
            unknownAttributes: { "attr-unknown": "watAttr" },
            version: 1,
          },
          {
            type: "unknown",
            tag: "wat",
            marker: "z",
            unknownAttributes: { "attr-unknown": "watAttr" },
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "text",
                text: "wat content?",
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
      {
        type: "unknown",
        tag: "optbreak",
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [],
      },
      {
        type: "unknown",
        tag: "ref",
        unknownAttributes: { loc: "MRK 9:50", gen: "true" },
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "text",
            text: "Mk 9.50",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
        ],
      },
      {
        type: "unknown",
        tag: "sidebar",
        marker: "esb",
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "text",
            text: "sidebar content",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
        ],
      },
      {
        type: "unknown",
        tag: "periph",
        unknownAttributes: { alt: "periph title" },
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "text",
            text: "periph content",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
        ],
      },
      {
        type: "unknown",
        tag: "figure",
        marker: "fig",
        unknownAttributes: { file: "file.jpg", size: "span", ref: "1.18" },
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "text",
            text: "figure content",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
        ],
      },
      {
        type: "unknown",
        tag: "table",
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "unknown",
            tag: "table:row",
            marker: "tr",
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "unknown",
                tag: "table:cell",
                marker: "tc1",
                direction: null,
                format: "",
                indent: 0,
                version: 1,
                children: [
                  {
                    type: "text",
                    text: "cell1",
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
        ],
      },
    ],
  },
} as unknown as SerializedEditorState;
