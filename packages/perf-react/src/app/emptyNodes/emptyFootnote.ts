import UUID from "pure-uuid";
import base64 from "base-64";

export const generateId = () => base64.encode(new UUID(4).toString()).substring(0, 12);

export const emptyFootnote = {
  children: [
    {
      children: [
        {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "+",
                  type: "text",
                  version: 1,
                },
              ],
              direction: null,
              format: "",
              indent: 0,
              type: "usfmparagraph",
              version: 1,
              attributes: {
                "perf-type": "paragraph",
                "perf-subtype": "usfm:f",
                class: "paragraph",
              },
              tag: "span",
            },
          ],
          direction: null,
          format: "",
          indent: 0,
          type: "graft",
          version: 1,
          attributes: {
            "perf-type": "graft",
            "perf-subtype": "note_caller",
            "perf-target": generateId(),
            class: "graft",
          },
          tag: "span",
        },
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text: " ",
              type: "text",
              version: 1,
            },
          ],
          direction: null,
          format: "",
          indent: 0,
          type: "inline",
          version: 1,
          attributes: {
            "perf-type": "wrapper",
            "perf-subtype": "usfm:ft",
            class: "wrapper",
          },
          tag: "span",
        },
      ],
      direction: null,
      format: "",
      indent: 0,
      type: "usfmparagraph",
      version: 1,
      attributes: {
        "perf-type": "paragraph",
        "perf-subtype": "usfm:f",
        class: "paragraph",
      },
      tag: "span",
    },
  ],
  direction: null,
  format: "",
  indent: 0,
  type: "graft",
  version: 1,
  attributes: {
    "perf-type": "graft",
    "perf-subtype": "footnote",
    "perf-target": generateId(),
    class: "graft",
  },
  props: {
    isInline: true,
  },
  tag: "span",
};
