/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#chapter */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  Spread,
  TextNode,
  SerializedElementNode,
  ElementNode,
  $createTextNode,
} from "lexical";
import { CHAPTER_CLASS_NAME, UnknownAttributes } from "./node.utils";

export const CHAPTER_MARKER = "c";
export const CHAPTER_VERSION = 1;
export type ChapterMarker = typeof CHAPTER_MARKER;

export type SerializedChapterNode = Spread<
  {
    marker: ChapterMarker;
    number: string;
    classList: string[];
    text?: string;
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
  __sid?: string;
  __altnumber?: string;
  __pubnumber?: string;
  __unknownAttributes?: UnknownAttributes;

  constructor(
    chapterNumber: string,
    classList: string[] = [],
    text?: string,
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
    this.__sid = sid;
    this.__altnumber = altnumber;
    this.__pubnumber = pubnumber;
    this.__unknownAttributes = unknownAttributes;
    this.append($createTextNode(text ?? chapterNumber));
  }

  static getType(): string {
    return "chapter";
  }

  static clone(node: ChapterNode): ChapterNode {
    const { __number, __classList, __sid, __altnumber, __pubnumber, __unknownAttributes, __key } =
      node;
    const __text = node.getFirstChild<TextNode>()?.getTextContent();
    return new ChapterNode(
      __number,
      __classList,
      __text,
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
      text,
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
      text,
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
    return dom;
  }

  exportJSON(): SerializedChapterNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      marker: this.getMarker(),
      number: this.getNumber(),
      classList: this.getClassList(),
      text: this.getFirstChild<TextNode>()?.getTextContent(),
      sid: this.getSid(),
      altnumber: this.getAltnumber(),
      pubnumber: this.getPubnumber(),
      unknownAttributes: this.getUnknownAttributes(),
      version: CHAPTER_VERSION,
    };
  }
}

export function $createChapterNode(
  chapterNumber: string,
  classList?: string[],
  text?: string,
  sid?: string,
  altnumber?: string,
  pubnumber?: string,
  unknownAttributes?: UnknownAttributes,
): ChapterNode {
  return $applyNodeReplacement(
    new ChapterNode(chapterNumber, classList, text, sid, altnumber, pubnumber, unknownAttributes),
  );
}

export function $isChapterNode(node: LexicalNode | null | undefined): node is ChapterNode {
  return node instanceof ChapterNode;
}
