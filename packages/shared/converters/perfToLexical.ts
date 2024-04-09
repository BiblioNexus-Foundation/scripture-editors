import { SerializedElementNode, SerializedTextNode } from "lexical";
import {
  ContentElementStructure,
  PerfBlockConstraint,
  PerfDocument,
  PerfSequenceConstraint,
} from "../plugins/PerfOperations/perfTypes";
import {
  PerfBlock,
  PerfContentElement,
  PerfKind,
  PerfSequence,
  PerfSequences,
} from "../plugins/PerfOperations/types";
import {
  NodeBuildSource,
  NodeBuilder,
  TypeKey,
  convertBlock,
  convertContentElement,
  convertSequence,
} from "./perfToX";
import { SerializedUsfmElementNode } from "../nodes/UsfmElementNode";

type PerfLexicalNode = SerializedTextNode | SerializedElementNode | SerializedUsfmElementNode;

export const transformPerfDocumentToLexicalState = (
  perfDocument: PerfDocument,
  sequenceId: string,
  perfMap: PerfMap<PerfLexicalNode>,
) => {
  if (!perfDocument.sequences) throw new Error("No sequences found in the PERF document");
  return {
    root: convertSequence<PerfLexicalNode>({
      sequence: perfDocument.sequences[sequenceId],
      sequenceId,
      nodeBuilder: (props) =>
        mapPerf<
          PerfKind.Sequence | PerfKind.Block | PerfKind.ContentElement | PerfKind.ContentText,
          PerfLexicalNode
        >({
          buildSource: props,
          perfMap: perfMap ?? createPerfToLexicalMap(perfDocument.sequences),
        }),
    }),
  };
};
export default transformPerfDocumentToLexicalState;

export const DATA_PREFIX = "perf";

type NodeSource =
  | { node: PerfSequence; kind: PerfKind.Sequence; sequenceId?: string }
  | { node: PerfBlock; kind: PerfKind.Block }
  | { node: PerfContentElement; kind: PerfKind.ContentElement };

export function transformPerfNodeToLexicalNode({
  source,
  perfSequences,
  perfMap,
}: {
  source: NodeSource;
  perfSequences: PerfSequences;
  perfMap?: PerfMap<PerfLexicalNode>;
}) {
  const { node, kind } = source;

  const _perfMap = perfMap ?? createPerfToLexicalMap(perfSequences);

  if (kind === PerfKind.Sequence) {
    return convertSequence<PerfLexicalNode>({
      sequence: node,
      sequenceId: source.sequenceId ?? "",
      nodeBuilder: (buildSource) =>
        mapPerf<
          PerfKind.Sequence | PerfKind.Block | PerfKind.ContentElement | PerfKind.ContentText,
          PerfLexicalNode
        >({
          buildSource,
          perfMap: _perfMap,
        }),
    });
  }
  if (kind === PerfKind.Block) {
    return convertBlock<PerfLexicalNode>({
      block: node,
      nodeBuilder: (buildSource) =>
        mapPerf<PerfKind.Block | PerfKind.ContentElement | PerfKind.ContentText, PerfLexicalNode>({
          buildSource,
          perfMap: _perfMap,
        }),
    });
  }
  if (kind === "contentElement") {
    return convertContentElement<PerfLexicalNode>({
      element: node,
      nodeBuilder: (buildSource) =>
        mapPerf<PerfKind.ContentElement | PerfKind.ContentText, PerfLexicalNode>({
          buildSource,
          perfMap: _perfMap,
        }),
    });
  }
  throw new Error(`Unsupported kind: ${kind}`);
}

type TypeKeyMap<K> = K extends PerfSequenceConstraint["type"]
  ? PerfKind.Sequence
  : K extends PerfBlockConstraint["type"]
    ? PerfKind.Block
    : K extends ContentElementStructure["type"]
      ? PerfKind.ContentElement
      : K extends "text"
        ? PerfKind.ContentText
        : K extends "*"
          ? PerfKind.Block | PerfKind.Sequence | PerfKind.ContentElement
          : never;

type SubtypeKey = "sequence" | string;

