import { pushToArray, handleSubtypeNS } from "./utils";

/**
 * Structure of nodes in PERF
 * @link https://github.com/Proskomma/proskomma-json-tools/tree/main/src/schema/structure/0_4_0
 */
const PerfStrutureTypes = {
  SEQUENCE: "sequence",
  BLOCK: "block",
  CONTENT_TEXT: "contentText",
  CONTENT_ELEMENT: "contentElement",
};

export const convertPerf = ({ perfDocument, nodeBuilder }) => {
  return {
    ...perfDocument,
    sequences: Object.keys(perfDocument.sequences).reduce((convertedSequences, sequenceId) => {
      convertedSequences[sequenceId] = convertSequence({
        sequence: perfDocument.sequences[sequenceId],
        sequenceId,
        nodeBuilder,
      });
      return convertedSequences;
    }, {}),
  };
};

export const convertSequence = ({ sequence, sequenceId, nodeBuilder: buildNode }) => {
  const { blocks, ...props } = sequence;
  const path = `$.sequences.${sequenceId}`;
  const children = blocks?.reduce(
    (convertedBlocks, block, index) =>
      ((convertedBlock) =>
        convertedBlock ? pushToArray(convertedBlocks, convertedBlock) : convertedBlocks)(
        convertBlock({
          block,
          nodeBuilder: buildNode,
          path: path + `.blocks[${index}]`,
        }),
      ),
    [],
  );
  return buildNode({
    path,
    kind: PerfStrutureTypes.SEQUENCE,
    props: { ...props, subtype: "sequence", sequenceId },
    children,
  });
};

export const convertBlock = ({ block, nodeBuilder: buildNode, path }) => {
  const { type, subtype, content, ...props } = block;
  const subtypes = handleSubtypeNS(subtype);
  const { convertedContentNodes, direction } = getContents({
    content,
    nodeBuilder: buildNode,
    path,
  });
  return buildNode({
    path: path,
    kind: PerfStrutureTypes.BLOCK,
    props: { type, ...subtypes, ...props },
    children: convertedContentNodes,
    direction,
  });
};

const setTextDirection = (dir, contentItem) => {
  if (dir.value === undefined) dir.value = getTextDirection(contentItem);
  return dir;
};

export const getContents = ({ content, nodeBuilder: buildNode, path }) =>
  content?.reduce(
    ({ convertedContentNodes, direction }, contentItem, index) => {
      const contentPath = path + `.content[${index}]`;
      return ((convertedContentNode) => ({
        convertedContentNodes: convertedContentNode
          ? pushToArray(convertedContentNodes, convertedContentNode)
          : convertedContentNodes,
        direction,
      }))(
        typeof contentItem === "string"
          ? buildNode({
              path: contentPath,
              kind: PerfStrutureTypes.CONTENT_TEXT,
              direction: setTextDirection(direction, contentItem),
              props: { text: contentItem, type: "text" },
            })
          : convertContentElement({
              element: contentItem,
              nodeBuilder: buildNode,
              path: contentPath,
            }),
      );
    },
    { convertedContentNodes: [], direction: { value: undefined } },
  ) ?? { convertedContentNodes: [], direction: { value: null } };

export const convertContentElement = ({ element, nodeBuilder: buildNode, path }) => {
  const { type, subtype, content, meta_content, ...props } = element;
  const subtypes = handleSubtypeNS(subtype);
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

  const convertContents = converters[type];
  const children = convertContents ? convertContents() : [];

  return buildNode({
    path,
    kind: PerfStrutureTypes.CONTENT_ELEMENT,
    props: {
      type,
      ...subtypes,
      ...props,
      ...(meta_content ?? {
        metaContent: getContents({
          content: meta_content,
          nodeBuilder: buildNode,
          path,
        }),
      }),
    },
    children,
    direction,
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

export function getTextDirection(text) {
  if (RTL_REGEX.test(text)) {
    return "rtl";
  }
  if (LTR_REGEX.test(text)) {
    return "ltr";
  }
  return null;
}

export default convertPerf;
