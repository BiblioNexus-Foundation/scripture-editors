import { BlockNode } from "./BlockNode";
import { InlineNode } from "./InlineNode";
import { Klass, LexicalNode, LexicalNodeReplacement } from "lexical";

const nodes = [BlockNode, InlineNode];

export const scriptureNodes = <Array<Klass<LexicalNode> | LexicalNodeReplacement>>[...nodes];

export default nodes;
