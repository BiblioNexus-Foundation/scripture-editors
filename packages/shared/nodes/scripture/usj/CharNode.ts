/** Conforms with USJ v3.1 @see https://docs.usfm.bible/usfm/3.1/char/index.html */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  TextNode,
  SerializedTextNode,
  Spread,
  EditorConfig,
  DOMExportOutput,
  LexicalEditor,
  isHTMLElement,
  DOMConversionMap,
  DOMConversionOutput,
} from "lexical";
import {
  CHAR_NODE_TYPE,
  UnknownAttributes,
  extractNonNumberedMarkers,
  extractNumberedMarkers,
  isValidNumberedMarker,
} from "./node.utils";

/** @see https://docs.usfm.bible/usfm/3.1/char/notes/footnote/index.html */
const VALID_CHAR_FOOTNOTE_MARKERS = [
  "fr",
  "fq",
  "fqa",
  "fk",
  "ft",
  "fl",
  "fw",
  "fp",
  "fv",
  "fdc",
  "fm",
];
/** @see https://docs.usfm.bible/usfm/3.1/char/notes/crossref/index.html */
const VALID_CHAR_CROSS_REFERENCE_MARKERS = [
  "xo",
  "xop",
  "xk",
  "xq",
  "xt",
  "xta",
  "xot",
  "xnt",
  "xdc",
];
/** @see https://docs.usfm.bible/usfm/3.1/char/index.html */
const VALID_CHAR_MARKERS = [
  // Chapter & Verse
  "ca",
  "cp",
  "va",
  "vp",

  // Text Features
  "add",
  "bk",
  "dc",
  "em",
  "jmp",
  "k",
  "nd",
  "ord",
  "pn",
  "png",
  "qt",
  "rb",
  "rq",
  // "ref", // This has its own tag and is not a Char
  "sig",
  "sls",
  "tl",
  "w",
  "wa",
  "wg",
  "wh",
  "wj",
  // Note there are 2 deprecated markers intentionally not listed here: "addpn", "pro"

  // Text Formatting
  "bd",
  "it",
  "bdit",
  "no",
  "sc",
  "sup",

  // Introductions
  "ior",
  "iqt",

  // Poetry
  "qac",
  "qs",

  // Lists
  "litl",
  "lik",
  "liv",
  "liv1",
  "liv2",
  "liv3",
  "liv4",
  "liv5",

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

  static importDOM(): DOMConversionMap | null {
    return {
      span: (node: HTMLElement) => {
        if (!isCharElement(node)) return null;

        return {
          conversion: $convertCharElement,
          priority: 1,
        };
      },
    };
  }

  static isValidMarker(marker: string | undefined): boolean {
    return (
      (marker && VALID_CHAR_MARKERS_NON_NUMBERED.includes(marker)) ||
      isValidNumberedMarker(marker, VALID_CHAR_MARKERS_NUMBERED)
    );
  }

  static isValidFootnoteMarker(marker: string | undefined): boolean {
    return !!marker && VALID_CHAR_FOOTNOTE_MARKERS.includes(marker);
  }

  static isValidCrossReferenceMarker(marker: string | undefined): boolean {
    return !!marker && VALID_CHAR_CROSS_REFERENCE_MARKERS.includes(marker);
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
    dom.classList.add(this.__type, `usfm_${this.__marker}`);
    return dom;
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const { element } = super.exportDOM(editor);
    if (element && isHTMLElement(element)) {
      element.setAttribute("data-marker", this.getMarker());
      element.classList.add(this.getType(), `usfm_${this.getMarker()}`);
    }

    return { element };
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

function $convertCharElement(element: HTMLElement): DOMConversionOutput {
  const marker = (element.getAttribute("data-marker") as CharMarker) ?? "f";
  const text = element.textContent ?? "";
  const node = $createCharNode(marker, text);
  node.setStyle(element.getAttribute("style") ?? "");
  return { node };
}

export function $createCharNode(
  marker: CharMarker,
  text: string,
  unknownAttributes?: UnknownAttributes,
): CharNode {
  return $applyNodeReplacement(new CharNode(marker, text, unknownAttributes));
}

function isCharElement(node: HTMLElement | null | undefined): boolean {
  if (!node) return false;

  const marker = node.getAttribute("data-marker") ?? "";
  return CharNode.isValidMarker(marker) && node.classList.contains(CharNode.getType());
}

export function $isCharNode(node: LexicalNode | null | undefined): node is CharNode {
  return node instanceof CharNode;
}
