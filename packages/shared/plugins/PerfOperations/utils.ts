import { ElementNode, LexicalNode } from "lexical";
import { PerfKind } from "./types";
/**
 * this module provides utility functions for the Perf plugin.
 * @module
 */

/**
 * Function to determine the perf node kind based on the node.
 * @param node - The node to determine the kind for.
 * @param parent - The parent node of the given node.
 * @returns The kind of the node.
 */
export function getPerfKindFromNode(node: LexicalNode | ElementNode) {
  if (node && checkIsSequence(node)) return PerfKind.Sequence; // If the node is a sequence, return "sequence"
  const parent = node.getParent();
  if (parent && checkIsSequence(parent)) return PerfKind.Block; // If the parent is a sequence, return PerfKind.Block
  return PerfKind.ContentElement; // Otherwise, return "content"
}

/**
 * Function to check if a node is a sequence.
 * @param node - The node to check.
 * @returns A boolean indicating whether the node is a sequence.
 */
export function checkIsSequence(node: LexicalNode | ElementNode) {
  return ["root", "graft"].includes(node.getType() || "");
}