type PerfSubtypeMap<S, T> = {
  [key: SubtypeKey]: NodeBuilder<S, T> | T;
};

type PerfMap<T> = {
  ["*"]: PerfSubtypeMap<TypeKeyMap<"*">, T> & { ["*"]: NodeBuilder<TypeKeyMap<"*">, T> | T };
  ["text"]: PerfSubtypeMap<TypeKeyMap<"text">, T>;
} & Partial<{
  [key in TypeKey]: PerfSubtypeMap<TypeKeyMap<key>, T>;
}>;

/** Maps types and subtypes of a PERF element (sequence,block, contentElement)
 * given map object (perfMap) and returns a transformation of that element.
 */
export const mapPerf = <SourceType, ResultType>({
  buildSource,
  perfMap,
}: {
  buildSource: NodeBuildSource<SourceType, ResultType>;
  perfMap: PerfMap<ResultType>;
}) => {
  // Ensure that a default transformation is provided
  if (!perfMap["*"]["*"])
    throw new Error(
      'No default transformation found, a property for `perfMap["*"]["*"]` is required.',
    );

  const { type = "*", subtype = "*" } = buildSource.props as {
    type: TypeKey;
    subtype?: SubtypeKey;
  };

  const maps = [
    perfMap[type]?.[subtype],
    perfMap["*"]?.[subtype],
    perfMap[type]?.["*"],
    perfMap["*"]["*"], //this will never be undefined,
  ];

  return ((map) =>
    typeof map === "function"
      ? (map as NodeBuilder<TypeKeyMap<typeof type>, ResultType>)(buildSource)
      : (map as ResultType))(maps.find((map) => map !== undefined));
};

/**
 * builds an object (perfMap) which maps perf elements by their type and subtype
 * this is needed for mapPerf() to assign a transformation
 * to a type/subtype combination.
 */
