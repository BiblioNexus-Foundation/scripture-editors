/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#para */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  ParagraphNode,
  Spread,
  SerializedParagraphNode,
  RangeSelection,
  DOMConversionMap,
  DOMConversionOutput,
  ElementFormatType,
  LexicalEditor,
  DOMExportOutput,
  isHTMLElement,
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
    unknownAttributes?: UnknownAttributes;
  },
  SerializedParagraphNode
>;

type ParaMarker = string;

export class ParaNode extends ParagraphNode {
  __marker: ParaMarker;
  __unknownAttributes?: UnknownAttributes;

  constructor(
    marker: ParaMarker = PARA_MARKER_DEFAULT,
    unknownAttributes?: UnknownAttributes,
    key?: NodeKey,
  ) {
    super(key);
    this.__marker = marker;
    this.__unknownAttributes = unknownAttributes;
  }

  static getType(): string {
    return "para";
  }

  static clone(node: ParaNode): ParaNode {
    const { __marker, __unknownAttributes, __key } = node;
    return new ParaNode(__marker, __unknownAttributes, __key);
  }

  static importJSON(serializedNode: SerializedParaNode): ParaNode {
    const { marker, unknownAttributes, format, indent, direction, textFormat, textStyle } =
      serializedNode;
    const node = $createParaNode(marker, unknownAttributes);
    node.setFormat(format);
    node.setIndent(indent);
    node.setDirection(direction);
    node.setTextFormat(textFormat);
    node.setTextStyle(textStyle);
    return node;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      p: () => ({
        conversion: $convertParaElement,
        priority: 1,
      }),
    };
  }

  static isValidMarker(marker: string | undefined): boolean {
    return (
      (marker && VALID_PARA_MARKERS_NON_NUMBERED.includes(marker)) ||
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

  exportJSON(): SerializedParaNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      marker: this.getMarker(),
      unknownAttributes: this.getUnknownAttributes(),
      version: PARA_VERSION,
    };
  }

  // Mutation

  insertNewAfter(rangeSelection: RangeSelection, restoreSelection: boolean): ParagraphNode {
    const newElement = $createParaNode(this.getMarker());
    newElement.setTextFormat(rangeSelection.format);
    newElement.setTextStyle(rangeSelection.style);
    newElement.setDirection(this.getDirection());
    newElement.setFormat(this.getFormatType());
    newElement.setStyle(this.getTextStyle());
    newElement.setIndent(this.getIndent());
    this.insertAfter(newElement, restoreSelection);
    return newElement;
  }
}

function $convertParaElement(element: HTMLElement): DOMConversionOutput {
  const marker = element.getAttribute("data-marker") ?? undefined;
  const node = $createParaNode(marker);
  if (element.style) {
    node.setFormat(element.style.textAlign as ElementFormatType);
    const indent = parseInt(element.style.textIndent, 10) / 20;
    if (indent > 0) {
      node.setIndent(indent);
    }
  }
  return { node };
}

export function $createParaNode(
  marker?: ParaMarker,
  unknownAttributes?: UnknownAttributes,
): ParaNode {
  return $applyNodeReplacement(new ParaNode(marker, unknownAttributes));
}

export function $isParaNode(node: LexicalNode | null | undefined): node is ParaNode {
  return node instanceof ParaNode;
}
