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
} from "lexical";
import { getVisibleOpenMarkerText } from "./node.utils";
import { ChapterNode } from "./ChapterNode";

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
    return dom;
  }

  updateDOM(): boolean {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const { element } = super.exportDOM(editor);

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
}

export function $createImmutableChapterNumberNode(
  chapterNumber: string,
  showMarker?: boolean,
): ImmutableChapterNumberNode {
  return $applyNodeReplacement(new ImmutableChapterNumberNode(chapterNumber, showMarker));
}

export function $isImmutableChapterNumberNode(
  node: LexicalNode | null | undefined,
): node is ImmutableChapterNumberNode {
  return node instanceof ImmutableChapterNumberNode;
}
