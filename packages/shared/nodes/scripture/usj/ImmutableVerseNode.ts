/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#verse */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  DecoratorNode,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { VERSE_CLASS_NAME, getVisibleOpenMarkerText } from "./node.utils";

export const VERSE_MARKER = "v";
export const IMMUTABLE_VERSE_VERSION = 1;

type VerseMarker = typeof VERSE_MARKER;

export type SerializedImmutableVerseNode = Spread<
  {
    marker: VerseMarker;
    number: string;
    showMarker?: boolean;
    sid?: string;
    altnumber?: string;
    pubnumber?: string;
  },
  SerializedLexicalNode
>;

export class ImmutableVerseNode extends DecoratorNode<void> {
  __marker: VerseMarker;
  __number: string;
  __showMarker?: boolean;
  __sid?: string;
  __altnumber?: string;
  __pubnumber?: string;

  constructor(
    verseNumber: string,
    showMarker = false,
    sid?: string,
    altnumber?: string,
    pubnumber?: string,
    key?: NodeKey,
  ) {
    super(key);
    this.__marker = VERSE_MARKER;
    this.__number = verseNumber;
    this.__showMarker = showMarker;
    this.__sid = sid;
    this.__altnumber = altnumber;
    this.__pubnumber = pubnumber;
  }

  static getType(): string {
    return "immutable-verse";
  }

  static clone(node: ImmutableVerseNode): ImmutableVerseNode {
    const { __number, __showMarker, __sid, __altnumber, __pubnumber, __key } = node;
    return new ImmutableVerseNode(__number, __showMarker, __sid, __altnumber, __pubnumber, __key);
  }

  static importJSON(serializedNode: SerializedImmutableVerseNode): ImmutableVerseNode {
    const { number, showMarker, sid, altnumber, pubnumber, marker } = serializedNode;
    const node = $createImmutableVerseNode(number, showMarker, sid, altnumber, pubnumber);
    node.setMarker(marker);
    return node;
  }

  setMarker(marker: VerseMarker): void {
    const self = this.getWritable();
    self.__marker = marker;
  }

  getMarker(): VerseMarker {
    const self = this.getLatest();
    return self.__marker;
  }

  setNumber(verseNumber: string): void {
    const self = this.getWritable();
    self.__number = verseNumber;
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
    dom.setAttribute("data-marker", this.__marker);
    dom.classList.add(VERSE_CLASS_NAME, `usfm_${this.__marker}`);
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
      ? getVisibleOpenMarkerText(this.getMarker(), this.getNumber())
      : this.getNumber();
  }

  exportJSON(): SerializedImmutableVerseNode {
    return {
      type: this.getType(),
      marker: this.getMarker(),
      number: this.getNumber(),
      showMarker: this.getShowMarker(),
      sid: this.getSid(),
      altnumber: this.getAltnumber(),
      pubnumber: this.getPubnumber(),
      version: IMMUTABLE_VERSE_VERSION,
    };
  }
}

export function $createImmutableVerseNode(
  verseNumber: string,
  showMarker?: boolean,
  sid?: string,
  altnumber?: string,
  pubnumber?: string,
): ImmutableVerseNode {
  return $applyNodeReplacement(
    new ImmutableVerseNode(verseNumber, showMarker, sid, altnumber, pubnumber),
  );
}

export function $isImmutableVerseNode(
  node: LexicalNode | null | undefined,
): node is ImmutableVerseNode {
  return node instanceof ImmutableVerseNode;
}
