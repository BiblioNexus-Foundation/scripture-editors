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
  DOMConversionMap,
  DOMConversionOutput,
  isHTMLElement,
  createCommand,
  LexicalCommand,
} from "lexical";
import { getVisibleOpenMarkerText, parseNumberFromMarkerText } from "./node.utils";
import { ChapterNode } from "./ChapterNode";

export const SELECT_IMMUTABLE_CHAPTER_NUMBER_COMMAND: LexicalCommand<string> = createCommand();
export const IMMUTABLE_CHAPTER_NUMBER_VERSION = 1;

export type SerializedImmutableChapterNumberNode = Spread<
  {
    number: string;
    showMarker?: boolean;
  },
  SerializedLexicalNode
>;

export class ImmutableChapterNumberNode extends DecoratorNode<void> {
  __number: string;
  __showMarker?: boolean;

  constructor(chapterNumber: string, showMarker = false, key?: NodeKey) {
    super(key);
    this.__number = chapterNumber;
    this.__showMarker = showMarker;
  }

  static getType(): string {
    return "immutable-chapter-number";
  }

  static clone(node: ImmutableChapterNumberNode): ImmutableChapterNumberNode {
    const { __number, __showMarker, __key } = node;
    return new ImmutableChapterNumberNode(__number, __showMarker, __key);
  }

  static importJSON(
    serializedNode: SerializedImmutableChapterNumberNode,
  ): ImmutableChapterNumberNode {
    const { number, showMarker } = serializedNode;
    const node = $createImmutableChapterNumberNode(number, showMarker);
    return node;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (node: HTMLElement) => {
        if (!isChapterNumberElement(node)) return null;

        return {
          conversion: $convertImmutableChapterNumberElement,
          priority: 1,
        };
      },
    };
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

  createDOM(): HTMLElement {
    const dom = document.createElement("span");
    dom.classList.add(this.__type);
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
      element.classList.add(this.getType());
    }
    return { element };
  }

  decorate(): string {
    return this.getShowMarker()
      ? getVisibleOpenMarkerText(
          (this.getParentOrThrow() as ChapterNode).getMarker(),
          this.getNumber(),
        )
      : this.getNumber();
  }

  exportJSON(): SerializedImmutableChapterNumberNode {
    return {
      type: this.getType(),
      number: this.getNumber(),
      showMarker: this.getShowMarker(),
      version: IMMUTABLE_CHAPTER_NUMBER_VERSION,
    };
  }

  // Mutation

  isInline(): false {
    return false;
  }
}

function $convertImmutableChapterNumberElement(element: HTMLElement): DOMConversionOutput {
  const marker = element.parentElement?.getAttribute("data-marker") ?? "";
  const defaultNumber = element.parentElement?.getAttribute("data-number") ?? "";
  const text = element.textContent ?? "";
  const number = parseNumberFromMarkerText(marker, text, defaultNumber);
  const showMarker = text.startsWith("\\");
  const node = $createImmutableChapterNumberNode(number, showMarker);
  return { node };
}

export function $createImmutableChapterNumberNode(
  chapterNumber: string,
  showMarker?: boolean,
): ImmutableChapterNumberNode {
  return $applyNodeReplacement(new ImmutableChapterNumberNode(chapterNumber, showMarker));
}

export function isChapterNumberElement(node: HTMLElement | null | undefined): boolean {
  if (!node) return false;

  return node.classList.contains(ImmutableChapterNumberNode.getType());
}

export function $isImmutableChapterNumberNode(
  node: LexicalNode | null | undefined,
): node is ImmutableChapterNumberNode {
  return node instanceof ImmutableChapterNumberNode;
}
