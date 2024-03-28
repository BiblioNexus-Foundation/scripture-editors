/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#para */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  ParagraphNode,
  Spread,
  SerializedElementNode,
} from "lexical";
import {
  UnknownAttributes,
  extractNonNumberedMarkers,
  extractNumberedMarkers,
  isValidNumberedMarker,
} from "./node.utils";

export const PARA_MARKER_DEFAULT = "p";

/** @see https://ubsicap.github.io/usx/parastyles.html */
const VALID_PARA_MARKERS = [
  // Identification
  "h",
  "toc1",
  "toc2",
  "toc3",
  "toca1",
  "toca2",
  "toca3",
  // Introductions
  "imt#",
  "is#",
  "ip",
  "ipi",
  "ipq",
  "imq",
  "ipr",
  "iq#",
  "ib",
  "ili#",
  "iot",
  "io#",
  "iex",
  "imte",
  "ie",
  // Titles and Headings
  "mt#",
  "mte",
  "cl",
  "cd",
  "ms#",
  "mr",
  "s#",
  "sr",
  "r",
  "d",
  "sp",
  "sd#",
  // Paragraphs
  PARA_MARKER_DEFAULT,
  "m",
  "po",
  "pr",
  "cls",
  "pmo",
  "pm",
  "pmc",
  "pmr",
  "pi#",
  "mi",
  "pc",
  "ph#",
  "lit",
  // Poetry
  "q#",
  "qr",
  "qc",
  "qa",
  "qm#",
  "qd",
  "b",
  // Lists
  "lh",
  "li#",
  "lf",
  "lim#",
  "litl", // TODO remove in USX3.1
] as const;

const VALID_PARA_MARKERS_NUMBERED = extractNumberedMarkers(VALID_PARA_MARKERS);
const VALID_PARA_MARKERS_NON_NUMBERED = [
  ...extractNonNumberedMarkers(VALID_PARA_MARKERS),
  // Include the numbered styles, i.e. not ending in a number since pi (= pi1) is valid.
  ...VALID_PARA_MARKERS_NUMBERED,
] as const;

export const PARA_VERSION = 1;

export type SerializedParaNode = Spread<
  {
    marker: ParaMarker;
    classList: string[];
    unknownAttributes?: UnknownAttributes;
  },
  SerializedElementNode
>;

type ParaMarker = string;

export class ParaNode extends ParagraphNode {
  __marker: ParaMarker;
  __classList: string[];
  __unknownAttributes?: UnknownAttributes;

  constructor(
    marker: ParaMarker = PARA_MARKER_DEFAULT,
    classList: string[] = [],
    unknownAttributes?: UnknownAttributes,
    key?: NodeKey,
  ) {
    super(key);
    this.__marker = marker;
    this.__classList = classList;
    this.__unknownAttributes = unknownAttributes;
  }

  static getType(): string {
    return "para";
  }

  static clone(node: ParaNode): ParaNode {
    const { __marker, __classList, __unknownAttributes, __key } = node;
    return new ParaNode(__marker, __classList, __unknownAttributes, __key);
  }

  static importJSON(serializedNode: SerializedParaNode): ParaNode {
    const { marker, classList, unknownAttributes, format, indent, direction } = serializedNode;
    const node = $createParaNode(marker, classList, unknownAttributes);
    node.setFormat(format);
    node.setIndent(indent);
    node.setDirection(direction);
    return node;
  }

  static isValidMarker(marker: string): boolean {
    return (
      VALID_PARA_MARKERS_NON_NUMBERED.includes(marker) ||
      isValidNumberedMarker(marker, VALID_PARA_MARKERS_NUMBERED)
    );
  }

  setMarker(marker: ParaMarker): void {
    const self = this.getWritable();
    self.__marker = marker;
  }

  getMarker(): ParaMarker {
    const self = this.getLatest();
    return self.__marker;
  }

  setClassList(classList: string[]): void {
    const self = this.getWritable();
    self.__classList = classList;
  }

  getClassList(): string[] {
    const self = this.getLatest();
    return self.__classList;
  }

  setUnknownAttributes(unknownAttributes: UnknownAttributes | undefined): void {
    const self = this.getWritable();
    self.__unknownAttributes = unknownAttributes;
  }

  getUnknownAttributes(): UnknownAttributes | undefined {
    const self = this.getLatest();
    return self.__unknownAttributes;
  }

  createDOM(): HTMLElement {
    // Define the DOM element here
    const dom = document.createElement("p");
    dom.setAttribute("data-marker", this.__marker);
    dom.classList.add(this.getType(), `usfm_${this.__marker}`, ...this.__classList);
    return dom;
  }

  updateDOM(): boolean {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }

  exportJSON(): SerializedParaNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      marker: this.getMarker(),
      classList: this.getClassList(),
      unknownAttributes: this.getUnknownAttributes(),
      version: PARA_VERSION,
    };
  }
}

export function $createParaNode(
  marker?: ParaMarker,
  classList?: string[],
  unknownAttributes?: UnknownAttributes,
): ParaNode {
  return $applyNodeReplacement(new ParaNode(marker, classList, unknownAttributes));
}

export function $isParaNode(node: LexicalNode | null | undefined): node is ParaNode {
  return node instanceof ParaNode;
}
