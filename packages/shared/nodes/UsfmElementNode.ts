import { ElementNode, LexicalNode, NodeKey, SerializedElementNode, Spread } from "lexical";

export type Attributes = { [key: string]: string };

export type SerializedUsfmElementNode = Spread<
  {
    attributes: Attributes;
    tag?: string;
  },
  SerializedElementNode
>;

export class UsfmElementNode extends ElementNode {
  __attributes: Attributes;
  __tag?: string;

  constructor(attributes: Attributes, tag?: string, key?: NodeKey) {
    super(key);
    this.__attributes = attributes;
    this.__tag = tag;
  }

  getAttributes(): Attributes {
    return this.getLatest().__attributes;
  }

  setAttributes(attributes: Attributes) {
    const writable = this.getWritable();
    writable.__attributes = attributes;
  }

  getTag(): string | undefined {
    return this.getLatest().__tag;
  }

  setTag(tag: string | undefined) {
    const writable = this.getWritable();
    writable.__tag = tag;
  }

  exportJSON(): SerializedUsfmElementNode {
    return {
      ...super.exportJSON(),
      attributes: this.getAttributes(),
      tag: this.getTag(),
      type: "usfmelement",
      version: 1,
    };
  }
}

export function $isUsfmElementNode(node: LexicalNode | null | undefined): node is UsfmElementNode {
  return node instanceof UsfmElementNode;
}
