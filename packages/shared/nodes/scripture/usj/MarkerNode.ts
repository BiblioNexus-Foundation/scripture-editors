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
import { PLAIN_FONT_CLASS_NAME, closingMarkerText, openingMarkerText } from "./node.utils";

export const MARKER_VERSION = 1;

export type MarkerUsxStyle = string;

export type SerializedMarkerNode = Spread<
  {
    usxStyle: MarkerUsxStyle;
    isOpening?: boolean;
  },
  SerializedTextNode
>;

export class MarkerNode extends TextNode {
  __usxStyle: MarkerUsxStyle;
  __isOpening: boolean;

  constructor(usxStyle: MarkerUsxStyle, isOpening = true, key?: NodeKey) {
    const text = isOpening ? openingMarkerText(usxStyle) : closingMarkerText(usxStyle);
    super(text, key);
    this.__usxStyle = usxStyle;
    this.__isOpening = isOpening;
  }

  static getType(): string {
    return "marker";
  }

  static clone(node: MarkerNode): MarkerNode {
    return new MarkerNode(node.__usxStyle, node.__isOpening, node.__key);
  }

  static importJSON(serializedNode: SerializedMarkerNode): MarkerNode {
    const { usxStyle, isOpening, detail, format, mode, style } = serializedNode;
    const node = $createMarkerNode(usxStyle, isOpening);
    node.setDetail(detail);
    node.setFormat(format);
    node.setMode(mode);
    node.setStyle(style);
    return node;
  }

  setUsxStyle(usxStyle: MarkerUsxStyle): void {
    const self = this.getWritable();
    self.__usxStyle = usxStyle;
  }

  getUsxStyle(): MarkerUsxStyle {
    const self = this.getLatest();
    return self.__usxStyle;
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
    dom.setAttribute("data-usx-style", this.__usxStyle);
    dom.classList.add(
      this.getType(),
      this.__isOpening ? "opening" : "closing",
      PLAIN_FONT_CLASS_NAME,
    );
    return dom;
  }

  exportJSON(): SerializedMarkerNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      text: this.getTextContent(),
      usxStyle: this.getUsxStyle(),
      isOpening: this.getIsOpening(),
      version: MARKER_VERSION,
    };
  }
}

export function $createMarkerNode(usxStyle: MarkerUsxStyle, isOpening?: boolean): MarkerNode {
  return $applyNodeReplacement(new MarkerNode(usxStyle, isOpening));
}

export function $isMarkerNode(node: LexicalNode | null | undefined): node is MarkerNode {
  return node instanceof MarkerNode;
}
