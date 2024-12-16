import {
  $applyNodeReplacement,
  DOMExportOutput,
  ElementNode,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { UnknownAttributes } from "../scripture/usj/node.utils";

export type SerializedUnknownNode = Spread<
  {
    tag: string;
    marker: string;
    unknownAttributes?: UnknownAttributes;
  },
  SerializedElementNode
>;

export const UNKNOWN_VERSION = 1;

export class UnknownNode extends ElementNode {
  __tag: string;
  __marker: string;
  __unknownAttributes?: UnknownAttributes;

  constructor(tag: string, marker: string, unknownAttributes?: UnknownAttributes, key?: NodeKey) {
    super(key);
    this.__tag = tag;
    this.__marker = marker;
    this.__unknownAttributes = unknownAttributes;
  }

  static getType(): string {
    return "unknown";
  }

  static clone(node: UnknownNode): UnknownNode {
    const { __tag, __marker, __unknownAttributes, __key } = node;
    return new UnknownNode(__tag, __marker, __unknownAttributes, __key);
  }

  static importJSON(serializedNode: SerializedUnknownNode): UnknownNode {
    const { tag, marker, unknownAttributes, format, indent, direction } = serializedNode;
    const node = $createUnknownNode(tag, marker, unknownAttributes);
    node.setFormat(format);
    node.setIndent(indent);
    node.setDirection(direction);
    return node;
  }

  setTag(tag: string): void {
    const self = this.getWritable();
    self.__tag = tag;
  }

  getTag(): string {
    const self = this.getLatest();
    return self.__tag;
  }

  setMarker(marker: string): void {
    const self = this.getWritable();
    self.__marker = marker;
  }

  getMarker(): string {
    const self = this.getLatest();
    return self.__marker;
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
    const dom = document.createElement("unknown");
    dom.style.display = "none";
    return dom;
  }

  updateDOM(): boolean {
    // Returning false tells Lexical that this node does not need its DOM element replacing with a
    // new copy from createDOM.
    return false;
  }

  exportDOM(): DOMExportOutput {
    return { element: null };
  }

  exportJSON(): SerializedUnknownNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      tag: this.getTag(),
      marker: this.getMarker(),
      unknownAttributes: this.getUnknownAttributes(),
      version: UNKNOWN_VERSION,
    };
  }

  // Mutation

  canBeEmpty(): true {
    return true;
  }

  isInline(): true {
    return true;
  }

  extractWithChild(): false {
    return false;
  }

  excludeFromCopy(destination: "clone" | "html"): boolean {
    return destination !== "clone";
  }
}

export function $createUnknownNode(
  tag: string,
  marker: string,
  unknownAttributes?: UnknownAttributes,
): UnknownNode {
  return $applyNodeReplacement(new UnknownNode(tag, marker, unknownAttributes));
}

export function $isUnknownNode(node: LexicalNode | null | undefined): node is UnknownNode {
  return node instanceof UnknownNode;
}

export function isSerializedUnknownNode(
  node: SerializedLexicalNode | null | undefined,
): node is SerializedUnknownNode {
  return node?.type === UnknownNode.getType();
}