export const createPerfToLexicalMap = (perfSequences: PerfSequences): PerfMap<PerfLexicalNode> => ({
  "*": {
    "*": ({ props, metadata, ...args }): SerializedUsfmElementNode => {
      console.error(
        `No transformation found for type: ${props.type}, subtype: ${props?.subtype}`,
        props,
        metadata,
      );
      return {
        children: args.children ?? [],
        format: "",
        direction: metadata.kind === PerfKind.Sequence ? null : metadata.direction.value,
        type: "inline",
        version: 1,
        indent: 0,
        attributes: {
          ...getAttributesFromPerfElementProps(props),
          class: "unsupported",
        },
      };
    },
    sequence: function ({ props, metadata, ...args }): SerializedUsfmElementNode {
      return {
        children: args.children ?? [],
        format: "",
        direction: metadata.kind === PerfKind.Sequence ? null : metadata.direction.value,
        type: "inline",
        version: 1,
        indent: 0,
        attributes: {
          ...getAttributesFromPerfElementProps(props),
          class: "unsupported",
        },
      };
    },
  },
  main: {
    sequence: function ({ children = [] }): SerializedElementNode {
      return {
        children,
        direction: null,
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      };
    },
  },
  text: {
    "*": ({ props }): SerializedTextNode => {
      return {
        detail: 0,
        format: 0,
        mode: "normal",
        style: "",
        text: props.text || "",
        type: "text",
        version: 1,
      };
    },
  },
  graft: {
    "*": ({ props }): SerializedUsfmElementNode => {
      return {
        children:
          perfSequences !== undefined &&
          props.target !== undefined &&
          perfSequences[props.target] !== undefined
            ? (
                transformPerfNodeToLexicalNode({
                  source: {
                    kind: PerfKind.Sequence,
                    node: perfSequences[props.target],
                  },
                  perfSequences,
                }) as SerializedUsfmElementNode
              ).children
            : [],
        direction: null,
        format: "",
        indent: 0,
        type: "graft",
        version: 1,
        attributes: { ...getAttributesFromPerfElementProps(props) } as Record<string, string>,
        ...getTagFromSubtype({
          subtype: props.subtype,
          replacementMap: {
            title: "h1",
            introduction: "section",
            heading: "div",
            default: "span",
          },
        }),
      };
    },
  },
  paragraph: {
    "*": ({ props, children = [], metadata }): SerializedUsfmElementNode => {
      return {
        children: children,
        direction: metadata.direction.value,
        format: "",
        indent: 0,
        type: "usfmparagraph",
        version: 1,
        attributes: { ...getAttributesFromPerfElementProps(props), class: "paragraph" },
        ...getTagFromSubtype({
          subtype: props.subtype,
          replacementMap: {
            "\\w?mt(\\d*)$": "span",
            s: "h3",
            r: "strong",
            f: "span",
            default: "p",
          },
        }),
      };
    },
    x: ({ children, props, metadata: { direction } }): SerializedUsfmElementNode => ({
      children: children ?? [],
      direction: direction.value,
      format: "",
      indent: 0,
      type: "inline",
      version: 1,
      attributes: { ...getAttributesFromPerfElementProps(props), class: "x" },
      tag: "span",
    }),
  },
  wrapper: {
    "*": ({ children, props, metadata: { direction } }): SerializedUsfmElementNode => ({
      children: children ?? [],
      direction: direction.value,
      format: "",
      indent: 0,
      type: "inline",
      version: 1,
      attributes: { ...getAttributesFromPerfElementProps(props), class: "wrapper" },
      tag: "span",
    }),
  },
  mark: {
    ts: (): SerializedUsfmElementNode => ({
      indent: 0,
      direction: null,
      children: [],
      format: "",
      type: "usfmparagraph",
      version: 1,
    }),
    chapter: ({ props }): SerializedUsfmElementNode => {
      if (!props.atts) throw new Error("No attributes found for chapter mark");

      return {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: props.atts.number,
            type: "text",
            version: 1,
          } as SerializedTextNode,
        ],
        direction: null,
        format: "",
        indent: 0,
        type: "divisionmark",
        version: 1,
        attributes: {
          [`${DATA_PREFIX}-atts-number`]: String(props.atts.number),
          [`${DATA_PREFIX}-type`]: props.type,
          [`${DATA_PREFIX}-subtype`]: props.subtype ?? "",
          class: `${props.subtype}`,
        },
        tag: "span",
      };
    },
    verses: ({ props }): SerializedUsfmElementNode => {
      if (!props.atts) throw new Error("No attributes found for chapter mark");

      return {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: props.atts.number,
            type: "text",
            version: 1,
          } as SerializedTextNode,
        ],
        direction: null,
        format: "",
        indent: 0,
        type: "divisionmark",
        version: 1,
        attributes: {
          [`${DATA_PREFIX}-atts-number`]: String(props.atts.number),
          [`${DATA_PREFIX}-type`]: props.type,
          [`${DATA_PREFIX}-subtype`]: props.subtype ?? "",
          class: `${props.subtype}`,
        },
        tag: "span",
      };
    },
  },
});

type PrefixKeys<T, K extends string> = {
  [P in keyof T as `${K}${P & string}`]: T[P];
};

const getAttributesFromPerfElementProps = (
  perfProps:
    | Omit<PerfSequence, "blocks">
    | Omit<PerfBlock, "content">
    | Omit<PerfContentElement, "content" | "meta_content">,
) =>
  Object.keys(perfProps).reduce(
    (atts, dataKey) => {
      atts[`${DATA_PREFIX}-${dataKey}`] = perfProps[dataKey];
      return atts;
    },
    {} as PrefixKeys<typeof perfProps, `${typeof DATA_PREFIX}-`>,
  );

const getTagFromSubtype = ({
  subtype,
  replacementMap,
}: {
  subtype?: string;
  replacementMap: Record<string, string>;
}) => {
  if (!subtype) return undefined;
  // Try to find a direct replacement for the subtype
  let replacement = replacementMap[subtype];
  // If no direct replacement is found, try to find a match in the keys
  if (!replacement) {
    const matchedKey = Object.keys(replacementMap).find((key) =>
      subtype.match(new RegExp(`^${key}$`)),
    );
    replacement = matchedKey ? replacementMap[matchedKey] : replacementMap.default;
  }
  // If a replacement is found, return an object with a tag property
  // Otherwise, return undefined
  return replacement ? { tag: replacement } : undefined;
};
