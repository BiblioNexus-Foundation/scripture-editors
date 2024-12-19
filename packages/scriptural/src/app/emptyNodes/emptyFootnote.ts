import { generateId } from "./utils";

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
              type: "inline",
              version: 1,
              attributes: {
                "perf-type": "paragraph",
                "data-namespace": "usfm",
                "data-marker": "f",
                "perf-subtype": "usfm:f",
                "data-caller": "+",
                class: "f",
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
          props: {
            isInline: true,
          },
          tag: "span",
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
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text: "1:1 ",
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
            "data-namespace": "usfm",
            "data-marker": "fr",
            "perf-subtype": "usfm:fr",
            class: "wrapper",
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
            "data-namespace": "usfm",
            "data-marker": "ft",
            "perf-subtype": "usfm:ft",
            class: "wrapper",
          },
          tag: "span",
        },
      ],
      direction: null,
      format: "",
      indent: 0,
      type: "inline",
      version: 1,
      attributes: {
        "perf-type": "paragraph",
        "data-namespace": "usfm",
        "data-marker": "f",
        "perf-subtype": "usfm:f",
        class: "f",
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
