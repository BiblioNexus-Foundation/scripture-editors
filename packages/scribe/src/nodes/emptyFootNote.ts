export type Note = {
  type: "note";
  marker: string;
  caller: string;
  direction: string | null;
  format: string;
  indent: number;
  version: number;
  children: (ImmutableNoteCaller | Char | Text)[];
};

type ImmutableNoteCaller = {
  type: "immutable-note-caller";
  caller: string;
  previewText: string;
  version: number;
};

type Char = {
  type: "char";
  marker: string;
  text: string;
  detail: number;
  format: number;
  mode: string;
  style: string;
  version: number;
};

type Text = {
  type: "text";
  text: string;
  detail: number;
  format: number;
  mode: string;
  style: string;
  version: number;
};

export type Footnote = {
  children: Note[];
};

export const emptyFootnote: Footnote = {
  children: [
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
          caller: "b",
          previewText: "",
          version: 1,
        },
        {
          type: "char",
          marker: "ft",
          text: "The Hebrew text can be read either as",
          detail: 0,
          format: 0,
          mode: "normal",
          style: "display: none",
          version: 1,
        },
        {
          type: "char",
          marker: "fqa",
          text: "established praise",
          detail: 0,
          format: 0,
          mode: "normal",
          style: "display: none",
          version: 1,
        },
        {
          type: "text",
          text: "or",
          detail: 0,
          format: 0,
          mode: "normal",
          style: "display: none",
          version: 1,
        },
        {
          type: "char",
          marker: "fqa",
          text: "established strength IIIII",
          detail: 0,
          format: 0,
          mode: "normal",
          style: "display: none",
          version: 1,
        },
        {
          type: "text",
          text: ".",
          detail: 0,
          format: 0,
          mode: "normal",
          style: "display: none",
          version: 1,
        },
      ],
    },
  ],
};

// export const emptyFootnote = {
//   children: [
//     {
//       type: "note",
//       marker: "f",
//       caller: "+",
//       direction: null,
//       format: "",
//       indent: 0,
//       version: 1,
//       children: [
//         {
//           type: "immutable-note-caller",
//           caller: "b",
//           previewText: "",
//           version: 1,
//         },
//         {
//           type: "char",
//           marker: "ft",
//           text: "The Hebrew text can be read either as",
//           detail: 0,
//           format: 0,
//           mode: "normal",
//           style: "display: none",
//           version: 1,
//         },
//         {
//           type: "char",
//           marker: "fqa",
//           text: "established praise",
//           detail: 0,
//           format: 0,
//           mode: "normal",
//           style: "display: none",
//           version: 1,
//         },
//         {
//           type: "text",
//           text: "or",
//           detail: 0,
//           format: 0,
//           mode: "normal",
//           style: "display: none",
//           version: 1,
//         },
//         {
//           type: "char",
//           marker: "fqa",
//           text: "established strength IIIII",
//           detail: 0,
//           format: 0,
//           mode: "normal",
//           style: "display: none",
//           version: 1,
//         },
//         {
//           type: "text",
//           text: ".",
//           detail: 0,
//           format: 0,
//           mode: "normal",
//           style: "display: none",
//           version: 1,
//         },
//       ],
//     },
//   ],
// };

// export const emptyCrossRefence = {
//   children: [
//     {
//       direction: null,
//       format: "",
//       indent: 0,
//       type: "note",
//       version: 1,
//       marker: "f",
//       caller: "+",
//       children: [
//         {
//           type: "immutable-note-caller",
//           caller: "a",
//           previewText:
//             "The Hebrew text can be read either as established praise established strength",
//           version: 1,
//         },
//         {
//           detail: 0,
//           format: 0,
//           mode: "normal",
//           style: "display: none",
//           text: "The Hebrew text can be read either as",
//           type: "char",
//           version: 1,
//           marker: "ft",
//         },
//         {
//           detail: 0,
//           format: 0,
//           mode: "normal",
//           style: "display: none",
//           text: "established praise",
//           type: "char",
//           version: 1,
//           marker: "fqa",
//         },
//         {
//           detail: 0,
//           format: 0,
//           mode: "normal",
//           style: "display: none",
//           text: "or",
//           type: "text",
//           version: 1,
//         },
//         {
//           detail: 0,
//           format: 0,
//           mode: "normal",
//           style: "display: none",
//           text: "established strength",
//           type: "char",
//           version: 1,
//           marker: "fqa",
//         },
//         {
//           detail: 0,
//           format: 0,
//           mode: "normal",
//           style: "display: none",
//           text: ".",
//           type: "text",
//           version: 1,
//         },
//       ],
//     },
//   ],
// };
