import { $applyNodeReplacement, EditorConfig, NodeKey } from "lexical";
import { Attributes, SerializedUsfmElementNode, UsfmElementNode } from "./UsfmElementNode";
import { addClassNamesToElement } from "@lexical/utils";

export type SerializedGraftNode = SerializedUsfmElementNode;

export class GraftNode extends UsfmElementNode {
  constructor(attributes: Attributes, data: unknown, tag: string | undefined, key?: NodeKey) {
    super(attributes, data, tag || "span", key);
  }

  static getType(): string {
    return "graft";
  }

  static clone(node: GraftNode): GraftNode {
    return new GraftNode(node.__attributes, node.__data, node.__tag, node.__key);
  }

  isInline(): boolean {
    return true;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement(this.getTag());
    const attributes = this.getAttributes() ?? {};
    Object.keys(attributes).forEach((attKey) => {
      element.setAttribute(attKey, attributes[attKey]);
    });
    addClassNamesToElement(element, config.theme.sectionmark);
    return element;
  }

  static importJSON(serializedNode: SerializedGraftNode): GraftNode {
    const { attributes, data, format, indent, direction, tag } = serializedNode;
    const node = $createGraftNode(attributes, data, tag);
    node.setFormat(format);
    node.setIndent(indent);
    node.setDirection(direction);
    return node;
  }

  exportJSON(): SerializedGraftNode {
    return {
      ...super.exportJSON(),
      type: "graft",
      version: 1,
    };
  }

  updateDOM(): boolean {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }
}

function $createGraftNode(
  attributes: Attributes,
  data: unknown,
  tag: string | undefined,
): GraftNode {
  return $applyNodeReplacement(new GraftNode(attributes, data, tag));
}
