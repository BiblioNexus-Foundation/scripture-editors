import { addClassNamesToElement } from "@lexical/utils";
import {
  $applyNodeReplacement,
  $isTextNode,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  isHTMLElement,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  RangeSelection,
  SerializedLexicalNode,
} from "lexical";
import {
  Attributes,
  SerializedScriptureElementNode,
  ScriptureElementNode,
  NodeProps,
} from "./ScriptureElementNode";

const DEFAULT_TAG = "p";

export type SerializedBlockNode = SerializedScriptureElementNode;

export class BlockNode extends ScriptureElementNode {
  constructor(attributes: Attributes = {}, props?: NodeProps, tag?: string, key?: NodeKey) {
    super(attributes, props, tag, key);
  }

  static getType(): string {
    return "block";
  }

  static clone(node: BlockNode): BlockNode {
    return new BlockNode(node.__attributes, node.__props, node.__tag, node.__key);
  }

  isInline(): boolean {
    return false;
  }

  createDOM(config: EditorConfig): HTMLElement {
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

  static importJSON(serializedNode: SerializedBlockNode): BlockNode {
    const { attributes, props, tag, format, indent, direction } = serializedNode;
    const node = $createBlockNode(attributes, props, tag ?? DEFAULT_TAG);
    node.setFormat(format);
    node.setIndent(indent);
    node.setDirection(direction);
    return node;
  }

  exportJSON(): SerializedBlockNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      version: 1,
    };
  }

  updateDOM(): boolean {
    return false;
  }

  insertNewAfter(_: RangeSelection, restoreSelection: boolean): BlockNode {
    const newElement = $createBlockNode(this.getAttributes(), this.getProps(), this.getTag());
    const direction = this.getDirection();
    newElement.setDirection(direction);
    this.insertAfter(newElement, restoreSelection);
    return newElement;
  }

  collapseAtStart(): boolean {
    const children = this.getChildren();
    if (
      children.length === 0 ||
      ($isTextNode(children[0]) && children[0].getTextContent().trim() === "")
    ) {
      const nextSibling = this.getNextSibling();
      if (nextSibling !== null) {
        this.selectNext();
        this.remove();
        return true;
      }
      const prevSibling = this.getPreviousSibling();
      if (prevSibling !== null) {
        this.selectPrevious();
        this.remove();
        return true;
      }
    }
    return false;
  }
}

export function $createBlockNode(
  attributes?: Attributes,
  props?: NodeProps,
  tag?: string,
): BlockNode {
  return $applyNodeReplacement(new BlockNode(attributes, props, tag));
}

export function $isBlockNode(node: LexicalNode | null | undefined): node is BlockNode {
  return node instanceof BlockNode;
}

export const createSerializedBlockNode = ({
  children,
  attributes,
  direction = null,
  format = "",
  indent = 0,
  tag = "p",
}: {
  children: SerializedLexicalNode[];
  attributes: Attributes;
  direction?: "ltr" | "rtl" | null;
  format?: ElementFormatType;
  indent?: number;
  tag?: string;
}): SerializedBlockNode => {
  return {
    children: children || [],
    direction,
    format,
    indent,
    type: "block",
    version: 1,
    attributes,
    tag,
  };
};
