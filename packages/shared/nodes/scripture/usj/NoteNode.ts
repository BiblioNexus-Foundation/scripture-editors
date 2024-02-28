/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#note */

import {
  type NodeKey,
  ElementNode,
  SerializedElementNode,
  Spread,
  $applyNodeReplacement,
  LexicalNode,
} from "lexical";

/** @see https://ubsicap.github.io/usx/notes.html */
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
  },
  SerializedElementNode
>;

export const NOTE_VERSION = 1;

export class NoteNode extends ElementNode {
  __marker: NoteMarker;
  __caller: string;
  __category?: string;

  constructor(marker: NoteMarker, caller: string, category?: string, key?: NodeKey) {
    super(key);
    this.__marker = marker;
    this.__caller = caller;
    this.__category = category;
  }

  static getType(): string {
    return "note";
  }

  static clone(node: NoteNode): NoteNode {
    const { __marker, __caller, __category, __key } = node;
    return new NoteNode(__marker, __caller, __category, __key);
  }

  static importJSON(serializedNode: SerializedNoteNode): NoteNode {
    const { marker, caller, category } = serializedNode;
    const node = $createNoteNode(marker, caller, category);
    return node;
  }

  static isValidMarker(marker: string): boolean {
    return VALID_NOTE_MARKERS.includes(marker as NoteMarker);
  }

  setMarker(marker: NoteMarker): void {
    const self = this.getWritable();
    self.__marker = marker;
  }

  getMarker(): NoteMarker {
    const self = this.getLatest();
    return self.__marker;
  }

  setCaller(caller: string): void {
    const self = this.getWritable();
    self.__caller = caller;
  }

  getCaller(): string {
    const self = this.getLatest();
    return self.__caller;
  }

  setCategory(category: string | undefined): void {
    const self = this.getWritable();
    self.__category = category;
  }

  getCategory(): string | undefined {
    const self = this.getLatest();
    return self.__category;
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("span");
    dom.setAttribute("data-marker", this.__marker);
    dom.classList.add(this.getType(), `usfm_${this.__marker}`);
    dom.setAttribute("data-caller", this.__caller);
    return dom;
  }

  updateDOM(): boolean {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }

  exportJSON(): SerializedNoteNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      marker: this.getMarker(),
      caller: this.getCaller(),
      category: this.getCategory(),
      version: NOTE_VERSION,
    };
  }
}

export const noteNodeName = Symbol.for(NoteNode.name);

export function $createNoteNode(marker: NoteMarker, caller: string, category?: string): NoteNode {
  return $applyNodeReplacement(new NoteNode(marker, caller, category));
}

export function $isNoteNode(node: LexicalNode | null | undefined): node is NoteNode {
  return node instanceof NoteNode;
}
