import { DecoratorNode, LexicalNode, NodeKey, SerializedLexicalNode } from "lexical";

export class ButtonNode extends DecoratorNode<HTMLButtonElement> {
  __id: string;

  static getType(): string {
    return "button";
  }

  static clone(node: ButtonNode): ButtonNode {
    return new ButtonNode(node.__id, node.__key);
  }

  isInline(): boolean {
    return true;
  }

  isIsolated(): boolean {
    return true;
  }

  constructor(id: string, key?: NodeKey) {
    super(key);
    this.__id = id;
  }

  createDOM(): HTMLElement {
    return document.createElement("div");
  }

  updateDOM(): false {
    return false;
  }

  decorate(): HTMLButtonElement {
    const element = document.createElement("button");
    element.setAttribute("id", this.__id);
    element.innerHTML = "Click me!";
    return element;
  }

  exportJSON(): SerializedLexicalNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      version: 1,
    };
  }
}

export function $createButtonNode(id: string): ButtonNode {
  return new ButtonNode(id);
}

export function $isButtonNode(node: LexicalNode | null | undefined): node is ButtonNode {
  return node instanceof ButtonNode;
}
