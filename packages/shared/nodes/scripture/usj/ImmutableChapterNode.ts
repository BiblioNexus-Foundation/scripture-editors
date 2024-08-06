/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#chapter */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  DecoratorNode,
  SerializedLexicalNode,
  Spread,
  LexicalEditor,
  DOMExportOutput,
  isHTMLElement,
  DOMConversionOutput,
  DOMConversionMap,
} from "lexical";
import { CHAPTER_CLASS_NAME, UnknownAttributes, getVisibleOpenMarkerText } from "./node.utils";

export const CHAPTER_MARKER = "c";
export const IMMUTABLE_CHAPTER_VERSION = 1;
const IMMUTABLE_CHAPTER_TAG_NAME = "span";

type ChapterMarker = typeof CHAPTER_MARKER;

export type SerializedImmutableChapterNode = Spread<
  {
    marker: ChapterMarker;
    number: string;
    classList: string[];
    showMarker?: boolean;
    sid?: string;
    altnumber?: string;
    pubnumber?: string;
    unknownAttributes?: UnknownAttributes;
  },
  SerializedLexicalNode
>;

export class ImmutableChapterNode extends DecoratorNode<void> {
  __marker: ChapterMarker;
  __number: string;
  __classList: string[];
  __showMarker?: boolean;
  __sid?: string;
  __altnumber?: string;
  __pubnumber?: string;
  __unknownAttributes?: UnknownAttributes;

  constructor(
    chapterNumber: string,
    classList: string[] = [],
    showMarker = false,
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
    this.__showMarker = showMarker;
    this.__sid = sid;
    this.__altnumber = altnumber;
    this.__pubnumber = pubnumber;
    this.__unknownAttributes = unknownAttributes;
  }

  static getType(): string {
    return "immutable-chapter";
  }

  static clone(node: ImmutableChapterNode): ImmutableChapterNode {
    const {
      __number,
      __classList,
      __showMarker,
      __sid,
      __altnumber,
      __pubnumber,
      __unknownAttributes,
      __key,
    } = node;
    return new ImmutableChapterNode(
      __number,
      __classList,
      __showMarker,
      __sid,
      __altnumber,
      __pubnumber,
      __unknownAttributes,
      __key,
    );
  }

  static importJSON(serializedNode: SerializedImmutableChapterNode): ImmutableChapterNode {
    const { marker, number, classList, showMarker, sid, altnumber, pubnumber, unknownAttributes } =
      serializedNode;
    const node = $createImmutableChapterNode(
      number,
      classList,
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
        if (!isImmutableChapterElement(node)) return null;

        return {
          conversion: $convertImmutableChapterElement,
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
    const dom = document.createElement(IMMUTABLE_CHAPTER_TAG_NAME);
    dom.setAttribute("data-marker", this.__marker);
    dom.classList.add(CHAPTER_CLASS_NAME, `usfm_${this.__marker}`, ...this.__classList);
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
      element.classList.add(CHAPTER_CLASS_NAME, `usfm_${this.getMarker()}`, ...this.getClassList());
      element.setAttribute("data-number", this.getNumber());
    }

    return { element };
  }

  decorate(): string {
    return this.getShowMarker()
      ? getVisibleOpenMarkerText(this.getMarker(), this.getNumber())
      : this.getNumber();
  }

  exportJSON(): SerializedImmutableChapterNode {
    return {
      type: this.getType(),
      marker: this.getMarker(),
      number: this.getNumber(),
      classList: this.getClassList(),
      showMarker: this.getShowMarker(),
      sid: this.getSid(),
      altnumber: this.getAltnumber(),
      pubnumber: this.getPubnumber(),
      unknownAttributes: this.getUnknownAttributes(),
      version: IMMUTABLE_CHAPTER_VERSION,
    };
  }

  // Mutation

  isInline(): false {
    return false;
  }
}

function $convertImmutableChapterElement(element: HTMLElement): DOMConversionOutput {
  const marker = element.getAttribute("data-marker") ?? undefined;
  const chapterNumber = element.getAttribute("data-number") ?? "0";
  const domNode = element.cloneNode(false) as HTMLElement;
  domNode.classList.remove(CHAPTER_CLASS_NAME, `usfm_${marker}`, "ltr", "rtl");
  const classList = [...domNode.classList.values()];
  const node = $createImmutableChapterNode(chapterNumber, classList);
  return { node };
}

export function $createImmutableChapterNode(
  chapterNumber: string,
  classList?: string[],
  showMarker?: boolean,
  sid?: string,
  altnumber?: string,
  pubnumber?: string,
  unknownAttributes?: UnknownAttributes,
): ImmutableChapterNode {
  return $applyNodeReplacement(
    new ImmutableChapterNode(
      chapterNumber,
      classList,
      showMarker,
      sid,
      altnumber,
      pubnumber,
      unknownAttributes,
    ),
  );
}

export function isImmutableChapterElement(element: HTMLElement | null | undefined): boolean {
  if (!element) return false;

  return (
    element.classList.contains(CHAPTER_CLASS_NAME) &&
    element.tagName.toLowerCase() === IMMUTABLE_CHAPTER_TAG_NAME
  );
}

export function $isImmutableChapterNode(
  node: LexicalNode | null | undefined,
): node is ImmutableChapterNode {
  return node instanceof ImmutableChapterNode;
}
