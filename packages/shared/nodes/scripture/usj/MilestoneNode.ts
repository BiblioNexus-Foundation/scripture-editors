/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#ms */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  DecoratorNode,
  SerializedLexicalNode,
  Spread,
} from "lexical";

/** @see https://ubsicap.github.io/usx/msstyles.html */
const VALID_MILESTONE_STYLES = [
  "ts-s",
  "ts-e",
  "t-s",
  "t-e",
  "ts",
  "qt1-s",
  "qt1-e",
  "qt2-s",
  "qt2-e",
  "qt3-s",
  "qt3-e",
  "qt4-s",
  "qt4-e",
  "qt5-s",
  "qt5-e",
  "qts",
  "qte",
  "qt-s",
  "qt-e",
] as const;

export const MILESTONE_ELEMENT_NAME = "ms";

export const MILESTONE_VERSION = 1;

export type MilestoneUsxStyle = (typeof VALID_MILESTONE_STYLES)[number];

export type SerializedMilestoneNode = Spread<
  {
    usxStyle: MilestoneUsxStyle;
    sid?: string;
    eid?: string;
  },
  SerializedLexicalNode
>;

export class MilestoneNode extends DecoratorNode<void> {
  __usxStyle: MilestoneUsxStyle;
  __sid?: string;
  __eid?: string;

  constructor(usxStyle: MilestoneUsxStyle, sid?: string, eid?: string, key?: NodeKey) {
    super(key);
    this.__usxStyle = usxStyle;
    this.__sid = sid;
    this.__eid = eid;
  }

  static getType(): string {
    return "milestone";
  }

  static clone(node: MilestoneNode): MilestoneNode {
    const { __usxStyle, __sid, __eid, __key } = node;
    return new MilestoneNode(__usxStyle, __sid, __eid, __key);
  }

  static importJSON(serializedNode: SerializedMilestoneNode): MilestoneNode {
    const { usxStyle, sid, eid } = serializedNode;
    const node = $createMilestoneNode(usxStyle, sid, eid);
    return node;
  }

  static isValidStyle(style: string): boolean {
    return VALID_MILESTONE_STYLES.includes(style as MilestoneUsxStyle) || style.startsWith("z");
  }

  setUsxStyle(usxStyle: MilestoneUsxStyle): void {
    const self = this.getWritable();
    self.__usxStyle = usxStyle;
  }

  getUsxStyle(): MilestoneUsxStyle {
    const self = this.getLatest();
    return self.__usxStyle;
  }

  setSid(sid: string | undefined): void {
    const self = this.getWritable();
    self.__sid = sid;
  }

  getSid(): string | undefined {
    const self = this.getLatest();
    return self.__sid;
  }

  setEid(eid: string | undefined): void {
    const self = this.getWritable();
    self.__eid = eid;
  }

  getEid(): string | undefined {
    const self = this.getLatest();
    return self.__eid;
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("span");
    dom.setAttribute("data-usx-style", this.__usxStyle);
    dom.classList.add(this.getType(), `usfm_${this.__usxStyle}`);
    return dom;
  }

  updateDOM(): boolean {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }

  decorate(): string {
    return "";
  }

  exportJSON(): SerializedMilestoneNode {
    return {
      type: this.getType(),
      usxStyle: this.getUsxStyle(),
      sid: this.getSid(),
      eid: this.getEid(),
      version: MILESTONE_VERSION,
    };
  }
}

export function $createMilestoneNode(
  usxStyle: MilestoneUsxStyle,
  sid?: string,
  eid?: string,
): MilestoneNode {
  return $applyNodeReplacement(new MilestoneNode(usxStyle, sid, eid));
}

export function $isMilestoneNode(node: LexicalNode | null | undefined): node is MilestoneNode {
  return node instanceof MilestoneNode;
}
