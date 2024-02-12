/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#chapter */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  DecoratorNode,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { CHAPTER_CLASS_NAME, getVisibleOpenMarkerText } from "./node.utils";

export const CHAPTER_STYLE = "c";
export const IMMUTABLE_CHAPTER_VERSION = 1;

type ChapterUsxStyle = typeof CHAPTER_STYLE;

export type SerializedImmutableChapterNode = Spread<
  {
    usxStyle: ChapterUsxStyle;
    number: string;
    showMarker?: boolean;
    sid?: string;
    altnumber?: string;
    pubnumber?: string;
  },
  SerializedLexicalNode
>;

export class ImmutableChapterNode extends DecoratorNode<void> {
  __usxStyle: ChapterUsxStyle;
  __number: string;
  __showMarker?: boolean;
  __sid?: string;
  __altnumber?: string;
  __pubnumber?: string;

  constructor(
    chapterNumber: string,
    showMarker = false,
    sid?: string,
    altnumber?: string,
    pubnumber?: string,
    key?: NodeKey,
  ) {
    super(key);
    this.__usxStyle = CHAPTER_STYLE;
    this.__number = chapterNumber;
    this.__showMarker = showMarker;
    this.__sid = sid;
    this.__altnumber = altnumber;
    this.__pubnumber = pubnumber;
  }

  static getType(): string {
    return "immutable-chapter";
  }

  static clone(node: ImmutableChapterNode): ImmutableChapterNode {
    const { __number, __showMarker, __sid, __altnumber, __pubnumber, __key } = node;
    return new ImmutableChapterNode(__number, __showMarker, __sid, __altnumber, __pubnumber, __key);
  }

  static importJSON(serializedNode: SerializedImmutableChapterNode): ImmutableChapterNode {
    const { number, showMarker, sid, altnumber, pubnumber, usxStyle } = serializedNode;
    const node = $createImmutableChapterNode(number, showMarker, sid, altnumber, pubnumber);
    node.setUsxStyle(usxStyle);
    return node;
  }

  setUsxStyle(usxStyle: ChapterUsxStyle): void {
    const self = this.getWritable();
    self.__usxStyle = usxStyle;
  }

  getUsxStyle(): ChapterUsxStyle {
    const self = this.getLatest();
    return self.__usxStyle;
  }

  setNumber(chapterNumber: string): void {
    const self = this.getWritable();
    self.__number = chapterNumber;
  }

  getNumber(): string {
    const self = this.getLatest();
    return self.__number;
  }

  setShowMarker(showMarker = false): void {
    const self = this.getWritable();
    self.__showMarker = showMarker;
  }

  getShowMarker(): boolean | undefined {
    const self = this.getLatest();
    return self.__showMarker;
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

  createDOM(): HTMLElement {
    const dom = document.createElement("span");
    dom.setAttribute("data-usx-style", this.__usxStyle);
    dom.classList.add(CHAPTER_CLASS_NAME, `usfm_${this.__usxStyle}`);
    dom.setAttribute("data-number", this.__number);
    return dom;
  }

  updateDOM(): boolean {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }

  decorate(): string {
    return this.getShowMarker()
      ? getVisibleOpenMarkerText(this.getUsxStyle(), this.getNumber())
      : this.getNumber();
  }

  exportJSON(): SerializedImmutableChapterNode {
    return {
      type: this.getType(),
      usxStyle: this.getUsxStyle(),
      number: this.getNumber(),
      showMarker: this.getShowMarker(),
      sid: this.getSid(),
      altnumber: this.getAltnumber(),
      pubnumber: this.getPubnumber(),
      version: IMMUTABLE_CHAPTER_VERSION,
    };
  }
}

export function $createImmutableChapterNode(
  chapterNumber: string,
  showMarker?: boolean,
  sid?: string,
  altnumber?: string,
  pubnumber?: string,
): ImmutableChapterNode {
  return $applyNodeReplacement(
    new ImmutableChapterNode(chapterNumber, showMarker, sid, altnumber, pubnumber),
  );
}

export function $isImmutableChapterNode(
  node: LexicalNode | null | undefined,
): node is ImmutableChapterNode {
  return node instanceof ImmutableChapterNode;
}
