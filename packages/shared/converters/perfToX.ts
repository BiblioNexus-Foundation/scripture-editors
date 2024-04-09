import {
  BlockStructure,
  ContentElementStructure,
  PerfBlockConstraint,
  PerfDocument,
  PerfSequenceConstraint,
  SequenceStructure,
} from "../plugins/PerfOperations/perfTypes";
import { pushToArray, handleSubtypeNS } from "./utils";
import {
  PerfBlock,
  PerfContentElement,
  PerfKind,
  PerfSequence,
} from "../plugins/PerfOperations/types";

/**
 * Structure of nodes in PERF
 * @link https://github.com/Proskomma/proskomma-json-tools/tree/main/src/schema/structure/0_4_0
 */

export type TypeKey = NonNullable<
  | PerfSequenceConstraint["type"]
  | PerfBlockConstraint["type"]
  | ContentElementStructure["type"]
  | "text"
>;

export type SequenceBuildSource<T> = {
  metadata: { kind: PerfKind.Sequence; path: string; sequenceId: string };
  props: Omit<SequenceStructure, "blocks"> & { subtype: "sequence" };
  children?: T[];
};

export type BlockBuildSource<T> = {
  metadata: { kind: PerfKind.Block; path: string; direction: { value: "ltr" | "rtl" | null } };
  props: Omit<BlockStructure, "content">;
  children?: T[];
};

export type ContentElementBuildSource<T> = {
  metadata: {
    kind: PerfKind.ContentElement;
    path: string;
    direction: { value: "ltr" | "rtl" | null };
  };
  props: Omit<ContentElementStructure, "content" | "meta_content">;
  children?: T[];
};

export type ContentTextBuildSource = {
  metadata: {
    kind: PerfKind.ContentText;
    path: string;
    direction: { value: "ltr" | "rtl" | null };
  };
  props: Omit<ContentElementStructure, "content" | "meta_content" | "type"> & {
    type: "text";
    text?: string;
  };
};

export type NodeBuildSource<SourceType, NodeType> = SourceType extends PerfKind.Sequence
  ? SequenceBuildSource<NodeType>
  : SourceType extends PerfKind.Block
    ? BlockBuildSource<NodeType>
    : SourceType extends PerfKind.ContentElement
      ? ContentElementBuildSource<NodeType>
      : ContentTextBuildSource;

export type NodeBuilder<SourceType, NodeType> = (
  props: NodeBuildSource<SourceType, NodeType>,
) => NodeType;

export const convertPerf = <TargetType>({
  perfDocument,
  nodeBuilder,
}: {
  perfDocument: PerfDocument;
  nodeBuilder: NodeBuilder<PerfKind.Sequence, TargetType>;
}) => {
  if (!perfDocument.sequences) throw new Error("No sequences found in the PERF document");
  const sequences = perfDocument.sequences;
  return {
    ...perfDocument,
    sequences: Object.keys(sequences).reduce(
      (convertedSequences: { [key: string]: TargetType }, sequenceId) => {
        convertedSequences[sequenceId] = convertSequence({
          sequence: sequences[sequenceId],
          sequenceId,
          nodeBuilder,
        });
        return convertedSequences;
      },
      {},
    ),
  };
};

export const convertSequence = <TargetType>({
  sequence,
  sequenceId,
  nodeBuilder: buildNode,
}: {
  sequence: PerfSequence;
  sequenceId: string;
  nodeBuilder: NodeBuilder<
    PerfKind.Sequence | PerfKind.Block | PerfKind.ContentElement | PerfKind.ContentText,
    TargetType
  >;
}) => {
  if (!sequence.blocks) throw new Error("Sequence must have blocks??");
  const { blocks, ...props } = sequence;
  const path = `$.sequences.${sequenceId}`;
  const convertedBlocks: TargetType[] = [];
  const children = (blocks as PerfBlock[])?.reduce(
    (convertedBlocks, block, index) =>
      ((convertedBlock) =>
        convertedBlock ? pushToArray(convertedBlocks, convertedBlock) : convertedBlocks)(
        convertBlock({
          block,
          nodeBuilder: buildNode,
          path: path + `.blocks[${index}]`,
        }),
      ),
    convertedBlocks,
  );
  return buildNode({
    metadata: {
      path,
      kind: PerfKind.Sequence,
      sequenceId,
    },
    props: { ...props, subtype: "sequence" },
    children,
  });
};

