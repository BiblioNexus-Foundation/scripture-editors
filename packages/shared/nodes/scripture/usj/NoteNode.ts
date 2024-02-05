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
const VALID_NOTE_STYLES = [
  // Footnote
  "f",
  "fe",
  "ef",
  // Cross Reference
  "x",
  "ex",
] as const;

export type NoteUsxStyle = (typeof VALID_NOTE_STYLES)[number];

export type SerializedNoteNode = Spread<
  {
    usxStyle: NoteUsxStyle;
    caller: string;
    category?: string;
  },
  SerializedElementNode
>;

export const NOTE_VERSION = 1;

export class NoteNode extends ElementNode {
  __usxStyle: NoteUsxStyle;
  __caller: string;
  __category?: string;

  constructor(usxStyle: NoteUsxStyle, caller: string, category?: string, key?: NodeKey) {
    super(key);
    this.__usxStyle = usxStyle;
    this.__caller = caller;
    this.__category = category;
  }

  static getType(): string {
    return "note";
  }

  static clone(node: NoteNode): NoteNode {
    const { __usxStyle, __caller, __category, __key } = node;
    return new NoteNode(__usxStyle, __caller, __category, __key);
  }

  static importJSON(serializedNode: SerializedNoteNode): NoteNode {
    const { usxStyle, caller, category } = serializedNode;
    const node = $createNoteNode(usxStyle, caller, category);
    return node;
  }

  static isValidStyle(style: string): boolean {
    return VALID_NOTE_STYLES.includes(style as NoteUsxStyle);
  }

  setUsxStyle(usxStyle: NoteUsxStyle): void {
    const self = this.getWritable();
    self.__usxStyle = usxStyle;
  }

  getUsxStyle(): NoteUsxStyle {
    const self = this.getLatest();
    return self.__usxStyle;
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
    dom.setAttribute("data-usx-style", this.__usxStyle);
    dom.classList.add(this.getType(), `usfm_${this.__usxStyle}`);
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
      usxStyle: this.getUsxStyle(),
      caller: this.getCaller(),
      category: this.getCategory(),
      version: NOTE_VERSION,
    };
  }
}

export const noteNodeName = Symbol.for(NoteNode.name);

export function $createNoteNode(
  usxStyle: NoteUsxStyle,
  caller: string,
  category?: string,
): NoteNode {
  return $applyNodeReplacement(new NoteNode(usxStyle, caller, category));
}

export function $isNoteNode(node: LexicalNode | null | undefined): node is NoteNode {
  return node instanceof NoteNode;
}
