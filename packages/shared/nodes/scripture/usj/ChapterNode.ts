/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#chapter */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  Spread,
  SerializedElementNode,
  ElementNode,
  DOMConversionMap,
  DOMExportOutput,
  isHTMLElement,
  LexicalEditor,
  RangeSelection,
  DOMConversionOutput,
  ElementFormatType,
} from "lexical";
import { CHAPTER_CLASS_NAME, parseNumberFromMarkerText, UnknownAttributes } from "./node.utils";

export const CHAPTER_MARKER = "c";
export const CHAPTER_VERSION = 1;
export type ChapterMarker = typeof CHAPTER_MARKER;

export type SerializedChapterNode = Spread<
  {
    marker: ChapterMarker;
    number: string;
    classList: string[];
    isEditable?: boolean;
    sid?: string;
    altnumber?: string;
    pubnumber?: string;
    unknownAttributes?: UnknownAttributes;
  },
  SerializedElementNode
>;

export class ChapterNode extends ElementNode {
  __marker: ChapterMarker;
  __number: string;
  __classList: string[];
  __isEditable: boolean;
  __sid?: string;
  __altnumber?: string;
  __pubnumber?: string;
  __unknownAttributes?: UnknownAttributes;

  constructor(
    chapterNumber: string,
    classList: string[] = [],
    isEditable = false,
    sid?: string,
    altnumber?: string,
    pubnumber?: string,
    unknownAttributes?: UnknownAttributes,
    key?: NodeKey,
  ) {
    super(key);
    this.__marker = CHAPTER_MARKER;
    this.__number = chapterNumber;
    this.__classList = classList;
    this.__isEditable = isEditable;
    this.__sid = sid;
    this.__altnumber = altnumber;
    this.__pubnumber = pubnumber;
    this.__unknownAttributes = unknownAttributes;
  }

  static getType(): string {
    return "chapter";
  }

  static clone(node: ChapterNode): ChapterNode {
    const {
      __number,
      __classList,
      __isEditable,
      __sid,
      __altnumber,
      __pubnumber,
      __unknownAttributes,
      __key,
    } = node;
    return new ChapterNode(
      __number,
      __classList,
      __isEditable,
      __sid,
      __altnumber,
      __pubnumber,
      __unknownAttributes,
      __key,
    );
  }

