import { convertSequence } from "./perfToX";

export const transformPerfToLexicalState = (perf, sequenceId, perfMapper) => ({
  root: convertSequence({
    sequence: perf.sequences[sequenceId],
    sequenceId,
    nodeBuilder: (props) =>
      buildLexicalNodeFromPerfNode({
        props,
        perfDocument: perf,
        perfMapper,
      }),
  }),
});
export default transformPerfToLexicalState;

export const DATA_PREFIX = "perf";

/**
 * Converts a PERF element to a different format
 */
export const buildLexicalNodeFromPerfNode = ({ props, perfDocument, perfMapper }) =>
  (perfMapper || mapPerf)({
    ...props,
    perfMap: createPerfMap(perfDocument),
  });

/** Maps types and subtypes of a PERF element (sequence,block, contentElement)
 * given map object (perfMap) and returns a transformation of that element.
 */
export const mapPerf = ({ kind, props, children, direction, perfMap, defaults }) => {
  const { type, subtype } = props;
  const _props = { ...props, kind };
  const _defaults = defaults ?? { props: _props, children, direction };

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
      direction: null,
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
      direction: null,
      format: "",
      indent: 0,
      type: "graft",
      version: 1,
      attributes: getAttributesFromPerfElementProps(perfElementProps),
      ...getTagFromSubtype({
        subtype: perfElementProps.subtype,
        replacementMap: {
          title: "h1",
          introduction: "section",
          heading: "div",
        },
      }),
    }),
  },
  paragraph: {
    "*": ({ props: perfElementProps, children, direction }) => {
      return {
        children: children,
        direction: direction.value,
        format: "",
        indent: 0,
        type: "usfmparagraph",
        version: 1,
        attributes: getAttributesFromPerfElementProps(perfElementProps),
        ...getTagFromSubtype({
          subtype: perfElementProps.subtype,
          replacementMap: {
            "\\w?mt(\\d*)$": "span",
            s: "h3",
            r: "strong",
            f: "span",
          },
        }),
      };
    },
    x: ({ children, props: perfElementProps, direction }) => ({
      children,
      direction: direction.value,
      format: "",
      indent: 0,
      type: "inline",
      version: 1,
      attributes: getAttributesFromPerfElementProps(perfElementProps),
    }),
  },
  wrapper: {
    "*": ({ children, props: perfElementProps, direction }) => ({
      children,
      direction: direction.value,
      format: "",
      indent: 0,
      type: "inline",
      version: 1,
      attributes: getAttributesFromPerfElementProps(perfElementProps),
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
      direction: null,
      format: "",
      indent: 0,
      type: "divisionmark",
      version: 1,
      attributes: {
        [`${DATA_PREFIX}-atts-number`]: perfElementProps.atts.number,
        [`${DATA_PREFIX}-type`]: perfElementProps.type,
        [`${DATA_PREFIX}-subtype`]: perfElementProps.subtype,
        class: `${perfElementProps.subtype}`,
        tabindex: 0,
      },
    })),
  },
});

const getAttributesFromPerfElementProps = (data) =>
  Object.keys(data).reduce((atts, dataKey) => {
    if (["kind", "metaContent"].includes(dataKey)) return atts;
    atts[`${DATA_PREFIX}-${dataKey}`] = data[dataKey];
    atts.tabindex = 0;
    return atts;
  }, {});

const getTagFromSubtype = ({ subtype, replacementMap }) => {
  // Try to find a direct replacement for the subtype
  let replacement = replacementMap[subtype];
  // If no direct replacement is found, try to find a match in the keys
  if (!replacement) {
    const matchedKey = Object.keys(replacementMap).find((key) =>
      subtype.match(new RegExp(`^${key}$`)),
    );
    if (matchedKey) {
      replacement = replacementMap[matchedKey];
    }
  }
  // If a replacement is found, return an object with a tag property
  // Otherwise, return undefined
  return replacement ? { tag: replacement } : undefined;
};
