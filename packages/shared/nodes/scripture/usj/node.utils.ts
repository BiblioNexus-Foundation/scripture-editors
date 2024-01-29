/** Utility functions for editor nodes */

import { $isElementNode, LexicalNode } from "lexical";
import { ImmutableChapterNode } from "./ImmutableChapterNode";
import { ImmutableVerseNode } from "./ImmutableVerseNode";

/** RegEx to test for a string only containing digits. */
export const ONLY_DIGITS_TEST = /^\d+$/;

export const NBSP = "\xa0";
export const CHAPTER_CLASS_NAME = "chapter";
export const VERSE_CLASS_NAME = "verse";

const NUMBERED_STYLE_PLACEHOLDER = "#";

/**
 * Check if the style is valid and numbered.
 * @param style - style to check.
 * @param numberedStyles - list of valid numbered styles.
 * @returns true if the style is a valid numbered style, false otherwise.
 */
export function isValidNumberedStyle(style: string, numberedStyles: string[]): boolean {
  // Starts with a valid numbered style.
  const numberedStyle = numberedStyles.find((styleNumbered) => style.startsWith(styleNumbered));
  if (!numberedStyle) return false;

  // Ends with a number.
  const maybeNumber = style.slice(numberedStyle.length);
  return ONLY_DIGITS_TEST.test(maybeNumber);
}

/**
 * Extracts a list of numbered styles with the '#' removed.
 * @param styles - list of styles containing placeholder numbered styles, e.g. ['p', 'pi#'].
 * @returns list of numbered styles (non-numbered are filtered out) with the '#' removed,
 *   e.g. ['pi'].
 */
export function extractNumberedStyles(styles: string[] | readonly string[]): string[] {
  return (
    styles
      .filter((style) => style.endsWith(NUMBERED_STYLE_PLACEHOLDER))
      // remove placeholder
      .map((style) => style.slice(0, -1))
  );
}

/**
 * Extracts a list of non-numbered styles.
 * @param styles - list of styles containing placeholder numbered styles, e.g. ['p', 'pi#'].
 * @returns list of non-numbered styles (numbered are filtered out), e.g. ['p'].
 */
export function extractNonNumberedStyles(styles: string[] | readonly string[]): string[] {
  return styles.filter((style) => !style.endsWith(NUMBERED_STYLE_PLACEHOLDER));
}

/**
 * Finds the chapter node with the given chapter number amongst the nodes.
 * @param nodes - nodes to look in.
 * @param chapterNum - chapter number to look for.
 * @param ChapterNodeClass - use a different chapter node class if needed.
 * @returns the chapter node if found, `undefined` otherwise.
 */
export function findChapter<T extends LexicalNode = ImmutableChapterNode>(
  nodes: LexicalNode[],
  chapterNum: number,
  ChapterNodeClass: typeof LexicalNode = ImmutableChapterNode,
) {
  return nodes.find(
    (node) =>
      node.getType() === ChapterNodeClass.getType() && node.getNumber() === chapterNum.toString(),
  ) as T | undefined;
}

/**
 * Finds the next chapter.
 * @param nodes - nodes to look in.
 * @param isCurrentChapterAtFirstNode - if `true` ignore the first node.
 * @param ChapterNodeClass - use a different chapter node class if needed.
 * @returns the next chapter node if found, `undefined` otherwise.
 */
export function findNextChapter<T extends LexicalNode = ImmutableChapterNode>(
  nodes: LexicalNode[],
  isCurrentChapterAtFirstNode = false,
  ChapterNodeClass: typeof LexicalNode = ImmutableChapterNode,
) {
  return nodes.find(
    (node, index) =>
      (!isCurrentChapterAtFirstNode || index > 0) && node.getType() === ChapterNodeClass.getType(),
  ) as T | undefined;
}

/**
 * Find the chapter that this node is in.
 * @param node - node to find the chapter it's in.
 * @param ChapterNodeClass - use a different chapter node class if needed.
 * @returns the chapter node if found, `undefined` otherwise.
 */
export function findThisChapter<T extends LexicalNode = ImmutableChapterNode>(
  node: LexicalNode | null | undefined,
  ChapterNodeClass: typeof LexicalNode = ImmutableChapterNode,
) {
  if (!node) return;

  // is this node a chapter
  if (node.getType() === ChapterNodeClass.getType()) return node as T;

  // is the chapter a previous top level sibling
  let previousSibling = node.getTopLevelElement()?.getPreviousSibling();
  while (previousSibling && previousSibling.getType() !== ChapterNodeClass.getType()) {
    previousSibling = previousSibling.getPreviousSibling();
  }
  if (previousSibling && previousSibling.getType() === ChapterNodeClass.getType())
    return previousSibling as T;
}