export const convertBlock = <TargetType>({
  block,
  nodeBuilder: buildNode,
  path = "",
}: {
  block: PerfBlock;
  nodeBuilder: NodeBuilder<
    PerfKind.Block | PerfKind.ContentElement | PerfKind.ContentText,
    TargetType
  >;
  path?: string;
}) => {
  const { type, subtype, content, ...props } = block;

  const subtypes = subtype ? handleSubtypeNS(subtype) : "";
  const { convertedContentNodes, direction } = getContents({
    content: content as PerfContentElement[],
    nodeBuilder: buildNode,
    path,
  });
  return buildNode({
    metadata: {
      path: path,
      kind: PerfKind.Block,
      direction,
    },
    props: { type, ...subtypes, ...props },
    children: convertedContentNodes,
  });
};

const setTextDirection = (dir: { value: "rtl" | "ltr" | null }, contentItem: string) => {
  if (dir.value === undefined) dir.value = getTextDirection(contentItem);
  return dir;
};

function convertContentItem<TargetType>(
  contentItem: string | PerfContentElement,
  buildNode: NodeBuilder<PerfKind.ContentText | PerfKind.ContentElement, TargetType>,
  contentPath: string,
  direction: { value: null | "rtl" | "ltr" },
): TargetType | undefined {
  if (typeof contentItem === "string") {
    return buildNode({
      metadata: {
        path: contentPath,
        kind: PerfKind.ContentText,
        direction: setTextDirection(direction, contentItem),
      },
      props: { text: contentItem, type: "text" },
    });
  } else {
    return convertContentElement({
      element: contentItem,
      nodeBuilder: buildNode,
      path: contentPath,
    });
  }
}

export const getContents = <TargetType>({
  content,
  nodeBuilder: buildNode,
  path = "",
}: {
  content: PerfContentElement[];
  nodeBuilder: NodeBuilder<PerfKind.ContentText | PerfKind.ContentElement, TargetType>;
  path?: string;
}): {
  convertedContentNodes: TargetType[];
  direction: {
    value: null | "rtl" | "ltr";
  };
} => {
  if (!content) {
    return { convertedContentNodes: [], direction: { value: null } };
  }

  const initialAccumulator: {
    convertedContentNodes: NonNullable<TargetType>[];
    direction: { value: null | "rtl" | "ltr" };
  } = { convertedContentNodes: [], direction: { value: null } };

  return content.reduce(({ convertedContentNodes, direction }, contentItem, index) => {
    const contentPath = `${path}.content[${index}]`;
    const convertedContentNode = convertContentItem(contentItem, buildNode, contentPath, direction);

    return {
      convertedContentNodes: convertedContentNode
        ? [...convertedContentNodes, convertedContentNode]
        : convertedContentNodes,
      direction,
    };
  }, initialAccumulator);
};

export const convertContentElement = <TargetType>({
  element,
  nodeBuilder: buildNode,
  path = "",
}: {
  element: PerfContentElement;
  nodeBuilder: NodeBuilder<PerfKind.ContentElement | PerfKind.ContentText, TargetType>;
  path?: string;
}) => {
  const { type, subtype, content, meta_content, ...props } = element as PerfContentElement & {
    content: PerfContentElement[];
    meta_content?: PerfContentElement[];
  };
  const subtypes = subtype ? handleSubtypeNS(subtype) : "";
  const { convertedContentNodes, direction } = getContents({
    content,
    nodeBuilder: buildNode,
    path,
  });

  const converters = {
    wrapper: () => convertedContentNodes,
    //extend if new content types converters are needed. e.g:
    //mark: ...,
    //graft: ...,
  };

  const convertContents = converters[type as keyof typeof converters];
  const children = convertContents ? convertContents() : [];

  return buildNode({
    metadata: {
      path,
      kind: PerfKind.ContentElement,
      direction,
    },
    props: {
      type,
      ...subtypes,
      ...props,
      ...(meta_content
        ? {
            metaContent: getContents({
              content: meta_content,
              nodeBuilder: buildNode,
              path,
            }),
          }
        : undefined),
    },
    children,
  });
};

const RTL = "\\u0591-\\u07FF\\uFB1D-\\uFDFD\\uFE70-\\uFEFC";
const LTR =
  "A-Za-z\\u00C0-\\u00D6\\u00D8-\\u00F6" +
  "\\u00F8-\\u02B8\\u0300-\\u0590\\u0800-\\u1FFF\\u200E\\u2C00-\\uFB1C" +
  "\\uFE00-\\uFE6F\\uFEFD-\\uFFFF";

// eslint-disable-next-line no-misleading-character-class
export const RTL_REGEX = new RegExp("^[^" + LTR + "]*[" + RTL + "]");
// eslint-disable-next-line no-misleading-character-class
export const LTR_REGEX = new RegExp("^[^" + RTL + "]*[" + LTR + "]");

export function getTextDirection(text: string) {
  if (RTL_REGEX.test(text)) {
    return "rtl";
  }
  if (LTR_REGEX.test(text)) {
    return "ltr";
  }
  return null;
}

export default convertPerf;
