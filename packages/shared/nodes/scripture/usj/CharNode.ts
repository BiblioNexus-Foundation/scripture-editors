/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#char */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  TextNode,
  SerializedTextNode,
  Spread,
  EditorConfig,
} from "lexical";
import {
  CHAR_NODE_TYPE,
  PLAIN_FONT_CLASS_NAME,
  UnknownAttributes,
  extractNonNumberedMarkers,
  extractNumberedMarkers,
  isValidNumberedMarker,
} from "./node.utils";

const VALID_CHAR_FOOTNOTE_MARKERS = ["fr", "ft", "fk", "fq", "fqa", "fl", "fw", "fp", "fv", "fdc"];
const VALID_CHAR_CROSS_REFERENCE_MARKERS = [
  "xo",
  "xop",
  "xt",
  "xta",
  "xk",
  "xq",
  "xot",
  "xnt",
  "xdc",
];
/**
 * @see https://ubsicap.github.io/usx/charstyles.html
 * @see https://ubsicap.github.io/usx/notes.html
 */
const VALID_CHAR_MARKERS = [
  // Special Text
  "add",
  "bk",
  "dc",
  "ior",
  "iqt",
  "k",
  "litl",
  "nd",
  "ord",
  "pn",
  "png",
  "qac",
  "qs",
  "qt",
  "rq",
  "sig",
  "sls",
  "tl",
  "wj",
  // Character Styling
  "em",
  "bd",
  "bdit",
  "it",
  "no",
  "sc",
  "sup",
  // Special Features
  "rb",
  "pro",
  "w",
  "wg",
  "wh",
  "wa",
  // Structured List Entries
  "lik",
  "liv#",
  // Linking
  "jmp",

  ...VALID_CHAR_FOOTNOTE_MARKERS,
  ...VALID_CHAR_CROSS_REFERENCE_MARKERS,
] as const;

const VALID_CHAR_MARKERS_NUMBERED = extractNumberedMarkers(VALID_CHAR_MARKERS);
const VALID_CHAR_MARKERS_NON_NUMBERED = [
  ...extractNonNumberedMarkers(VALID_CHAR_MARKERS),
  // Include the numbered markers, i.e. not ending in a number since pi (= pi1) is valid.
  ...VALID_CHAR_MARKERS_NUMBERED,
] as const;

export const CHAR_VERSION = 1;

export type SerializedCharNode = Spread<
  {
    marker: CharMarker;
    unknownAttributes?: UnknownAttributes;
  },
  SerializedTextNode
>;

type CharMarker = string;

export class CharNode extends TextNode {
  __marker: CharMarker;
  __unknownAttributes?: UnknownAttributes;

  constructor(
    marker: CharMarker,
    text: string,
    unknownAttributes?: UnknownAttributes,
    key?: NodeKey,
  ) {
    super(text, key);
    this.__marker = marker;
    this.__unknownAttributes = unknownAttributes;
  }

  static getType(): string {
    return CHAR_NODE_TYPE;
  }

  static clone(node: CharNode): CharNode {
    const { __marker, __text, __unknownAttributes, __key } = node;
    return new CharNode(__marker, __text, __unknownAttributes, __key);
  }

  static importJSON(serializedNode: SerializedCharNode): CharNode {
    const { marker, text, unknownAttributes, detail, format, mode, style } = serializedNode;
    const node = $createCharNode(marker, text, unknownAttributes);
    node.setDetail(detail);
    node.setFormat(format);
    node.setMode(mode);
    node.setStyle(style);
    return node;
  }

  static isValidMarker(marker: string): boolean {
    return (
      VALID_CHAR_MARKERS_NON_NUMBERED.includes(marker) ||
      isValidNumberedMarker(marker, VALID_CHAR_MARKERS_NUMBERED)
    );
  }

  static isValidFootnoteMarker(marker: string): boolean {
    return VALID_CHAR_FOOTNOTE_MARKERS.includes(marker);
  }

  static isValidCrossReferenceMarker(marker: string): boolean {
    return VALID_CHAR_CROSS_REFERENCE_MARKERS.includes(marker);
  }

  setMarker(marker: CharMarker): void {
    const self = this.getWritable();
    self.__marker = marker;
  }

  getMarker(): CharMarker {
    const self = this.getLatest();
    return self.__marker;
  }

  setUnknownAttributes(unknownAttributes: UnknownAttributes | undefined): void {
    const self = this.getWritable();
    self.__unknownAttributes = unknownAttributes;
  }

  getUnknownAttributes(): UnknownAttributes | undefined {
    const self = this.getLatest();
    return self.__unknownAttributes;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.setAttribute("data-marker", this.__marker);
    dom.classList.add(this.getType(), `usfm_${this.__marker}`);
    if (
      CharNode.isValidFootnoteMarker(this.__marker) ||
      CharNode.isValidCrossReferenceMarker(this.__marker)
    )
      dom.classList.add(PLAIN_FONT_CLASS_NAME);
    return dom;
  }

  exportJSON(): SerializedCharNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      marker: this.getMarker(),
      unknownAttributes: this.getUnknownAttributes(),
      version: CHAR_VERSION,
    };
  }

  isTextEntity(): true {
    return true;
  }
}

export function $createCharNode(
  marker: CharMarker,
  text: string,
  unknownAttributes?: UnknownAttributes,
): CharNode {
  return $applyNodeReplacement(new CharNode(marker, text, unknownAttributes));
}

export function $isCharNode(node: LexicalNode | null | undefined): node is CharNode {
  return node instanceof CharNode;
}
