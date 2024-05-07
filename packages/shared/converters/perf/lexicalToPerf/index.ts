import { MetadataBuilder, NodeBuilderArgs, convertLexicalStateNode } from "../lexicalToX";
import { PerfKind } from "../../../plugins/PerfOperations/types";
import { SerializedElementNode, SerializedTextNode } from "lexical";
import { FlatDocument as PerfDocument } from "../../../plugins/PerfOperations/Types/Document";
import Sequence from "../../../plugins/PerfOperations/Types/Sequence";
import Block, { getBlockIfValid, isBlockGraft } from "../../../plugins/PerfOperations/Types/Block";
import ContentElement, {
  Content,
  getContentElementifValid,
  isContentElementGraft,
  isDivisionMark,
} from "../../../plugins/PerfOperations/Types/ContentElement";
import { SerializedUsfmElementNode } from "../../../nodes/UsfmElementNode";
import { Props, isChapterVerse } from "../../../plugins/PerfOperations/Types/utils";
import { getPerfElementPropsfromAttributes } from "../utils";

type ResultingPerf = Pick<PerfDocument, "sequences"> & {
  result?: Sequence | Block | ContentElement | SubtypedSequence;
};

type PerfMetadata = { kind?: PerfKind; type?: string };

type PerfNodeBuilderArgs<T> = NodeBuilderArgs<SerializedUsfmElementNode, T, PerfMetadata>;

export const transformLexicalStateToPerf = (
  lexicalStateNode: SerializedElementNode,
  kind: PerfKind,
): ResultingPerf => {
  const metadataBuilder: MetadataBuilder<PerfMetadata> = ({ node, metadata: _metadata }) => {
    const metadata = { ..._metadata };
    if (node.type === "text") return { ...metadata, kind: PerfKind.ContentText };
    if (metadata.type === "graft") return { ...metadata, type: node.type, kind: PerfKind.Block };
    metadata.kind = !metadata.kind
      ? kind
      : metadata.kind === PerfKind.Sequence
        ? PerfKind.Block
        : PerfKind.ContentElement;
    metadata.type = node.type;
    return metadata;
  };
  // const nodeBuilder =

  const perf: ResultingPerf = { sequences: {} };
  const result = convertLexicalStateNode({
    node: lexicalStateNode,
    metadataBuilder,
    nodeBuilder: (props) => {
      const { node, metadata, children } = props;
      return perfNodeBuilder({
        node,
        metadata,
        // TODO: REMOVE AS KEYWORD
        children: children as (Content | Block[])[] | undefined,
        perfKind: metadata.kind as PerfKind,
        perf,
      });
    },
  });
  // TODO: REMOVE AS KEYWORD
  perf.result = result as typeof perf.result;
  return perf;
};

export default transformLexicalStateToPerf;

type ChildrenMap<K> = K extends PerfKind.Sequence ? Block[] : Content;

const perfNodeBuilder = <K extends PerfKind>({
  perf,
  perfKind,
  node,
  metadata,
  children,
}: PerfNodeBuilderArgs<ChildrenMap<K>> & {
  perf: ResultingPerf;
  perfKind: K;
}) => {
  const props = getPerfElementPropsfromAttributes(node.attributes);

  // TODO: REMOVE AS KEYWORD
  const perfProps = props as PropsMap<K>;

  const lexicalMap = createLexicalMap(perf);
  return mapLexical({
    lexicalNode: node,
    perfChildren: children,
    perfProps,
    perfKind,
    lexicalMap,
    metadata,
  });
};

const mapLexical = ({
  lexicalNode,
  perfChildren,
  perfProps,
  perfKind,
  lexicalMap,
  metadata,
}: MapLexicalProps) => {
  const maps = [lexicalMap[perfKind], lexicalMap.default];
  const map = maps.find((map) => map !== undefined);
  type C = Builder<PerfKindMap<typeof perfKind>, typeof perfChildren, typeof perfKind>;
  return typeof map === "function"
    ? // TODO: REMOVE AS KEYWORD
      (map as unknown as C)({
        lexicalNode,
        perfChildren,
        perfProps,
        perfKind,
        metadata,
      })
    : { lexicalNode, perfChildren, perfProps, perfKind };
};

type SubtypedSequence = Sequence & { subtype?: Sequence["type"] };

type PropsMap<K> = K extends PerfKind.Sequence
  ? Props<SubtypedSequence>
  : K extends PerfKind.Block
    ? Props<Block>
    : Props<ContentElement>;

