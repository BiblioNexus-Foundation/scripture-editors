import { ElementNode, NodeKey, SerializedElementNode, Spread } from "lexical";

export type Attributes = { [key: string]: string };

export type SerializedUsfmElementNode = Spread<
  {
    attributes: Attributes;
    data: unknown;
    tag?: string;
  },
  SerializedElementNode
>;

export class UsfmElementNode extends ElementNode {
  __data: unknown;
  __attributes: Attributes;
  __tag?: string;

  constructor(attributes: Attributes, data: unknown, tag?: string, key?: NodeKey) {
    super(key);
    this.__data = data;
    this.__attributes = attributes;
    this.__tag = tag;
  }

  getData(): unknown {
    return this.getLatest().__data;
  }

  setData(data: unknown) {
    const writable = this.getWritable();
    writable.__data = data;
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
      children: this.getChildren<UsfmElementNode>().map((node) => node.exportJSON()),
      data: this.getData(),
      attributes: this.getAttributes(),
      tag: this.getTag(),
      type: "usfmelement",
      version: 1,
    };
  }
}
