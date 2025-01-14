import { $isElementNode, LexicalNode } from "lexical";
import { LoggerBasic } from "shared/adaptors/logger-basic.model";
import { TypedMarkNode } from "shared/nodes/features/TypedMarkNode";
import { ImmutableChapterNode } from "shared/nodes/scripture/usj/ImmutableChapterNode";
import { GENERATOR_NOTE_CALLER } from "shared/nodes/scripture/usj/NoteNode";
import { $isNodeWithMarker, NodesWithMarker } from "shared/nodes/scripture/usj/node.utils";
import { VerseNode } from "shared/nodes/scripture/usj/VerseNode";
import { $isImmutableNoteCallerNode, ImmutableNoteCallerNode } from "./ImmutableNoteCallerNode";
import { $isImmutableVerseNode, ImmutableVerseNode } from "./ImmutableVerseNode";

/** Caller count is in an object so it can be manipulated by passing the the object. */
export type CallerData = {
  count: number;
};

// If you want use these utils with your own verse node, add it to this list of types.
type VerseNodes = VerseNode | ImmutableVerseNode;

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
 * Find the given verse in the children of the node.
 * @param node - Node with potential verses in children.
 * @param verseNum - Verse number to look for.
 * @param VerseNodeClass - Use a different verse node class if needed.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function findVerseInNode<T extends VerseNodes = ImmutableVerseNode>(
  node: LexicalNode,
  verseNum: number,
  VerseNodeClass: typeof LexicalNode = ImmutableVerseNode,
) {
  if (!$isElementNode(node)) return;

  const children = node.getChildren();
  const verseNode = children.find(
    (node) =>
      node.getType() === VerseNodeClass.getType() &&
      (node as T).getNumber() === verseNum.toString(),
  );
  return verseNode as T | undefined;
}

/**
 * Finds the verse node with the given verse number amongst the children of nodes.
 * @param nodes - Nodes to look in.
 * @param verseNum - Verse number to look for.
 * @param VerseNodeClass - Use a different verse node class if needed.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function findVerse<T extends VerseNodes = ImmutableVerseNode>(
  nodes: LexicalNode[],
  verseNum: number,
  VerseNodeClass: typeof LexicalNode = ImmutableVerseNode,
) {
  return (
    nodes
      .map((node) => findVerseInNode<T>(node, verseNum, VerseNodeClass))
      // remove any undefined results and take the first found
      .filter((verseNode) => verseNode)[0]
  );
}

/**
 * Find the next verse in the children of the node.
 * @param node - Node with potential verses in children.
 * @param VerseNodeClass - Use a different verse node class if needed.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function findNextVerseInNode<T extends VerseNodes = ImmutableVerseNode>(
  node: LexicalNode,
  VerseNodeClass: typeof LexicalNode = ImmutableVerseNode,
) {
  if (!$isElementNode(node)) return;
  const children = node.getChildren();
  const verseNode = children.find((node) => node.getType() === VerseNodeClass.getType());
  return verseNode as T | undefined;
}

/**
 * Finds the next verse node amongst the children of nodes.
 * @param nodes - Nodes to look in.
 * @param VerseNodeClass - Use a different verse node class if needed.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function findNextVerse<T extends VerseNodes = ImmutableVerseNode>(
  nodes: LexicalNode[],
  VerseNodeClass: typeof LexicalNode = ImmutableVerseNode,
) {
  return (
    nodes
      .map((node) => findNextVerseInNode<T>(node, VerseNodeClass))
      // remove any undefined results and take the first found
      .filter((verseNode) => verseNode)[0]
  );
}

/**
 * Find the last verse in the children of the node.
 * @param node - Node with potential verses in children.
 * @param VerseNodeClass - Use a different verse node class if needed.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function findLastVerseInNode<T extends VerseNodes = ImmutableVerseNode>(
  node: LexicalNode | null | undefined,
  VerseNodeClass: typeof LexicalNode = ImmutableVerseNode,
) {
  if (!node || !$isElementNode(node)) return;

  const children = node.getChildren();
  const verseNode = children.findLast((node) => node.getType() === VerseNodeClass.getType());
  return verseNode as T | undefined;
}

/**
 * Finds the last verse node amongst the children of nodes.
 * @param nodes - Nodes to look in.
 * @param VerseNodeClass - Use a different verse node class if needed.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function findLastVerse<T extends VerseNodes = ImmutableVerseNode>(
  nodes: LexicalNode[],
  VerseNodeClass: typeof LexicalNode = ImmutableVerseNode,
) {
  const verseNodes = nodes
    .map((node) => findLastVerseInNode<T>(node, VerseNodeClass))
    // remove any undefined results
    .filter((verseNode) => verseNode);
  if (verseNodes.length <= 0) return;

  return verseNodes[verseNodes.length - 1];
}

/**
 * Find the verse that this node is in.
 * @param node - Node to find the verse it's in.
 * @param VerseNodeClass - Use a different verse node class if needed.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function findThisVerse<T extends VerseNodes = ImmutableVerseNode>(
  node: LexicalNode | null | undefined,
  VerseNodeClass: typeof LexicalNode = ImmutableVerseNode,
  ChapterNodeClass: typeof LexicalNode = ImmutableChapterNode,
): T | undefined {
  if (!node || node.getType() === ChapterNodeClass.getType()) return;

  // is this node a verse
  if (node.getType() === VerseNodeClass.getType()) return node as T;

  // is one of the previous sibling nodes a verse
  const isWrappedInMark = node.getParent()?.getType() === TypedMarkNode.getType();
  let previousSibling = isWrappedInMark
    ? node.getParent()?.getPreviousSibling()
    : node.getPreviousSibling();
  while (
    previousSibling &&
    previousSibling.getType() !== VerseNodeClass.getType() &&
    previousSibling.getType() !== ChapterNodeClass.getType()
  ) {
    previousSibling = previousSibling.getPreviousSibling();
  }
  if (previousSibling && previousSibling.getType() === VerseNodeClass.getType())
    return previousSibling as T;
  if (previousSibling?.getType() === ChapterNodeClass.getType()) return;

  // is the verse in a previous parent sibling
  let previousParentSibling = node.getTopLevelElement()?.getPreviousSibling();
  let verseNode = findLastVerseInNode<T>(previousParentSibling, VerseNodeClass);
  let nextVerseNode = verseNode;
  while (
    previousParentSibling &&
    !verseNode &&
    previousParentSibling.getType() !== ChapterNodeClass.getType()
  ) {
    verseNode = nextVerseNode;
    previousParentSibling = previousParentSibling.getPreviousSibling();
    nextVerseNode = findLastVerseInNode<T>(previousParentSibling, VerseNodeClass);
  }
  if (!verseNode && previousParentSibling?.getType() === ChapterNodeClass.getType()) return;

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
