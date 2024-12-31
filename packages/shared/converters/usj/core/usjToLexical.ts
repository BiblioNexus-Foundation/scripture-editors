import { SerializedLexicalNode, SerializedRootNode, SerializedTextNode } from "lexical";
import { UsjCharType, UsjDocument, UsjInlineNode, UsjNode, UsjTypes } from "./usj";
import { convertUsjNode, MetadataBuilder, NodeMetadata, UsjTextNode } from "./usjToX";
import { SerializedInlineNode } from "../../../nodes/InlineNode";
import { SerializedBlockNode } from "../../../nodes/scripture/generic/BlockNode";

export type Output = {
  result: SerializedLexicalNode | null;
  [key: string]: unknown;
};

export type UsjMapCreator = <T extends Output>(output: T) => UsjMap;

export const transformUsjToLexical = (
  node: UsjNode,
  usjMapCreator: UsjMapCreator,
  metadataBuilder: MetadataBuilder<SerializedLexicalNode> = (props) => props.metadata,
): Output => {
  const output: Output = { result: null };
  const result = convertUsjNode<SerializedLexicalNode>({
    node,
    nodeBuilder: (builderProps) => {
      const { nodeProps, metadata, convertedContent } = builderProps;
      return usjNodeBuilder({
        nodeProps,
        metadata,
        convertedContent,
        output,
        usjMapCreator,
      });
    },
    metadataBuilder,
  });

  output.result ??= result;
  return output;
};

const usjNodeBuilder = ({
  output,
  nodeProps,
  metadata,
  convertedContent,
  usjMapCreator,
}: {
  output: Output;
  nodeProps: Omit<UsjNode, "content"> | UsjTextNode;
  metadata: NodeMetadata<SerializedLexicalNode>;
  convertedContent?: SerializedLexicalNode[];
  usjMapCreator: UsjMapCreator;
}): SerializedLexicalNode | null => {
  const usjProps = nodeProps;
  const usjMap = usjMapCreator(output);
  return (
    mapUsj({
      nodeProps: usjProps,
      convertedContent,
      usjMap,
      metadata,
    }) ?? null
  );
};

const mapUsj = ({
  nodeProps,
  convertedContent,
  usjMap,
  metadata,
}: {
  nodeProps: Omit<UsjNode, "content"> | UsjTextNode;
  convertedContent?: SerializedLexicalNode[];
  usjMap: UsjMap;
  metadata: NodeMetadata<SerializedLexicalNode>;
}): SerializedLexicalNode | undefined => {
  const maps = [usjMap[nodeProps?.type], usjMap.default];
  const map = maps.find((map) => map !== undefined);
  if (typeof map !== "function") {
    throw new Error(`No map found for node type: ${nodeProps?.type}`);
  }
  return map({
    nodeProps: nodeProps as never,
    convertedContent,
    metadata,
  });
};

//Lexical node types used:
// - root
// - scriptureNote
// - scriptureParagraph
// - scriptureTable
// - scriptureSidebar
// - scriptureChapter
// - scriptureBook

export type UsjMap = {
  default: (props: {
    nodeProps: Omit<UsjNode, "content"> | UsjTextNode;
    convertedContent?: SerializedLexicalNode[];
    metadata: NodeMetadata<SerializedLexicalNode>;
  }) => SerializedLexicalNode | undefined;
  USJ?: (props: {
    nodeProps: Omit<UsjDocument, "content">;
    convertedContent?: SerializedLexicalNode[];
  }) => SerializedRootNode | undefined;
  text?: (props: {
    nodeProps: UsjTextNode;
    metadata: NodeMetadata<SerializedLexicalNode>;
  }) => SerializedTextNode | undefined;
} & StructuralNodeBuilders &
  InlineNodeBuilders;

type StructuralNodeBuilders = {
  [K in keyof typeof UsjTypes.structural]?: (props: {
    nodeProps: Extract<UsjNode, { type: K }>;
    convertedContent?: SerializedLexicalNode[];
    metadata: NodeMetadata<SerializedLexicalNode>;
  }) => SerializedBlockNode | undefined;
};

type InlineNodeProps<K> = Extract<UsjInlineNode, { type: K extends UsjCharType ? UsjCharType : K }>;

type InlineNodeBuilders = {
  [K in keyof typeof UsjTypes.inline]?: (props: {
    nodeProps: Omit<InlineNodeProps<K>, "content">;
    convertedContent?: SerializedLexicalNode[];
    metadata: NodeMetadata<SerializedLexicalNode>;
  }) => K extends "char" | "ms"
    ? SerializedTextNode | SerializedInlineNode | undefined
    : SerializedInlineNode | undefined;
};
