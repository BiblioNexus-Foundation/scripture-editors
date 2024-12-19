import { generateId } from "./utils";

export const emptyHeading = {
  children: [
    {
      children: [
        {
          detail: 0,
          format: 0,
          mode: "normal",
          style: "",
          text: "​",
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
        "data-namespace": "usfm",
        "data-marker": "s",
        "perf-subtype": "usfm:s",
        class: "paragraph",
      },
      tag: "h3",
    },
  ],
  direction: null,
  format: "",
  indent: 0,
  type: "graft",
  version: 1,
  attributes: {
    "perf-type": "graft",
    "perf-subtype": "heading",
    "perf-target": generateId(),
    class: "graft",
  },
  props: {
    isInline: false,
  },
  tag: "div",
};
