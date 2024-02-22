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
const VALID_MILESTONE_MARKERS = [
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

export const MILESTONE_VERSION = 1;

export type MilestoneMarker = (typeof VALID_MILESTONE_MARKERS)[number];

export type SerializedMilestoneNode = Spread<
  {
    marker: MilestoneMarker;
    sid?: string;
    eid?: string;
  },
  SerializedLexicalNode
>;

export class MilestoneNode extends DecoratorNode<void> {
  __marker: MilestoneMarker;
  __sid?: string;
  __eid?: string;

  constructor(marker: MilestoneMarker, sid?: string, eid?: string, key?: NodeKey) {
    super(key);
    this.__marker = marker;
    this.__sid = sid;
    this.__eid = eid;
  }

  static getType(): string {
    return "ms";
  }

  static clone(node: MilestoneNode): MilestoneNode {
    const { __marker, __sid, __eid, __key } = node;
    return new MilestoneNode(__marker, __sid, __eid, __key);
  }

  static importJSON(serializedNode: SerializedMilestoneNode): MilestoneNode {
    const { marker, sid, eid } = serializedNode;
    const node = $createMilestoneNode(marker, sid, eid);
    return node;
  }

  static isValidMarker(marker: string): boolean {
    return VALID_MILESTONE_MARKERS.includes(marker as MilestoneMarker) || marker.startsWith("z");
  }

  setMarker(marker: MilestoneMarker): void {
    const self = this.getWritable();
    self.__marker = marker;
  }

  getMarker(): MilestoneMarker {
    const self = this.getLatest();
    return self.__marker;
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
    dom.setAttribute("data-marker", this.__marker);
    dom.classList.add(this.getType(), `usfm_${this.__marker}`);
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
      marker: this.getMarker(),
      sid: this.getSid(),
      eid: this.getEid(),
      version: MILESTONE_VERSION,
    };
  }
}

export function $createMilestoneNode(
  marker: MilestoneMarker,
  sid?: string,
  eid?: string,
): MilestoneNode {
  return $applyNodeReplacement(new MilestoneNode(marker, sid, eid));
}

export function $isMilestoneNode(node: LexicalNode | null | undefined): node is MilestoneNode {
  return node instanceof MilestoneNode;
}
