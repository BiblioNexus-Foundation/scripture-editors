/** Conforms with USJ v3.1 @see https://docs.usfm.bible/usfm/3.1/char/index.html */

import {
  $applyNodeReplacement,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  SerializedLexicalNode,
  Spread,
  isHTMLElement,
} from "lexical";
import { UnknownAttributes } from "./node-constants";

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

export const CHAR_VERSION = 1;

export type SerializedCharNode = Spread<
  {
    marker: string;
    unknownAttributes?: UnknownAttributes;
  },
  SerializedElementNode
>;

export class CharNode extends ElementNode {
  __marker: string;
  __unknownAttributes?: UnknownAttributes;

  constructor(marker: string, unknownAttributes?: UnknownAttributes, key?: NodeKey) {
    super(key);
    this.__marker = marker;
    this.__unknownAttributes = unknownAttributes;
  }

  static getType(): string {
    return "char";
  }

  static clone(node: CharNode): CharNode {
    const { __marker, __unknownAttributes, __key } = node;
    return new CharNode(__marker, __unknownAttributes, __key);
  }

  static importJSON(serializedNode: SerializedCharNode): CharNode {
    const { marker, unknownAttributes } = serializedNode;
    return $createCharNode(marker, unknownAttributes).updateFromJSON(serializedNode);
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
    return marker !== undefined && VALID_CHAR_MARKERS.includes(marker);
  }

  static isValidFootnoteMarker(marker: string | undefined): boolean {
    return marker !== undefined && VALID_CHAR_FOOTNOTE_MARKERS.includes(marker);
  }

  static isValidCrossReferenceMarker(marker: string | undefined): boolean {
    return marker !== undefined && VALID_CHAR_CROSS_REFERENCE_MARKERS.includes(marker);
  }

  setMarker(marker: string): this {
    if (this.__marker === marker) return this;

    const self = this.getWritable();
    self.__marker = marker;
    return self;
  }

  getMarker(): string {
    const self = this.getLatest();
    return self.__marker;
  }

  setUnknownAttributes(unknownAttributes: UnknownAttributes | undefined): this {
    const self = this.getWritable();
    self.__unknownAttributes = unknownAttributes;
    return self;
  }

  getUnknownAttributes(): UnknownAttributes | undefined {
    const self = this.getLatest();
    return self.__unknownAttributes;
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("span");
    dom.setAttribute("data-marker", this.__marker);
    dom.classList.add(this.__type, `usfm_${this.__marker}`);
    return dom;
  }

  updateDOM(): boolean {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
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

  // Mutation

  canBeEmpty(): false {
    return false;
  }

  isInline(): true {
    return true;
  }
}

function $convertCharElement(element: HTMLElement): DOMConversionOutput {
  const marker = element.getAttribute("data-marker") ?? "f";
  const node = $createCharNode(marker);
  return { node };
}

export function $createCharNode(marker: string, unknownAttributes?: UnknownAttributes): CharNode {
  return $applyNodeReplacement(new CharNode(marker, unknownAttributes));
}

function isCharElement(node: HTMLElement | null | undefined): boolean {
  if (!node) return false;

  const marker = node.getAttribute("data-marker") ?? "";
  return CharNode.isValidMarker(marker) && node.classList.contains(CharNode.getType());
}

export function $isCharNode(node: LexicalNode | null | undefined): node is CharNode {
  return node instanceof CharNode;
}

export function isSerializedCharNode(
  node: SerializedLexicalNode | null | undefined,
): node is SerializedCharNode {
  return node?.type === CharNode.getType();
}
