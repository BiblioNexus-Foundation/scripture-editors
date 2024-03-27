import { convertLexicalStateNode } from "./lexicalToX";

export const transformLexicalStateToPerf = (lexicalStateNode, kind) => {
  const perf = { sequences: {} };
  perf.targetNode = convertLexicalStateNode({
    node: lexicalStateNode,
    kind,
    nodeBuilder: (props) => customNodeBuilder({ ...props, perf }),
  });
  return perf;
};
export default transformLexicalStateToPerf;

const getDatafromAttributes = (attributes) => {
  const {
    "data-type": type,
    "data-subtype": subtypeRaw,
    "data-subtype-ns": subtypeNs,
    ...extraAttributes
  } = attributes;
  const data = Object.keys(extraAttributes).reduce((data, attribute) => {
    const [prefix, key, subKey] = attribute.split("-");
    if (prefix !== "data") {
      console.warn(`Invalid attribute: ${attribute}`);
      return data;
    }
    if (subKey) {
      if (!data[key]) data[key] = {};
      data[key][subKey] = extraAttributes[attribute];
      return data;
    }
    data[key] = extraAttributes[attribute];
    return data;
  }, {});
  const subtype = subtypeNs ? subtypeRaw + ":" + subtypeNs : subtypeRaw;
  return { type, subtype, ...data };
};

const customNodeBuilder = ({ node, kind, children, perf }) =>
  ((lexicalMap, data) =>
    mapLexical({
      node,
      children,
      data,
      kind,
      lexicalMap,
    }))(createLexicalMap(perf), node.attributes ? getDatafromAttributes(node.attributes) : {});

const mapLexical = ({ node, children, data, kind, defaults, lexicalMap }) => {
  const _defaults = defaults ?? { node, children, data, kind };

  if (!lexicalMap) return _defaults;

  const maps = [lexicalMap[kind], lexicalMap.default];

  return (
    ((map) => (typeof map === "function" ? map(_defaults) : map))(
      maps.find((map) => map !== undefined),
    ) ?? _defaults
  );
};

const createLexicalMap = (perf) => ({
  default: ({ node, children, kind }) => {
    if (node?.type === "root") return { type: "main", blocks: children };
    if (node?.type === "text") return node.text;
    throw new Error(`unhandled kind: ${kind}`);
  },
  block: ({ node, children, data }) => {
    const { type } = data || {};
    if (type === "graft") return buildGraft({ perf, node, data, children });
    if (node?.type === "text") return node.text;
    return {
      ...data,
      content: children,
    };
  },
  contentElement: ({ node, children, data }) => {
    const { type, subtype } = data || {};
    if (type === "graft") return buildGraft({ perf, node, data, children });
    if (node?.type === "text") return node.text;
    if (["verses", "chapter"].includes(subtype)) return { ...data };
    return {
      ...data,
      ...(children?.length ? { content: children } : undefined),
    };
  },
});

const buildGraft = ({ perf, data, children }) => {
  perf.sequences[data.target] = {
    type: data.subtype,
    blocks: children,
  };
  return { ...data };
};
