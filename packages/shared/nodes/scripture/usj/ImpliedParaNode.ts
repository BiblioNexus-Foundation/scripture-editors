/** Conforms with USJ v3.1 and adapted from @see https://docs.usfm.bible/usfm/3.1/para/index.html */

import {
  $applyNodeReplacement,
  LexicalNode,
  ParagraphNode,
  RangeSelection,
  SerializedLexicalNode,
  SerializedParagraphNode,
} from "lexical";
import { PARA_MARKER_DEFAULT } from "./node-constants";

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
    return $createImpliedParaNode().updateFromJSON(serializedNode);
  }

  getMarker(): string {
    return PARA_MARKER_DEFAULT;
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
    newElement.setTextFormat(rangeSelection.format);
    newElement.setTextStyle(rangeSelection.style);
    newElement.setDirection(this.getDirection());
    newElement.setFormat(this.getFormatType());
    newElement.setStyle(this.getTextStyle());
    newElement.setIndent(this.getIndent());
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

export function isSerializedImpliedParaNode(
  node: SerializedLexicalNode | null | undefined,
): node is SerializedImpliedParaNode {
  return node?.type === ImpliedParaNode.getType();
}
