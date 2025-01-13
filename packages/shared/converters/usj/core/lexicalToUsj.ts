import { SerializedLexicalNode, SerializedRootNode, SerializedTextNode } from "lexical";
import { UsjChar, UsjDocument, UsjNode, UsjTypes } from "./usj";
import {
  BaseMetadata,
  convertLexicalStateNode,
  MetadataBuilder,
  OptionalMetadata,
} from "../../perf/lexicalToX";
import { SerializedBlockNode } from "../../../nodes/scripture/generic/BlockNode";
import { SerializedInlineNode } from "../../../nodes/InlineNode";
import {
  isSerializedScriptureElementNode,
  SerializedScriptureElementNode,
} from "../../../nodes/scripture/generic/ScriptureElementNode";

export type Output = {
  result: UsjNode | string | null;
  [key: string]: unknown;
};

export type LexicalMapCreator = <T extends Output>(output: T) => LexicalMap;

export const transformLexicalToUsj = (
  node: SerializedTextNode | SerializedScriptureElementNode | SerializedRootNode,
  lexicalMapCreator: LexicalMapCreator,
  metadataBuilder: MetadataBuilder = (props) => props.metadata,
): Output => {
  const output: Output = { result: null };
  const result = convertLexicalStateNode<
    SerializedTextNode | SerializedScriptureElementNode | SerializedRootNode,
    UsjNode | string,
    UsjNode
  >({
    node,
    nodeBuilder: (builderProps) => {
      const { node, metadata, children } = builderProps;
      return (
        lexicalNodeBuilder({
          node,
          metadata,
          children,
          output,
          lexicalMapCreator,
        }) ?? { type: "para", marker: "p", content: [] }
      );
    },
    metadataBuilder,
  });

  output.result ??= result ?? null;
  return output;
};

const lexicalNodeBuilder = ({
  output,
  node,
  metadata,
  children,
  lexicalMapCreator,
}: {
  output: Output;
  node: SerializedTextNode | SerializedScriptureElementNode | SerializedRootNode;
  metadata: NodeMetadata;
  children?: UsjNode[];
  lexicalMapCreator: LexicalMapCreator;
}): UsjNode | string | undefined => {
  const lexicalMap = lexicalMapCreator(output);
  return mapLexical({
    node,
    children,
    lexicalMap,
    metadata,
  });
};

const mapLexical = ({
  node,
  children,
  lexicalMap,
  metadata,
}: {
  node: SerializedTextNode | SerializedScriptureElementNode | SerializedRootNode;
  children?: UsjNode[];
  lexicalMap: LexicalMap;
  metadata: NodeMetadata;
}): UsjNode | string | undefined => {
  const nodeType =
    isSerializedScriptureElementNode(node) && node?.attributes?.["data-type"]
      ? node.attributes["data-type"]
      : (node.type as keyof LexicalMap);
  const maps = [lexicalMap[nodeType as keyof LexicalMap], lexicalMap.default];
  const map = maps.find((map) => map !== undefined);
  if (typeof map !== "function") {
    throw new Error(`No map found for node type: ${node.type}`);
  }
  return map({
    node: node as never,
    children,
    metadata,
  });
};

export type NodeMetadata = BaseMetadata<SerializedLexicalNode> & OptionalMetadata;

export type LexicalMap = {
  default: (props: {
    node: SerializedLexicalNode | SerializedScriptureElementNode;
    children?: UsjNode[];
    metadata: NodeMetadata;
  }) => UsjNode | string | undefined;
  root?: (props: {
    node: SerializedRootNode;
    children?: UsjNode[];
    metadata: NodeMetadata;
  }) => UsjDocument | undefined;
  text?: (props: { node: SerializedTextNode; metadata: NodeMetadata }) => string | undefined;
} & StructuralNodeBuilders &
  InlineNodeBuilders;

type StructuralNodeBuilders = {
  [K in keyof typeof UsjTypes.structural]?: (props: {
    node: SerializedBlockNode;
    children?: (UsjNode | string)[];
    metadata: NodeMetadata;
  }) => Extract<UsjNode, { type: K }> | undefined;
};

type InlineNodeBuilders = {
  [K in keyof typeof UsjTypes.inline]?: (props: {
    node: SerializedInlineNode;
    children?: (UsjNode | string)[];
    metadata: NodeMetadata;
  }) => K extends "char" ? UsjChar : Extract<UsjNode, { type: K }> | undefined;
};