  static importJSON(serializedNode: SerializedChapterNode): ChapterNode {
    const {
      marker,
      number,
      classList,
      isEditable,
      sid,
      altnumber,
      pubnumber,
      unknownAttributes,
      format,
      indent,
      direction,
    } = serializedNode;
    const node = $createChapterNode(
      number,
      classList,
      isEditable,
      sid,
      altnumber,
      pubnumber,
      unknownAttributes,
    );
    node.setMarker(marker);
    node.setFormat(format);
    node.setIndent(indent);
    node.setDirection(direction);
    return node;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      p: (node: HTMLElement) => {
        if (!isChapterElement(node)) return null;

        return {
          conversion: $convertChapterElement,
          priority: 1,
        };
      },
    };
  }

  setMarker(marker: ChapterMarker): void {
    const self = this.getWritable();
    self.__marker = marker;
  }

  getMarker(): ChapterMarker {
    const self = this.getLatest();
    return self.__marker;
  }

  setNumber(chapterNumber: string): void {
    const self = this.getWritable();
    self.__number = chapterNumber;
  }

  getNumber(): string {
    const self = this.getLatest();
    return self.__number;
  }

  setClassList(classList: string[]): void {
    const self = this.getWritable();
    self.__classList = classList;
  }

  getClassList(): string[] {
    const self = this.getLatest();
    return self.__classList;
  }

  setIsEditable(isEditable: boolean): void {
    const self = this.getWritable();
    self.__isEditable = isEditable;
  }

  getIsEditable(): boolean {
    const self = this.getLatest();
    return self.__isEditable;
  }

  setSid(sid: string | undefined): void {
    const self = this.getWritable();
    self.__sid = sid;
  }

  getSid(): string | undefined {
    const self = this.getLatest();
    return self.__sid;
  }

  setAltnumber(altnumber: string | undefined): void {
    const self = this.getWritable();
    self.__altnumber = altnumber;
  }

  getAltnumber(): string | undefined {
    const self = this.getLatest();
    return self.__altnumber;
  }

  setPubnumber(pubnumber: string | undefined): void {
    const self = this.getWritable();
    self.__pubnumber = pubnumber;
  }

  getPubnumber(): string | undefined {
    const self = this.getLatest();
    return self.__pubnumber;
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
    const dom = document.createElement("p");
    dom.setAttribute("data-marker", this.__marker);
    dom.classList.add(CHAPTER_CLASS_NAME, `usfm_${this.__marker}`, ...this.__classList);
    dom.setAttribute("data-number", this.__number);
    if (!this.__isEditable) dom.setAttribute("contenteditable", "false");
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
      element.classList.add(CHAPTER_CLASS_NAME, `usfm_${this.getMarker()}`, ...this.getClassList());
      element.setAttribute("data-number", this.getNumber());
      if (!this.getIsEditable()) element.setAttribute("contenteditable", "false");
    }

    return { element };
  }

  exportJSON(): SerializedChapterNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      marker: this.getMarker(),
      number: this.getNumber(),
      classList: this.getClassList(),
      isEditable: this.getIsEditable(),
      sid: this.getSid(),
      altnumber: this.getAltnumber(),
      pubnumber: this.getPubnumber(),
      unknownAttributes: this.getUnknownAttributes(),
      version: CHAPTER_VERSION,
    };
  }

  // Mutation

  insertNewAfter(_rangeSelection: RangeSelection, restoreSelection: boolean): ChapterNode {
    const newElement = $createChapterNode(
      this.getNumber(),
      this.getClassList(),
      this.getIsEditable(),
      this.getSid(),
      this.getAltnumber(),
      this.getPubnumber(),
    );
    newElement.setFormat(this.getFormatType());
    newElement.setIndent(this.getIndent());
    newElement.setDirection(this.getDirection());
    this.insertAfter(newElement, restoreSelection);
    return newElement;
  }
}

function $convertChapterElement(element: HTMLElement): DOMConversionOutput {
  const marker = element.getAttribute("data-marker") ?? "";
  const defaultNumber = element.getAttribute("data-number") ?? "";
  const text = element.textContent ?? "";
  const number = parseNumberFromMarkerText(marker, text, defaultNumber);
  const domNode = element.cloneNode(false) as HTMLElement;
  domNode.classList.remove(CHAPTER_CLASS_NAME, `usfm_${marker}`, "ltr", "rtl");
  const classList = [...domNode.classList.values()];
  const isEditable = element.getAttribute("contenteditable") !== "false";
  const node = $createChapterNode(number, classList, isEditable);
  if (element.style) {
    node.setFormat(element.style.textAlign as ElementFormatType);
    const indent = parseInt(element.style.textIndent, 10) / 20;
    if (indent > 0) {
      node.setIndent(indent);
    }
  }
  return { node };
}

export function $createChapterNode(
  chapterNumber: string,
  classList?: string[],
  isEditable?: boolean,
  sid?: string,
  altnumber?: string,
  pubnumber?: string,
  unknownAttributes?: UnknownAttributes,
): ChapterNode {
  return $applyNodeReplacement(
    new ChapterNode(
      chapterNumber,
      classList,
      isEditable,
      sid,
      altnumber,
      pubnumber,
      unknownAttributes,
    ),
  );
}

function isChapterElement(node: HTMLElement | null | undefined): boolean {
  if (!node) return false;

  return node.classList.contains(CHAPTER_CLASS_NAME);
}

export function $isChapterNode(node: LexicalNode | null | undefined): node is ChapterNode {
  return node instanceof ChapterNode;
}
