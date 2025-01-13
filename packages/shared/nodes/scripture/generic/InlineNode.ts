import {
  $applyNodeReplacement,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  isHTMLElement,
  LexicalEditor,
  NodeKey,
  SerializedLexicalNode,
} from "lexical";
import {
  Attributes,
  SerializedScriptureElementNode,
  ScriptureElementNode,
  NodeProps,
} from "./ScriptureElementNode";
import { addClassNamesToElement } from "@lexical/utils";

const DEFAULT_TAG = "span";

export type SerializedInlineNode = SerializedScriptureElementNode;

export class InlineNode extends ScriptureElementNode {
  constructor(attributes: Attributes = {}, props?: NodeProps, tag?: string, key?: NodeKey) {
    super(attributes, props, tag, key);
  }

  static getType(): string {
    return "inline";
  }

  static clone(node: InlineNode): InlineNode {
    return new InlineNode(node.__attributes, node.__props, node.__tag, node.__key);
  }

  isInline(): boolean {
    return true;
  }

  canBeEmpty(): boolean {
    return false;
  }

  createDOM(config: EditorConfig): HTMLSpanElement {
    const element = document.createElement(this.getTag() ?? DEFAULT_TAG);
    const attributes = this.getAttributes() ?? {};
    Object.keys(attributes).forEach((attKey) => {
      element.setAttribute(attKey, attributes[attKey]);
    });
    addClassNamesToElement(element, config.theme.sectionmark);
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

  static importJSON(serializedNode: SerializedInlineNode): InlineNode {
    const { attributes, props, format, indent, direction, tag } = serializedNode;
    const node = $createInlineNode(attributes, props, tag ?? DEFAULT_TAG);
    node.setFormat(format);
    node.setIndent(indent);
    node.setDirection(direction);
    return node;
  }

  exportJSON(): SerializedInlineNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      version: 1,
    };
  }
}

function $createInlineNode(attributes?: Attributes, props?: NodeProps, tag?: string): InlineNode {
  return $applyNodeReplacement(new InlineNode(attributes, props, tag));
}

export const createSerializedInlineNode = ({
  children,
  attributes,
  direction = null,
  format = "",
  indent = 0,
  tag = "span",
}: {
  children: SerializedLexicalNode[];
  attributes: Attributes;
  direction?: "ltr" | "rtl" | null;
  format?: ElementFormatType;
  indent?: number;
  tag?: string;
}): SerializedInlineNode => {
  return {
    children: children || [],
    direction,
    format,
    indent,
    type: "inline",
    version: 1,
    attributes,
    tag,
  };
};
