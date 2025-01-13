import {
  ElementNode,
  NodeKey,
  SerializedElementNode,
  SerializedLexicalNode,
  Spread,
} from "lexical";

export type Attributes = { [key: string]: string };

export type SerializedScriptureElementNode = Spread<
  {
    attributes?: Attributes;
    props?: NodeProps;
    tag?: string;
  },
  SerializedElementNode
>;

export type NodeProps = {
  isInline?: boolean;
};

export class ScriptureElementNode extends ElementNode {
  __attributes: Attributes;
  __props?: NodeProps;
  __tag?: string;

  constructor(attributes: Attributes = {}, props?: NodeProps, tag?: string, key?: NodeKey) {
    super(key);
    this.__attributes = attributes;
    this.__props = props;
    this.__tag = tag;
  }

  getAttributes(): Attributes {
    return this.getLatest().__attributes;
  }

  setAttributes(attributes: Attributes) {
    const writable = this.getWritable();
    writable.__attributes = attributes;
  }

  getAttribute(key: string): string | undefined {
    return this.getLatest().__attributes[key];
  }

  setAttribute(key: string, value: string) {
    const writable = this.getWritable();
    writable.__attributes[key] = value;
  }

  removeAttribute(key: string) {
    const writable = this.getWritable();
    delete writable.__attributes[key];
  }

  setUIAttribute(key: string, value: string) {
    this.setAttribute(`data-ui-${key}`, value);
  }

  getUIAttribute(key: string): string | undefined {
    return this.getAttribute(`data-ui-${key}`);
  }

  getUIAttributes(): Attributes {
    return Object.keys(this.getAttributes()).reduce((acc: Attributes, key) => {
      if (key.startsWith("data-ui-")) {
        acc[key] = this.getAttribute(key) as string;
      }
      return acc;
    }, {});
  }

  removeUIAttribute(key: string) {
    this.removeAttribute(`data-ui-${key}`);
  }

  getProps(): NodeProps | undefined {
    return this.getLatest().__props;
  }

  getTag(): string | undefined {
    return this.getLatest().__tag;
  }

  setTag(tag: string | undefined) {
    const writable = this.getWritable();
    writable.__tag = tag;
  }

  exportJSON(): SerializedScriptureElementNode {
    const attributes = this.getAttributes();
    const nonUiAttributes: Attributes = Object.keys(attributes).reduce((acc: Attributes, key) => {
      if (!key.startsWith("data-ui-")) {
        acc[key] = attributes[key];
      }
      return acc;
    }, {});

    return {
      ...super.exportJSON(),
      attributes: nonUiAttributes,
      tag: this.getTag(),
      type: "usfmelement",
      version: 1,
    };
  }

  isInline(): boolean {
    return this.__props?.isInline ?? false;
  }

  updateDOM(_: ScriptureElementNode, element: HTMLElement): boolean {
    const elementAttributes = Array.from(element.attributes).reduce((acc, attr) => {
      if (attr.name !== "dir") {
        acc[attr.name] = attr.value;
      }
      return acc;
    }, {} as Attributes);
    const nodeAttributes = this.getAttributes();

    const filteredNodeAttributes = Object.fromEntries(
      Object.entries(nodeAttributes).filter(([key]) => key !== "dir"),
    );
    if (Object.keys(elementAttributes).length !== Object.keys(filteredNodeAttributes).length) {
      return true;
    }
    for (const [key, value] of Object.entries(elementAttributes)) {
      if (filteredNodeAttributes[key] !== value) {
        return true;
      }
    }
    return false;
  }
}

export const isSerializedScriptureElementNode = (
  node: SerializedLexicalNode,
): node is SerializedScriptureElementNode => "attributes" in node;
