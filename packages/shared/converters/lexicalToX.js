import { pushToArray } from "./utils";

export const convertLexicalStateNode = ({
  node: nodeData,
  kind = "sequence",
  nodeBuilder: buildNode,
}) => {
  const { children, ...node } = nodeData;
  const childKind = kind === "sequence" ? "block" : "contentElement";
  return buildNode
    ? buildNode({
        node,
        kind,
        children: children?.reduce(
          (convertedNodes, node) =>
            ((convertedNode) =>
              convertedNode ? pushToArray(convertedNodes, convertedNode) : convertedNodes)(
              convertLexicalStateNode({ node, kind: childKind, nodeBuilder: buildNode }),
            ),
          [],
        ),
      })
    : undefined;
};
