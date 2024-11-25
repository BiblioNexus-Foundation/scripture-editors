/** Conforms with USJ v3.1 @see https://docs.usfm.bible/usfm/3.1/note/index.html */

import {
  type LexicalNode,
  $applyNodeReplacement,
  NodeKey,
  Spread,
  SerializedLexicalNode,
  DecoratorNode,
  LexicalEditor,
  DOMExportOutput,
  isHTMLElement,
  DOMConversionOutput,
  DOMConversionMap,
} from "lexical";
import { JSX, ReactNode, SyntheticEvent } from "react";

export type OnClick = (event: SyntheticEvent) => void;

export type SerializedImmutableNoteCallerNode = Spread<
  {
    caller: string;
    previewText: string;
    onClick?: OnClick;
  },
  SerializedLexicalNode
>;

export const IMMUTABLE_NOTE_CALLER_VERSION = 1;

export const immutableNoteCallerNodeName = "ImmutableNoteCallerNode";
export class ImmutableNoteCallerNode extends DecoratorNode<ReactNode> {
  __caller: string;
  __previewText: string;
  __onClick: OnClick;

  constructor(caller: string, previewText: string, onClick?: OnClick, key?: NodeKey) {
    super(key);
    this.__caller = caller;
    this.__previewText = previewText;
    this.__onClick = onClick ?? (() => undefined);
  }

  static getType(): string {
    return "immutable-note-caller";
  }

  static clone(node: ImmutableNoteCallerNode): ImmutableNoteCallerNode {
    const { __caller, __previewText, __onClick, __key } = node;
    return new ImmutableNoteCallerNode(__caller, __previewText, __onClick, __key);
  }

  static importJSON(serializedNode: SerializedImmutableNoteCallerNode): ImmutableNoteCallerNode {
    const { caller, previewText, onClick } = serializedNode;
    const node = $createImmutableNoteCallerNode(caller, previewText, onClick);
    return node;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (node: HTMLElement) => {
        if (!isNoteCallerElement(node)) return null;

        return {
          conversion: $convertNoteCallerElement,
          priority: 1,
        };
      },
    };
  }

  setCaller(caller: string): void {
    const self = this.getWritable();
    self.__caller = caller;
  }

  getCaller(): string {
    const self = this.getLatest();
    return self.__caller;
  }

  setPreviewText(previewText: string): void {
    const self = this.getWritable();
    self.__previewText = previewText;
  }

  getPreviewText(): string {
    const self = this.getLatest();
    return self.__previewText;
  }

  setOnClick(onClick: OnClick): void {
    const self = this.getWritable();
    self.__onClick = onClick;
  }

  getOnClick(): OnClick {
    const self = this.getLatest();
    return self.__onClick;
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("span");
    dom.classList.add(this.__type);
    dom.setAttribute("data-caller", this.__caller);
    dom.setAttribute("data-preview-text", this.__previewText);
    return dom;
  }

  updateDOM(prevNode: ImmutableNoteCallerNode): boolean {
    if (prevNode.__caller !== this.__caller) return true;

    return false;
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const { element } = super.exportDOM(editor);
    if (element && isHTMLElement(element)) {
      element.classList.add(this.getType());
      element.setAttribute("data-caller", this.getCaller());
      element.setAttribute("data-preview-text", this.getPreviewText());
    }

    return { element };
  }

  decorate(): JSX.Element {
    const callerId = `${this.__caller}_${this.__previewText}}`.replace(/\s+/g, "").substring(0, 25);
    return (
      <button onClick={this.__onClick} title={this.__previewText} data-caller-id={callerId}>
        {this.__caller}
      </button>
    );
  }

  exportJSON(): SerializedImmutableNoteCallerNode {
    return {
      type: this.getType(),
      caller: this.getCaller(),
      previewText: this.getPreviewText(),
      onClick: this.getOnClick(),
      version: IMMUTABLE_NOTE_CALLER_VERSION,
    };
  }
}

function $convertNoteCallerElement(element: HTMLElement): DOMConversionOutput {
  const caller = element.getAttribute("data-caller") ?? "";
  const previewText = element.getAttribute("data-preview-text") ?? "";
  const node = $createImmutableNoteCallerNode(caller, previewText);
  return { node };
}

export function $createImmutableNoteCallerNode(
  caller: string,
  previewText: string,
  onClick?: OnClick,
): ImmutableNoteCallerNode {
  return $applyNodeReplacement(new ImmutableNoteCallerNode(caller, previewText, onClick));
}

function isNoteCallerElement(node: HTMLElement | null | undefined): boolean {
  if (!node) return false;

  return node.classList.contains(ImmutableNoteCallerNode.getType());
}

export function $isImmutableNoteCallerNode(
  node: LexicalNode | null | undefined,
): node is ImmutableNoteCallerNode {
  return node instanceof ImmutableNoteCallerNode;
}
