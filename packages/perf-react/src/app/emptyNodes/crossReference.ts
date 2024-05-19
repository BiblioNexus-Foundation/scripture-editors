import UUID from "pure-uuid";
import base64 from "base-64";

export const generateId = () => base64.encode(new UUID(4).toString()).substring(0, 12);

export const emptyCrossRefence = {
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
                "perf-subtype": "usfm:x",
                class: "x",
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
          detail: 0,
          format: 0,
          mode: "normal",
          style: "",
          text: "",
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
              text: "",
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
            "perf-subtype": "usfm:xo",
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
              text: "",
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
            "perf-subtype": "usfm:xt",
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
        "perf-subtype": "usfm:x",
        class: "x",
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
    "perf-subtype": "xref",
    "perf-target": generateId(),
    class: "graft",
  },
  tag: "span",
};
