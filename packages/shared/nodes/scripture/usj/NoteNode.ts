/** Conforms with USJ v3.1 @see https://docs.usfm.bible/usfm/3.1/note/index.html */

import {
  $applyNodeReplacement,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  ElementNode,
  isHTMLElement,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { UnknownAttributes } from "./node-constants";

/** @see https://docs.usfm.bible/usfm/3.1/note/index.html */
const VALID_NOTE_MARKERS = [
  // Footnote
  "f",
  "fe",
  "ef",
  // Cross Reference
  "x",
  "ex",
] as const;

export type NoteMarker = (typeof VALID_NOTE_MARKERS)[number];

export type SerializedNoteNode = Spread<
  {
    marker: NoteMarker;
    caller: string;
    category?: string;
    unknownAttributes?: UnknownAttributes;
  },
  SerializedElementNode
>;

export const NOTE_VERSION = 1;

export class NoteNode extends ElementNode {
  __marker: NoteMarker;
  __caller: string;
  __category?: string;
  __unknownAttributes?: UnknownAttributes;

  constructor(
    marker: NoteMarker,
    caller: string,
    category?: string,
    unknownAttributes?: UnknownAttributes,
    key?: NodeKey,
  ) {
    super(key);
    this.__marker = marker;
    this.__caller = caller;
    this.__category = category;
    this.__unknownAttributes = unknownAttributes;
  }

  static getType(): string {
    return "note";
  }

  static clone(node: NoteNode): NoteNode {
    const { __marker, __caller, __category, __unknownAttributes, __key } = node;
    return new NoteNode(__marker, __caller, __category, __unknownAttributes, __key);
  }

  static importJSON(serializedNode: SerializedNoteNode): NoteNode {
    const { marker, caller, category, unknownAttributes } = serializedNode;
    return $createNoteNode(marker, caller, category, unknownAttributes).updateFromJSON(
      serializedNode,
    );
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (node: HTMLElement) => {
        if (!isNoteElement(node)) return null;

        return {
          conversion: $convertNoteElement,
          priority: 1,
        };
      },
    };
  }

  static isValidMarker(marker: string | undefined): boolean {
    return !!marker && VALID_NOTE_MARKERS.includes(marker as NoteMarker);
  }

  setMarker(marker: NoteMarker): this {
    if (this.__marker === marker) return this;

    const self = this.getWritable();
    self.__marker = marker;
    return self;
  }

  getMarker(): NoteMarker {
    const self = this.getLatest();
    return self.__marker;
  }

  setCaller(caller: string): this {
    if (this.__caller === caller) return this;

    const self = this.getWritable();
    self.__caller = caller;
    return self;
  }

  getCaller(): string {
    const self = this.getLatest();
    return self.__caller;
  }

  setCategory(category: string | undefined): this {
    if (this.__category === category) return this;

    const self = this.getWritable();
    self.__category = category;
    return self;
  }

  getCategory(): string | undefined {
    const self = this.getLatest();
    return self.__category;
  }

  setUnknownAttributes(unknownAttributes: UnknownAttributes | undefined): this {
    const self = this.getWritable();
    self.__unknownAttributes = unknownAttributes;
    return self;
  }

  getUnknownAttributes(): UnknownAttributes | undefined {
    const self = this.getLatest();
    return self.__unknownAttributes;
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("span");
    dom.setAttribute("data-marker", this.__marker);
    dom.classList.add(this.__type, `usfm_${this.__marker}`);
    dom.setAttribute("data-caller", this.__caller);
    return dom;
  }

  updateDOM(): boolean {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const { element } = super.exportDOM(editor);
    if (element && isHTMLElement(element)) {
      element.setAttribute("data-marker", this.getMarker());
      element.classList.add(this.getType(), `usfm_${this.getMarker()}`);
      element.setAttribute("data-caller", this.getCaller());
    }

    return { element };
  }

  exportJSON(): SerializedNoteNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      marker: this.getMarker(),
      caller: this.getCaller(),
      category: this.getCategory(),
      unknownAttributes: this.getUnknownAttributes(),
      version: NOTE_VERSION,
    };
  }

  // Mutation

  canBeEmpty(): false {
    return false;
  }

  isInline(): true {
    return true;
  }
}

function $convertNoteElement(element: HTMLElement): DOMConversionOutput {
  const marker = (element.getAttribute("data-marker") as NoteMarker) ?? "f";
  const caller = element.getAttribute("data-caller") ?? "";
  const node = $createNoteNode(marker, caller);
  return { node };
}

export const noteNodeName = Symbol.for(NoteNode.name);

export function $createNoteNode(
  marker: NoteMarker,
  caller: string,
  category?: string,
  unknownAttributes?: UnknownAttributes,
): NoteNode {
  return $applyNodeReplacement(new NoteNode(marker, caller, category, unknownAttributes));
}

function isNoteElement(node: HTMLElement | null | undefined): boolean {
  if (!node) return false;

  const marker = node.getAttribute("data-marker") ?? "";
  return NoteNode.isValidMarker(marker) && node.classList.contains(NoteNode.getType());
}

export function $isNoteNode(node: LexicalNode | null | undefined): node is NoteNode {
  return node instanceof NoteNode;
}

export function isSerializedNoteNode(
  node: SerializedLexicalNode | null | undefined,
): node is SerializedNoteNode {
  return node?.type === NoteNode.getType();
}
