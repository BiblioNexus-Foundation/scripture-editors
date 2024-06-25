/** Marker node used when displaying USFM */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  TextNode,
  SerializedTextNode,
  Spread,
  EditorConfig,
} from "lexical";
import { closingMarkerText, openingMarkerText } from "./node.utils";

export const MARKER_VERSION = 1;

export type SerializedMarkerNode = Spread<
  {
    marker: MarkerMarker;
    isOpening?: boolean;
  },
  SerializedTextNode
>;

type MarkerMarker = string;

export class MarkerNode extends TextNode {
  __marker: MarkerMarker;
  __isOpening: boolean;

  constructor(marker: MarkerMarker, isOpening = true, key?: NodeKey) {
    const text = isOpening ? openingMarkerText(marker) : closingMarkerText(marker);
    super(text, key);
    this.__marker = marker;
    this.__isOpening = isOpening;
  }

  static getType(): string {
    return "marker";
  }

  static clone(node: MarkerNode): MarkerNode {
    return new MarkerNode(node.__marker, node.__isOpening, node.__key);
  }

  static importJSON(serializedNode: SerializedMarkerNode): MarkerNode {
    const { marker, isOpening, detail, format, mode, style } = serializedNode;
    const node = $createMarkerNode(marker, isOpening);
    node.setDetail(detail);
    node.setFormat(format);
    node.setMode(mode);
    node.setStyle(style);
    return node;
  }

  setMarker(marker: MarkerMarker): void {
    const self = this.getWritable();
    self.__marker = marker;
  }

  getMarker(): MarkerMarker {
    const self = this.getLatest();
    return self.__marker;
  }

  setIsOpening(isOpening: boolean): void {
    const self = this.getWritable();
    self.__isOpening = isOpening;
  }

  getIsOpening(): boolean {
    const self = this.getLatest();
    return self.__isOpening;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.setAttribute("data-marker", this.__marker);
    dom.classList.add(this.__type, this.__isOpening ? "opening" : "closing");
    return dom;
  }

  exportJSON(): SerializedMarkerNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      text: this.getTextContent(),
      marker: this.getMarker(),
      isOpening: this.getIsOpening(),
      version: MARKER_VERSION,
    };
  }
}

export function $createMarkerNode(marker: MarkerMarker, isOpening?: boolean): MarkerNode {
  return $applyNodeReplacement(new MarkerNode(marker, isOpening));
}

export function $isMarkerNode(node: LexicalNode | null | undefined): node is MarkerNode {
  return node instanceof MarkerNode;
}
