import { $isElementNode, LexicalNode } from "lexical";
import { LoggerBasic } from "shared/adaptors/logger-basic.model";
import { $isTypedMarkNode } from "shared/nodes/features/TypedMarkNode";
import { GENERATOR_NOTE_CALLER } from "shared/nodes/scripture/usj/NoteNode";
import {
  $isNodeWithMarker,
  $isSomeChapterNode,
  NodesWithMarker,
} from "shared/nodes/scripture/usj/node.utils";
import { $isVerseNode, VerseNode } from "shared/nodes/scripture/usj/VerseNode";
import { $isImmutableNoteCallerNode, ImmutableNoteCallerNode } from "./ImmutableNoteCallerNode";
import { $isImmutableVerseNode, ImmutableVerseNode } from "./ImmutableVerseNode";

/** Caller count is in an object so it can be manipulated by passing the object. */
export type CallerData = {
  count: number;
};

// If you want use these utils with your own verse node, add it to this list of types, then modify
// all the functions where this type is used in this file.
export type SomeVerseNode = VerseNode | ImmutableVerseNode;

/**
 * Generate the note caller to use. E.g. for '+' replace with a-z, aa-zz.
 * @param markerCaller - The specified note caller.
 * @param noteCallers - List of possible note callers.
 * @param callerData - Caller count. Passed via object so this function can modify the count.
 * @param logger - Logger to use, if any.
 * @returns the specified caller, if '+' replace with up to 2 characters from the possible note
 *   callers list, '*' if undefined.
 */
export function generateNoteCaller(
  markerCaller: string | undefined,
  noteCallers: string[] | undefined,
  callerData: CallerData,
  logger: LoggerBasic | undefined,
): string {
  let caller = markerCaller;
  if (markerCaller === GENERATOR_NOTE_CALLER && noteCallers && noteCallers.length > 0) {
    if (callerData.count >= noteCallers.length ** 2 + noteCallers.length) {
      callerData.count = 0;
      logger?.warn("Note caller count was reset. Consider adding more possible note callers.");
    }

    const callerIndex = callerData.count % noteCallers.length;
    let callerLeadChar = "";
    if (callerData.count >= noteCallers.length) {
      const callerLeadCharIndex = Math.trunc(callerData.count / noteCallers.length) - 1;
      callerLeadChar = noteCallers[callerLeadCharIndex];
    }
    caller = callerLeadChar + noteCallers[callerIndex];
    callerData.count += 1;
  }
  return caller ?? "*";
}

/**
 * Find all ImmutableNoteCallerNodes in the given nodes tree.
 * @param nodes - Lexical node array to look in.
 * @returns an array of all ImmutableNoteCallerNodes in the tree.
 */
export function $findImmutableNoteCallerNodes(nodes: LexicalNode[]): ImmutableNoteCallerNode[] {
  const immutableNoteCallerNodes: ImmutableNoteCallerNode[] = [];

  function $traverse(node: LexicalNode) {
    if ($isImmutableNoteCallerNode(node)) immutableNoteCallerNodes.push(node);
    if (!$isElementNode(node)) return;

    const children = node.getChildren();
    children.forEach($traverse);
  }

  nodes.forEach($traverse);

  return immutableNoteCallerNodes;
}

/**
 * Checks if the given node is a VerseNode or ImmutableVerseNode.
 * @param node - The node to check.
 * @returns `true` if the node is a VerseNode or ImmutableVerseNode, `false` otherwise.
 */
export function $isSomeVerseNode(node: LexicalNode | null | undefined): node is SomeVerseNode {
  return $isVerseNode(node) || $isImmutableVerseNode(node);
}