/**
 * Find the given verse in the children of the node.
 * @param node - node with potential verses in children.
 * @param verseNum - verse number to look for.
 * @param VerseNodeClass - use a different verse node class if needed.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function findVerseInNode<T extends LexicalNode = ImmutableVerseNode>(
  node: LexicalNode,
  verseNum: number,
  VerseNodeClass: typeof LexicalNode = ImmutableVerseNode,
) {
  if (!$isElementNode(node)) return;

  const children = node.getChildren();
  const verseNode = children.find(
    (node) =>
      node.getType() === VerseNodeClass.getType() && node.getNumber() === verseNum.toString(),
  );
  return verseNode as T | undefined;
}

/**
 * Finds the verse node with the given verse number amongst the children of nodes.
 * @param nodes - nodes to look in.
 * @param verseNum - verse number to look for.
 * @param VerseNodeClass - use a different verse node class if needed.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function findVerse<T extends LexicalNode = ImmutableVerseNode>(
  nodes: LexicalNode[],
  verseNum: number,
  VerseNodeClass: typeof LexicalNode = ImmutableVerseNode,
) {
  return (
    nodes
      .map((node) => findVerseInNode<T>(node, verseNum, VerseNodeClass))
      // remove any undefined results and take the first found
      .filter((verseNode) => verseNode)[0] as T | undefined
  );
}

/**
 * Find the next verse in the children of the node.
 * @param node - node with potential verses in children.
 * @param VerseNodeClass - use a different verse node class if needed.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function findNextVerseInNode<T extends LexicalNode = ImmutableVerseNode>(
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
 * @param nodes - nodes to look in.
 * @param VerseNodeClass - use a different verse node class if needed.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function findNextVerse<T extends LexicalNode = ImmutableVerseNode>(
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
 * @param node - node with potential verses in children.
 * @param VerseNodeClass - use a different verse node class if needed.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function findLastVerseInNode<T extends LexicalNode = ImmutableVerseNode>(
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
 * @param nodes - nodes to look in.
 * @param VerseNodeClass - use a different verse node class if needed.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function findLastVerse<T extends LexicalNode = ImmutableVerseNode>(
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
 * @param node - node to find the verse it's in.
 * @param VerseNodeClass - use a different verse node class if needed.
 * @returns the verse node if found, `undefined` otherwise.
 */
export function findThisVerse<T extends LexicalNode = ImmutableVerseNode>(
  node: LexicalNode | null | undefined,
  VerseNodeClass: typeof LexicalNode = ImmutableVerseNode,
): T | undefined {
  if (!node) return;

  // is this node a verse
  if (node.getType() === VerseNodeClass.getType()) return node as T;

  // is one of the previous sibling nodes a verse
  let previousSibling = node.getPreviousSibling();
  while (previousSibling && previousSibling.getType() !== VerseNodeClass.getType()) {
    previousSibling = previousSibling.getPreviousSibling();
  }
  if (previousSibling && previousSibling.getType() === VerseNodeClass.getType())
    return previousSibling as T;

  // is the verse in a previous parent sibling
  let previousParentSibling = node.getTopLevelElement()?.getPreviousSibling();
  let verseNode = findLastVerseInNode<T>(previousParentSibling, VerseNodeClass);
  let nextVerseNode = verseNode;
  while (previousParentSibling && !verseNode) {
    verseNode = nextVerseNode;
    previousParentSibling = previousParentSibling.getPreviousSibling();
    nextVerseNode = findLastVerseInNode<T>(previousParentSibling, VerseNodeClass);
  }
  return verseNode;
}

/**
 * Remove the given node and all the nodes after.
 * @param nodes - nodes to prune.
 * @param firstNode - first node in nodes.
 * @param pruneNode - node to prune and all nodes after.
 */
export function removeNodeAndAfter(
  nodes: LexicalNode[],
  firstNode: LexicalNode,
  pruneNode: LexicalNode | undefined,
) {
  if (pruneNode) {
    // prune node and after
    nodes.length = pruneNode.getIndexWithinParent() - firstNode.getIndexWithinParent();
  }
}

/**
 * Removes all the nodes that proceed the given node.
 * @param nodes - nodes to prune.
 * @param firstNode - node to prune before.
 * @returns the nodes from the node and after.
 */
export function removeNodesBeforeNode(
  nodes: LexicalNode[],
  firstNode: LexicalNode | undefined,
): LexicalNode[] {
  if (!firstNode) return nodes;

  return nodes.splice(firstNode.getIndexWithinParent(), nodes.length - 1);
}

/**
 * Gets the marker text with the marker visible.
 * @param style - Verse style.
 * @param content - Content such as chapter or verse number.
 * @returns the marker text with the marker visible.
 */
export function getVisibleMarkerText(style: string, content: string | undefined): string {
  let text = `\\${style}`;
  if (content) text += ` ${content}`;
  text += NBSP;
  return text;
}

/**
 * Gets the inline marker text with the marker visible.
 * @param style - Verse style.
 * @param content - Content such as chapter or verse number.
 * @returns the inline marker text with the marker visible.
 */
export function getVisibleInlineMarkerText(style: string, content: string | undefined): string {
  let text = `\\${style}`;
  if (content) text += ` ${content}`;
  text += ` \\${style}*`;
  text += NBSP;
  return text;
}
