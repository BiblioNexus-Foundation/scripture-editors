import { BlockNode } from "./BlockNode";
import { InlineNode } from "./InlineNode";
import { Klass, LexicalNode, LexicalNodeReplacement } from "lexical";
import { ScriptureElementNode } from "./ScriptureElementNode.js";

const nodes = [BlockNode, InlineNode];

export const scriptureNodes = <Array<Klass<LexicalNode> | LexicalNodeReplacement>>[...nodes];

function $isScriptureElementNode(node?: LexicalNode): node is ScriptureElementNode {
  return node instanceof ScriptureElementNode;
}

export { $isScriptureElementNode, scriptureNodes as default };
