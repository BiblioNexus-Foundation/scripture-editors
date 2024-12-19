import { UsjNode } from "./usj";
import { isTruthy } from "../../perf/utils";

export interface NodeMetadata {
  relativePath: number[];
  [key: string]: unknown;
}

export type UsjTextNode = {
  type: "text";
  value: string;
};

export type MetadataBuilder = (props: { node: UsjNode; metadata: NodeMetadata }) => NodeMetadata;

interface ConversionOptions<T> {
  node: UsjNode | string;
  nodeBuilder: (props: NodeBuilderProps<T>) => T | null;
  metadataBuilder?: MetadataBuilder;
}

interface NodeBuilderProps<T> {
  nodeProps: Omit<UsjNode, "content"> | UsjTextNode;
  metadata: NodeMetadata;
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
  const convertNode = (currentNode: UsjNode | string, currentMetadata: NodeMetadata): T | null => {
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
    const convertedContent = content
      .map((child, index) =>
        convertNode(child, {
          ...enrichedMetadata,
          relativePath: enrichedMetadata.relativePath.concat(index),
        }),
      )
      .filter(isTruthy);

    // Build and return the node with its children
    return nodeBuilder({
      nodeProps,
      metadata: enrichedMetadata,
      convertedContent,
    });
  };

  return convertNode(node, { relativePath: [] });
};
