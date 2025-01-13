import { UsjNode } from "./usj";
// import { isTruthy } from "../../perf/utils";

export interface NodeMetadata<T> {
  relativePath: number[];
  initialNode: UsjNode | string;
  currentOutput: T[] | null;
  currentOutputIndex: number | null;
  [key: string]: unknown;
}

export type UsjTextNode = {
  type: "text";
  value: string;
};

export type MetadataBuilder<T> = (props: {
  node: UsjNode;
  metadata: NodeMetadata<T>;
}) => NodeMetadata<T>;

interface ConversionOptions<T> {
  node: UsjNode | string;
  nodeBuilder: (props: NodeBuilderProps<T>) => T | null;
  metadataBuilder?: MetadataBuilder<T>;
}

interface NodeBuilderProps<T> {
  nodeProps: Omit<UsjNode, "content"> | UsjTextNode;
  metadata: NodeMetadata<T>;
  convertedContent?: T[];
}

// Main conversion function
export const convertUsjNode = <T>({
  node,
  nodeBuilder,
  metadataBuilder = ({ metadata }) => metadata,
}: ConversionOptions<T>): T | null => {
  // Validate inputs
  if (!nodeBuilder) {
    throw new Error("NodeBuilder is required for conversion");
  }
  if (!node) {
    throw new Error("Node is required for conversion");
  }

  // Separate recursive function to handle the traversal
  const convertNode = (
    currentNode: UsjNode | string,
    currentMetadata: NodeMetadata<T>,
  ): T | null => {
    if (typeof currentNode === "string") {
      return nodeBuilder({
        nodeProps: { type: "text", value: currentNode },
        metadata: currentMetadata,
      });
    }

    const enrichedMetadata = metadataBuilder({
      node: currentNode as UsjNode,
      metadata: currentMetadata,
    });

    // Handle leaf nodes
    if (
      !("content" in currentNode) ||
      typeof currentNode.content === "undefined" ||
      currentNode.content === null ||
      currentNode.content.length === 0
    ) {
      return nodeBuilder({
        nodeProps: currentNode,
        metadata: enrichedMetadata,
      });
    }
    const { content, ...nodeProps } = currentNode;

    // Process children
    // const convertedContent = content
    //   .map((child, index, convertedContent) =>
    //     convertNode(child, {
    //       ...enrichedMetadata,
    //       relativePath: enrichedMetadata.relativePath.concat(index),
    //     }),
    //   )
    //   .filter(isTruthy);

    const convertedContent = content.reduce((convertedContent, child, index) => {
      const convertedChild = convertNode(child, {
        ...enrichedMetadata,
        relativePath: enrichedMetadata.relativePath.concat(index),
        initialNode: node,
        currentOutput: convertedContent,
        currentOutputIndex: index,
      });
      if (convertedChild) {
        convertedContent.push(convertedChild);
      }
      return convertedContent;
    }, [] as T[]);

    // Build and return the node with its children
    return nodeBuilder({
      nodeProps,
      metadata: enrichedMetadata,
      convertedContent,
    });
  };
  return convertNode(node, {
    relativePath: [],
    initialNode: node,
    currentOutput: null,
    currentOutputIndex: null,
  });
};
