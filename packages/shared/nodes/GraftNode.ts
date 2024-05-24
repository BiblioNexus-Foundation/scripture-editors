import {
  $applyNodeReplacement,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  NodeKey,
  isHTMLElement,
} from "lexical";
import { Attributes, SerializedUsfmElementNode, UsfmElementNode } from "./UsfmElementNode";
import { addClassNamesToElement } from "@lexical/utils";

const DEFAULT_TAG = "span";

export type SerializedGraftNode = SerializedUsfmElementNode;

export class GraftNode extends UsfmElementNode {
  constructor(attributes: Attributes = {}, tag?: string, key?: NodeKey) {
    super(attributes, tag, key);
  }

  static getType(): string {
    return "graft";
  }

  static clone(node: GraftNode): GraftNode {
    return new GraftNode(node.__attributes, node.__tag, node.__key);
  }

  isInline(): boolean {
    return true;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement(this.getTag() ?? DEFAULT_TAG);
    const attributes = this.getAttributes() ?? {};
    Object.keys(attributes).forEach((attKey) => {
      element.setAttribute(attKey, attributes[attKey]);
    });
    addClassNamesToElement(element, config.theme.sectionmark);
    // Setting contenteditable to false is the trick Lexical uses for decorator nodes so you can place the cursor after a span that contains editable content.
    // element.setAttribute("contenteditable", "false");
    return element;
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const { element } = super.exportDOM(editor);

    if (element && isHTMLElement(element)) {
      if (this.isEmpty()) {
        element.append(document.createElement("br"));
      }

      const formatType = this.getFormatType();
      element.style.textAlign = formatType;

      const direction = this.getDirection();
      if (direction) {
        element.dir = direction;
      }
      const indent = this.getIndent();
      if (indent > 0) {
        // padding-inline-start is not widely supported in email HTML, but
        // Lexical Reconciler uses padding-inline-start. Using text-indent instead.
        element.style.textIndent = `${indent * 20}px`;
      }
    }

    return {
      element,
    };
  }

  static importJSON(serializedNode: SerializedGraftNode): GraftNode {
    const { attributes, format, indent, direction, tag } = serializedNode;
    const node = $createGraftNode(attributes, tag ?? DEFAULT_TAG);
    node.setFormat(format);
    node.setIndent(indent);
    node.setDirection(direction);
    return node;
  }

  exportJSON(): SerializedGraftNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      version: 1,
    };
  }

  isShadowRoot(): boolean {
    return true;
  }
}

export function $createGraftNode(attributes?: Attributes, tag?: string): GraftNode {
  return $applyNodeReplacement(new GraftNode(attributes, tag));
}