type MapLexicalProps<K = PerfKind> = {
  perfKind: K;
  perfChildren: PerfNodeBuilderArgs<ChildrenMap<K>>["children"];
  perfProps: PropsMap<K>;
  lexicalNode: SerializedUsfmElementNode;
  lexicalMap: LexicalMap;
  metadata: PerfNodeBuilderArgs<ChildrenMap<K>>["metadata"];
}; // Replace with actual type

type PerfLexicalMap<Key> = Key extends PerfKind.Sequence
  ? SerializedUsfmElementNode
  : Key extends PerfKind.Block
    ? SerializedUsfmElementNode
    : Key extends PerfKind.ContentElement
      ? SerializedUsfmElementNode
      : Key extends PerfKind.ContentText
        ? SerializedTextNode
        : never;

type Builder<T, C, K = PerfKind> = (args: {
  perfKind: K;
  perfProps: Props<T>;
  perfChildren: C;
  lexicalNode: PerfLexicalMap<K>;
  metadata: PerfNodeBuilderArgs<ChildrenMap<K>>["metadata"];
}) => T;

type SequenceBuilder<K> = Builder<SubtypedSequence, Block[], K>;
type BlockBuilder<K> = Builder<Block, Content, K>;
type ContentElementBuilder<K> = Builder<ContentElement, Content, K>;
type ContentTextBuilder<K> = Builder<string, never, K>;

type BuilderMap<Key> = Key extends PerfKind.Sequence
  ? SequenceBuilder<Key>
  : Key extends PerfKind.Block
    ? BlockBuilder<Key>
    : Key extends PerfKind.ContentElement
      ? ContentElementBuilder<Key>
      : Key extends PerfKind.ContentText
        ? ContentTextBuilder<Key>
        : never;

type PerfKindMap<Key> = Key extends PerfKind.Sequence
  ? SubtypedSequence
  : Key extends PerfKind.Block
    ? Block
    : Key extends PerfKind.ContentElement
      ? ContentElement
      : Key extends PerfKind.ContentText
        ? string
        : never;

type MappedNodeBuilder<k> = BuilderMap<k> | PerfKindMap<k>;

type LexicalMap = {
  default: MappedNodeBuilder<PerfKind.Sequence>;
} & { [key in PerfKind]?: MappedNodeBuilder<key> };

const createLexicalMap = (perf: ResultingPerf): LexicalMap => ({
  default: ({ lexicalNode, perfChildren, perfKind }) => {
    console.log({ lexicalNode });
    if (lexicalNode?.type === "root") return { type: "main", blocks: perfChildren };
    throw new Error(`unhandled perfKind: ${perfKind}`);
  },
  sequence: ({ perfChildren, perfProps, lexicalNode }) => {
    console.log({ lexicalNode });
    return {
      type: perfProps.subtype ?? "main",
      blocks: perfChildren,
    };
  },
  block: ({ perfChildren, perfProps, lexicalNode }) => {
    const block = getBlockIfValid(perfProps);
    if (!block) {
      console.log(lexicalNode);
      throw new Error("Block is not valid");
    }
    if (isBlockGraft(block)) {
      return buildSequenceFromGraft({
        perf,
        data: block,
        // TODO: REMOVE AS KEYWORD
        children: perfChildren as Block[],
      });
    }
    return {
      ...block,
      content: perfChildren,
    };
  },
  contentElement: ({ perfChildren, perfProps }) => {
    const element = getContentElementifValid(perfProps);
    if (!element) {
      throw new Error("ContentElement is not valid");
    }
    if (isContentElementGraft(element))
      return buildSequenceFromGraft({
        perf,
        data: element,
        // TODO: REMOVE AS KEYWORD
        children: perfChildren as Block[],
      });
    if (isDivisionMark(element)) {
      const markNumber = isChapterVerse(perfChildren[0]) ? perfChildren[0] : element.atts.number;
      return { ...element, atts: { ...element.atts, number: markNumber } };
    }
    return {
      ...element,
      content: perfChildren?.length ? perfChildren : [],
    };
  },
  contentText: ({ lexicalNode }) => {
    return lexicalNode.text;
  },
});

const buildSequenceFromGraft = <T extends Block | ContentElement>({
  perf,
  data,
  children,
}: {
  perf: Pick<ResultingPerf, "sequences">;
  data: T;
  children: Block[];
}): T => {
  if (data.type !== "graft" || !data.subtype) {
    console.error({ graftNode: data });
    throw new Error("Graft node must have a subtype");
  }

  if (!("target" in data) || !data.target) {
    throw new Error("Graft node must have a target");
  }

  (perf.sequences ??= {})[data.target] = {
    type: data.subtype,
    blocks: children,
  };

  return { ...data };
};