/**
 * Find the given verse in the children of the node.
 * @param node - Node with potential verses in children.
 * @param verseNum - Verse number to look for.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function $findVerseInNode(node: LexicalNode, verseNum: number) {
  if (!$isElementNode(node)) return;

  const children = node.getChildren();
  const verseNode = children.find(
    (node) => $isSomeVerseNode(node) && node.getNumber() === verseNum.toString(),
  );
  return verseNode as SomeVerseNode | undefined;
}

/**
 * Finds the verse node with the given verse number amongst the children of nodes.
 * @param nodes - Nodes to look in.
 * @param verseNum - Verse number to look for.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function $findVerse(nodes: LexicalNode[], verseNum: number) {
  return (
    nodes
      .map((node) => $findVerseInNode(node, verseNum))
      // remove any undefined results and take the first found
      .filter((verseNode) => verseNode)[0]
  );
}

/**
 * Find the next verse in the children of the node.
 * @param node - Node with potential verses in children.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function $findNextVerseInNode(node: LexicalNode) {
  if (!$isElementNode(node)) return;
  const children = node.getChildren();
  const verseNode = children.find((node) => $isSomeVerseNode(node));
  return verseNode as SomeVerseNode | undefined;
}

/**
 * Finds the next verse node amongst the children of nodes.
 * @param nodes - Nodes to look in.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function $findNextVerse(nodes: LexicalNode[]) {
  return (
    nodes
      .map((node) => $findNextVerseInNode(node))
      // remove any undefined results and take the first found
      .filter((verseNode) => verseNode)[0]
  );
}

/**
 * Find the last verse in the children of the node.
 * @param node - Node with potential verses in children.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function $findLastVerseInNode(node: LexicalNode | null | undefined) {
  if (!node || !$isElementNode(node)) return;

  const children = node.getChildren();
  const verseNode = children.findLast((node) => $isSomeVerseNode(node));
  return verseNode as SomeVerseNode | undefined;
}

/**
 * Finds the last verse node amongst the children of nodes.
 * @param nodes - Nodes to look in.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function $findLastVerse(nodes: LexicalNode[]) {
  const verseNodes = nodes
    .map((node) => $findLastVerseInNode(node))
    // remove any undefined results
    .filter((verseNode) => verseNode);
  if (verseNodes.length <= 0) return;

  return verseNodes[verseNodes.length - 1];
}

/**
 * Find the verse that this node is in.
 * @param node - Node to find the verse it's in.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function $findThisVerse(node: LexicalNode | null | undefined) {
  if (!node || $isSomeChapterNode(node)) return;

  // is this node a verse
  if ($isSomeVerseNode(node)) return node;

  // is one of the previous sibling nodes a verse
  const isWrappedInMark = $isTypedMarkNode(node.getParent());
  let previousSibling = isWrappedInMark
    ? node.getParent()?.getPreviousSibling()
    : node.getPreviousSibling();
  while (
    previousSibling &&
    !$isSomeVerseNode(previousSibling) &&
    !$isSomeChapterNode(previousSibling)
  ) {
    previousSibling = previousSibling.getPreviousSibling();
  }
  if (previousSibling && $isSomeVerseNode(previousSibling)) return previousSibling;

  // is the verse in a previous parent sibling
  let previousParentSibling = node.getTopLevelElement()?.getPreviousSibling();
  let verseNode = $findLastVerseInNode(previousParentSibling);
  let nextVerseNode = verseNode;
  while (previousParentSibling && !verseNode && !$isSomeChapterNode(previousParentSibling)) {
    verseNode = nextVerseNode;
    previousParentSibling = previousParentSibling.getPreviousSibling();
    nextVerseNode = $findLastVerseInNode(previousParentSibling);
  }
  if (!verseNode && $isSomeChapterNode(previousParentSibling)) return;

  return verseNode;
}

/**
 * Checks if the node has a `getMarker` method. Includes all React nodes.
 * @param node - LexicalNode to check.
 * @returns `true` if the node has a `getMarker` method, `false` otherwise.
 */
export function $isReactNodeWithMarker(
  node: LexicalNode | null | undefined,
): node is NodesWithMarker | ImmutableVerseNode {
  return $isNodeWithMarker(node) || $isImmutableVerseNode(node);
}
