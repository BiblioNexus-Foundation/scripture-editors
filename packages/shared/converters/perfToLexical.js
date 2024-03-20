import { convertSequence } from "./perfToX";

export const transformPerfToLexicalState = (perf, sequenceId, perfMapper) => ({
  root: convertSequence({
    sequence: perf.sequences[sequenceId],
    sequenceId,
    nodeBuilder: (props) =>
      buildLexicalNodeFromPerfNode({
        ...props,
        perfDocument: perf,
        perfMapper,
      }),
  }),
});
export default transformPerfToLexicalState;

/**
 * Converts a PERF element to a different format
 */
export const buildLexicalNodeFromPerfNode = ({ props, children, path, kind, perfDocument }) =>
  mapPerf({
    props,
    kind,
    path,
    children,
    perfMap: createPerfMap(perfDocument),
  });

/** Maps types and subtypes of a PERF element (sequence,block, contentElement)
 * given map object (perfMap) and returns a transformation of that element.
 */
export const mapPerf = ({ props, path, children, kind, defaults, perfMap }) => {
  const { type, subtype } = props;
  const _props = { ...props, kind, path };
  const _defaults = defaults ?? { props: _props, children };

  if (!perfMap) return _defaults;

  const maps = [
    perfMap[type]?.[subtype],
    perfMap["*"]?.[subtype],
    perfMap[type]?.["*"],
    perfMap["*"]?.["*"],
  ];

  return (
    ((map) => (typeof map === "function" ? map(_defaults) : map))(
      maps.find((map) => map !== undefined),
    ) ?? _defaults
  );
};

/**
 * builds an object (perfMap) which maps perf elements by their type and subtype
 * this is needed for mapPerf() to assign a transformation
 * to a type/subtype combination.
 */
export const createPerfMap = (perf) => ({
  "*": {
    "*": ({ children, props: perfElementProps }) => {
      console.log("NOT SUPPORTED", { perfElementProps, children });
      return children?.length
        ? {
            // data: perfElementProps,
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "color:red",
                text: `NOT SUPPORTED ---->`,
                type: "text",
                version: 1,
                // data: perfElementProps,
              },
              ...children,

              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "color:red",
                text: `<------`,
                type: "text",
                version: 1,
                // data: perfElementProps,
              },
            ],
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            type: "inline",
            version: 1,
          }
        : {
            // data: perfElementProps,
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "color:red",
                text: `[NOT SUPPORTED]`,
                type: "text",
                version: 1,
              },
            ],
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            type: "inline",
            version: 1,
          };
    },
    sequence: ({ children }) => ({
      children: children,
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    }),
  },
  text: {
    "*": ({ props: perfElementProps }) => ({
      detail: 0,
      format: 0,
      mode: "normal",
      style: "",
      text: perfElementProps.text,
      type: "text",
      version: 1,
    }),
  },
  graft: {
    "*": ({ props: perfElementProps }) => ({
      children: ((lexicalState) => lexicalState.root.children)(
        transformPerfToLexicalState(perf, perfElementProps.target),
      ),
      // data: perfElementProps,
      tag: ((subtypeMap) => subtypeMap[perfElementProps.subtype])({
        title: "h1",
        introduction: "section",
        heading: "div",
      }),
      attributes: getAttributesFromPerfElementProps(perfElementProps),
      direction: "ltr",
      format: "",
      indent: 0,
      type: "graft",
      version: 1,
    }),
  },
  paragraph: {
    "*": ({ props: perfElementProps, children }) => ({
      children: children,
      // data: perfElementProps,
      tag: getTagFromSubtype({
        subtype: perfElementProps.subtype,
        replacementMap: {
          "\\w?mt(\\d*)$": "span",
          s: "h3",
          r: "strong",
          f: "span",
        },
      }),
      attributes: getAttributesFromPerfElementProps(perfElementProps),
      direction: "ltr",
      format: "",
      indent: 0,
      type: "usfmparagraph",
      version: 1,
    }),
    x: ({ children, props: perfElementProps }) => ({
      children,
      // data: perfElementProps,
      attributes: getAttributesFromPerfElementProps(perfElementProps),
      direction: "ltr",
      format: "",
      indent: 0,
      type: "inline",
      version: 1,
    }),
  },
  wrapper: {
    "*": ({ children, props: perfElementProps }) => ({
      children,
      // data: perfElementProps,
      attributes: getAttributesFromPerfElementProps(perfElementProps),
      direction: "ltr",
      format: "",
      indent: 0,
      type: "inline",
      version: 1,
    }),
  },
  mark: {
    ts: () => ({
      // data: perfElementProps,
      type: "usfmparagraph",
      version: 1,
    }),
    ...((divisionMark) => ({
      verses: divisionMark,
      chapter: divisionMark,
    }))(({ props: perfElementProps }) => ({
      // data: perfElementProps,
      attributes: {
        "data-atts-number": perfElementProps.atts.number,
        "data-type": perfElementProps.type,
        "data-subtype": perfElementProps.subtype,
        class: `${perfElementProps.subtype}`,
      },
      children: [
        {
          detail: 0,
          format: 0,
          mode: "normal",
          style: "",
          text: perfElementProps.atts.number,
          type: "text",
          version: 1,
        },
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "divisionmark",
      version: 1,
    })),
  },
});

const getAttributesFromPerfElementProps = (data) =>
  Object.keys(data).reduce((atts, dataKey) => {
    if (["kind", "metaContent"].includes(dataKey)) return atts;
    atts[`data-${dataKey}`] = data[dataKey];
    return atts;
  }, {});

const getTagFromSubtype = ({ subtype, replacementMap }) =>
  replacementMap[subtype] ??
  ((matchedSubtype) =>
    matchedSubtype
      ? subtype.replace(new RegExp(matchedSubtype), replacementMap[matchedSubtype])
      : undefined)(Object.keys(replacementMap).find((key) => subtype.match(key)));
