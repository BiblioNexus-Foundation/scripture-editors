/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#book */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  Spread,
  ElementNode,
  $createTextNode,
  SerializedElementNode,
  TextNode,
} from "lexical";
import { BookCode } from "../../../converters/usj/usj.model";

export const BOOK_MARKER = "id";
export const BOOK_VERSION = 1;

type BookMarker = typeof BOOK_MARKER;

export type SerializedBookNode = Spread<
  {
    marker: BookMarker;
    code: BookCode;
    text?: string;
  },
  SerializedElementNode
>;

export class BookNode extends ElementNode {
  __marker: BookMarker;
  __code: BookCode;

  constructor(code: BookCode, text?: string, key?: NodeKey) {
    super(key);
    this.__marker = BOOK_MARKER;
    this.__code = code;
    this.append($createTextNode(text));
  }

  static getType(): string {
    return "book";
  }

  static clone(node: BookNode): BookNode {
    const __text = node.getFirstChild<TextNode>()?.getTextContent();
    return new BookNode(node.__code, __text, node.__key);
  }

  static importJSON(serializedNode: SerializedBookNode): BookNode {
    const { code, text, marker, format, indent, direction } = serializedNode;
    const node = $createBookNode(code, text);
    node.setFormat(format);
    node.setIndent(indent);
    node.setDirection(direction);
    node.setMarker(marker);
    return node;
  }

  setMarker(marker: BookMarker): void {
    const self = this.getWritable();
    self.__marker = marker;
  }

  getMarker(): BookMarker {
    const self = this.getLatest();
    return self.__marker;
  }

  setCode(code: BookCode): void {
    const self = this.getWritable();
    self.__code = code;
  }

  /**
   * Get the book code (ID).
   * @returns the book code (ID).
   */
  getCode(): BookCode {
    const self = this.getLatest();
    return self.__code;
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("p");
    dom.setAttribute("data-marker", this.__marker);
    dom.classList.add(this.getType(), `usfm_${this.__marker}`);
    dom.setAttribute("data-code", this.__code);
    return dom;
  }

  updateDOM(): boolean {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }

  exportJSON(): SerializedBookNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      marker: this.getMarker(),
      code: this.getCode(),
      text: this.getFirstChild<TextNode>()?.getTextContent(),
      version: BOOK_VERSION,
    };
  }
}

export function $createBookNode(code: BookCode, text?: string): BookNode {
  return $applyNodeReplacement(new BookNode(code, text));
}

export function $isBookNode(node: LexicalNode | null | undefined): node is BookNode {
  return node instanceof BookNode;
}
