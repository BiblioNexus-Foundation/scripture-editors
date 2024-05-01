/** Conforms with USX v3.0 and adapted from @see https://ubsicap.github.io/usx/elements.html#para */

import {
  type LexicalNode,
  $applyNodeReplacement,
  ParagraphNode,
  SerializedParagraphNode,
  RangeSelection,
} from "lexical";

export const IMPLIED_PARA_VERSION = 1;

export type SerializedImpliedParaNode = SerializedParagraphNode;

export class ImpliedParaNode extends ParagraphNode {
  static getType(): string {
    return "implied-para";
  }

  static clone(node: ImpliedParaNode): ImpliedParaNode {
    return new ImpliedParaNode(node.__key);
  }

  static importJSON(serializedNode: SerializedImpliedParaNode): ImpliedParaNode {
    const { format, indent, direction, textFormat } = serializedNode;
    const node = $createImpliedParaNode();
    node.setFormat(format);
    node.setIndent(indent);
    node.setDirection(direction);
    node.setTextFormat(textFormat);
    return node;
  }

  createDOM(): HTMLElement {
    // Define the DOM element here
    const dom = document.createElement("p");
    return dom;
  }

  exportJSON(): SerializedImpliedParaNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      version: IMPLIED_PARA_VERSION,
    };
  }

  // Mutation

  insertNewAfter(rangeSelection: RangeSelection, restoreSelection: boolean): ParagraphNode {
    const newElement = $createImpliedParaNode();
    newElement.setFormat(this.getFormatType());
    newElement.setIndent(this.getIndent());
    newElement.setDirection(this.getDirection());
    newElement.setTextFormat(rangeSelection.format);
    this.insertAfter(newElement, restoreSelection);
    return newElement;
  }
}

export function $createImpliedParaNode(): ImpliedParaNode {
  return $applyNodeReplacement(new ImpliedParaNode());
}

export function $isImpliedParaNode(node: LexicalNode | null | undefined): node is ImpliedParaNode {
  return node instanceof ImpliedParaNode;
}
