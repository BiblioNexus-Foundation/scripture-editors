import { SerializedTextNode } from "lexical";
import { SerializedUsfmElementNode } from "shared/nodes/UsfmElementNode";

export const createEmptyDivisionMark = (
  type: "verses" | "chapter",
  number: string | number = 1,
): SerializedUsfmElementNode => ({
  children: [
    {
      detail: 0,
      format: 0,
      mode: "normal",
      style: "",
      text: number,
      type: "text",
      version: 1,
    } as SerializedTextNode,
  ],
  direction: null,
  format: "",
  indent: 0,
  type: "divisionmark",
  version: 1,
  attributes: {
    "perf-atts-number": number.toString(),
    "perf-type": "mark",
    "perf-subtype": type,
    class: type,
  },
  tag: "span",
});
