/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#verse */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  EditorConfig,
  SerializedTextNode,
  Spread,
  TextNode,
} from "lexical";
import { VERSE_CLASS_NAME } from "./node.utils";

export const VERSE_ELEMENT_NAME = "verse";

export const VERSE_STYLE = "v";
export const VERSE_VERSION = 1;

type VerseUsxStyle = typeof VERSE_STYLE;

export type SerializedVerseNode = Spread<
  {
    usxStyle: VerseUsxStyle;
    number: string;
    classList: string[];
    sid?: string;
    altnumber?: string;
    pubnumber?: string;
  },
  SerializedTextNode
>;

export class VerseNode extends TextNode {
  __usxStyle: VerseUsxStyle;
  __number: string;
  __classList: string[];
  __sid?: string;
  __altnumber?: string;
  __pubnumber?: string;

  constructor(
    verseNumber: string,
    classList: string[] = [],
    text?: string,
    sid?: string,
    altnumber?: string,
    pubnumber?: string,
    key?: NodeKey,
  ) {
    super(text ?? verseNumber, key);
    this.__usxStyle = VERSE_STYLE;
    this.__number = verseNumber;
    this.__classList = classList;
    this.__sid = sid;
    this.__altnumber = altnumber;
    this.__pubnumber = pubnumber;
  }

  static getType(): string {
    return "verse";
  }

  static clone(node: VerseNode): VerseNode {
    const { __number, __classList, __text, __sid, __altnumber, __pubnumber, __key } = node;
    return new VerseNode(__number, __classList, __text, __sid, __altnumber, __pubnumber, __key);
  }

  static importJSON(serializedNode: SerializedVerseNode): VerseNode {
    const {
      number,
      classList,
      text,
      sid,
      altnumber,
      pubnumber,
      detail,
      format,
      mode,
      style,
      usxStyle,
    } = serializedNode;
    const node = $createVerseNode(number, classList, text, sid, altnumber, pubnumber);
    node.setDetail(detail);
    node.setFormat(format);
    node.setMode(mode);
    node.setStyle(style);
    node.setUsxStyle(usxStyle);
    return node;
  }

  setUsxStyle(usxStyle: VerseUsxStyle): void {
    const self = this.getWritable();
    self.__usxStyle = usxStyle;
  }

  getUsxStyle(): VerseUsxStyle {
    const self = this.getLatest();
    return self.__usxStyle;
  }

  setNumber(verseNumber: string): void {
    const self = this.getWritable();
    self.__number = verseNumber;
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

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.setAttribute("data-usx-style", this.__usxStyle);
    dom.classList.add(VERSE_CLASS_NAME, `usfm_${this.__usxStyle}`, ...this.__classList);
    dom.setAttribute("data-number", this.__number);
    return dom;
  }

  exportJSON(): SerializedVerseNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      usxStyle: this.getUsxStyle(),
      number: this.getNumber(),
      classList: this.getClassList(),
      sid: this.getSid(),
      altnumber: this.getAltnumber(),
      pubnumber: this.getPubnumber(),
      version: VERSE_VERSION,
    };
  }
}

export function $createVerseNode(
  verseNumber: string,
  classList?: string[],
  text?: string,
  sid?: string,
  altnumber?: string,
  pubnumber?: string,
): VerseNode {
  return $applyNodeReplacement(
    new VerseNode(verseNumber, classList, text, sid, altnumber, pubnumber),
  );
}

export function $isVerseNode(node: LexicalNode | null | undefined): node is VerseNode {
  return node instanceof VerseNode;
}
