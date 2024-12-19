/** Conforms with USJ v3.1 @see https://docs.usfm.bible/usfm/3.1/para/index.html */

import {
  $applyNodeReplacement,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  ParagraphNode,
  RangeSelection,
  SerializedLexicalNode,
  SerializedParagraphNode,
  Spread,
  isHTMLElement,
} from "lexical";
import { UnknownAttributes } from "./node-constants";
import {
  extractNonNumberedMarkers,
  extractNumberedMarkers,
  isValidNumberedMarker,
} from "./node.utils";

export const PARA_MARKER_DEFAULT = "p";

/** @see https://docs.usfm.bible/usfm/3.1/para/index.html */
const VALID_PARA_MARKERS = [
  // Identification
  "ide",
  "sts",
  "rem",
  "h",
  "toc1",
  "toc2",
  "toc3",
  "toca1",
  "toca2",
  "toca3",
  // Introductions
  "imt",
  "imt1",
  "imt2",
  "imt3",
  "imt4",
  "is",
  "is1",
  "is2",
  "ip",
  "ipi",
  "im",
  "imi",
  "ipq",
  "imq",
  "ipr",
  "iq",
  "iq1",
  "iq2",
  "iq3",
  "ili",
  "ili1",
  "ili2",
  "ib",
  "iot",
  "io",
  "io1",
  "io2",
  "io3",
  "io4",
  "iex",
  "imte",
  "imte1",
  "imte2",
  "ie",
  // Titles and Headings
  "mt",
  "mt1",
  "mt2",
  "mt3",
  "mt4",
  "mte",
  "mte1",
  "mte2",
  "cl",
  "cd",
  "ms",
  "ms1",
  "ms2",
  "ms3",
  "mr",
  "s",
  "s1",
  "s2",
  "s3",
  "s4",
  "sr",
  "r",
  "d",
  "sp",
  "sd",
  "sd1",
  "sd2",
  "sd3",
  "sd4",
  // Body Paragraphs
  PARA_MARKER_DEFAULT,
  "m",
  "po",
  "cls",
  "pr",
  "pc",
  "pm",
  "pmo",
  "pmc",
  "pmr",
  "pi",
  "pi1",
  "pi2",
  "pi3",
  "mi",
  "lit",
  "nb",
  // Note there is 1 deprecated marker not listed here: "ph#"
  // Poetry
  "q",
  "q1",
  "q2",
  "q3",
  "q4",
  "qr",
  "qc",
  "qa",
  "qm",
  "qm1",
  "qm2",
  "qm3",
  "qd",
  "b",
  // Lists
  "lh",
  "li",
  "li1",
  "li2",
  "li3",
  "li4",
  "lf",
  "lim",
  "lim1",
  "lim2",
  "lim3",
  "lim4",
  // Breaks - see https://docs.usfm.bible/usfm/3.1/char/breaks/pb.html
  "pb",
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

export function isSerializedParaNode(
  node: SerializedLexicalNode | null | undefined,
): node is SerializedParaNode {
  return node?.type === ParaNode.getType();
}
