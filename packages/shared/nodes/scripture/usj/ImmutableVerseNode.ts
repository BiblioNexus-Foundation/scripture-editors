/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#verse */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  DecoratorNode,
  SerializedLexicalNode,
  Spread,
  DOMConversionMap,
  LexicalEditor,
  DOMExportOutput,
  isHTMLElement,
  DOMConversionOutput,
} from "lexical";
import { UnknownAttributes, VERSE_CLASS_NAME, getVisibleOpenMarkerText } from "./node.utils";

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
    unknownAttributes?: UnknownAttributes;
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
  __unknownAttributes?: UnknownAttributes;

  constructor(
    verseNumber: string,
    showMarker = false,
    sid?: string,
    altnumber?: string,
    pubnumber?: string,
    unknownAttributes?: UnknownAttributes,
    key?: NodeKey,
  ) {
    super(key);
    this.__marker = VERSE_MARKER;
    this.__number = verseNumber;
    this.__showMarker = showMarker;
    this.__sid = sid;
    this.__altnumber = altnumber;
    this.__pubnumber = pubnumber;
    this.__unknownAttributes = unknownAttributes;
  }

  static getType(): string {
    return "immutable-verse";
  }

  static clone(node: ImmutableVerseNode): ImmutableVerseNode {
    const { __number, __showMarker, __sid, __altnumber, __pubnumber, __unknownAttributes, __key } =
      node;
    return new ImmutableVerseNode(
      __number,
      __showMarker,
      __sid,
      __altnumber,
      __pubnumber,
      __unknownAttributes,
      __key,
    );
  }

  static importJSON(serializedNode: SerializedImmutableVerseNode): ImmutableVerseNode {
    const { marker, number, showMarker, sid, altnumber, pubnumber, unknownAttributes } =
      serializedNode;
    const node = $createImmutableVerseNode(
      number,
      showMarker,
      sid,
      altnumber,
      pubnumber,
      unknownAttributes,
    );
    node.setMarker(marker);
    return node;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (node: HTMLElement) => {
        if (!isVerseElement(node)) return null;

        return {
          conversion: $convertImmutableVerseElement,
          priority: 1,
        };
      },
    };
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

  setUnknownAttributes(unknownAttributes: UnknownAttributes | undefined): void {
    const self = this.getWritable();
    self.__unknownAttributes = unknownAttributes;
  }

  getUnknownAttributes(): UnknownAttributes | undefined {
    const self = this.getLatest();
    return self.__unknownAttributes;
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

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const { element } = super.exportDOM(editor);
    if (element && isHTMLElement(element)) {
      element.setAttribute("data-marker", this.getMarker());
      element.classList.add(VERSE_CLASS_NAME, `usfm_${this.getMarker()}`);
      element.setAttribute("data-number", this.getNumber());
    }

    return { element };
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
      unknownAttributes: this.getUnknownAttributes(),
      version: IMMUTABLE_VERSE_VERSION,
    };
  }
}

function $convertImmutableVerseElement(element: HTMLElement): DOMConversionOutput {
  const verseNumber = element.getAttribute("data-number") ?? "0";
  const node = $createImmutableVerseNode(verseNumber);
  return { node };
}

export function $createImmutableVerseNode(
  verseNumber: string,
  showMarker?: boolean,
  sid?: string,
  altnumber?: string,
  pubnumber?: string,
  unknownAttributes?: UnknownAttributes,
): ImmutableVerseNode {
  return $applyNodeReplacement(
    new ImmutableVerseNode(verseNumber, showMarker, sid, altnumber, pubnumber, unknownAttributes),
  );
}

function isVerseElement(node: HTMLElement | null | undefined): boolean {
  const marker = node?.getAttribute("data-marker") ?? undefined;
  return marker === VERSE_MARKER;
}

export function $isImmutableVerseNode(
  node: LexicalNode | null | undefined,
): node is ImmutableVerseNode {
  return node instanceof ImmutableVerseNode;
}
