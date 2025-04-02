/** Utility functions for editor nodes */

import { MARKER_OBJECT_PROPS, MarkerObject } from "@biblionexus-foundation/scripture-utilities";
import {
  $getCommonAncestor,
  $isElementNode,
  LexicalEditor,
  LexicalNode,
  SerializedLexicalNode,
} from "lexical";
// Must be imported before `CharNode` to prevent a circular dependency.
import { NBSP, NUMBERED_MARKER_PLACEHOLDER, UnknownAttributes } from "./node-constants";
import { $isUnknownNode, UnknownNode } from "../../features/UnknownNode";
import { $isBookNode, BookNode } from "./BookNode";
import { $isChapterNode, ChapterNode } from "./ChapterNode";
import { $isCharNode, CharNode, isSerializedCharNode } from "./CharNode";
import { $isImmutableChapterNode, ImmutableChapterNode } from "./ImmutableChapterNode";
import { $isMilestoneNode, MilestoneNode } from "./MilestoneNode";
import { $isNoteNode, NoteNode } from "./NoteNode";
import { $isParaNode, ParaNode } from "./ParaNode";
import { $isVerseNode, VerseNode } from "./VerseNode";

export type NodesWithMarker =
  | BookNode
  | ChapterNode
  | CharNode
  | ImmutableChapterNode
  | MilestoneNode
  | ParaNode
  | NoteNode
  | VerseNode
  | UnknownNode;

// If you want use these utils with your own chapter node, add it to this list of types.
type SomeChapterNode = ChapterNode | ImmutableChapterNode;

/** RegEx to test for a string only containing digits. */
const ONLY_DIGITS_TEST = /^\d+$/;

/**
 * Check if the marker is valid and numbered.
 * @param marker - Marker to check.
 * @param numberedMarkers - List of valid numbered markers ('#' removed).
 * @returns true if the marker is a valid numbered marker, false otherwise.
 */
export function isValidNumberedMarker(
  marker: string | undefined,
  numberedMarkers: string[],
): boolean {
  if (!marker) return false;

  // Starts with a valid numbered marker.
  const numberedMarker = numberedMarkers.find((markerNumbered) =>
    marker.startsWith(markerNumbered),
  );
  if (!numberedMarker) return false;

  // Ends with a number.
  const maybeNumber = marker.slice(numberedMarker.length);
  return ONLY_DIGITS_TEST.test(maybeNumber);
}

/**
 * Extracts a list of numbered markers with the '#' removed.
 * @param markers - List of markers containing placeholder numbered markers, e.g. ['p', 'pi#'].
 * @returns list of numbered markers (non-numbered are filtered out) with the '#' removed,
 *   e.g. ['pi'].
 */
export function extractNumberedMarkers(markers: string[] | readonly string[]): string[] {
  return (
    markers
      .filter((marker) => !!marker && marker.endsWith(NUMBERED_MARKER_PLACEHOLDER))
      // remove placeholder
      .map((marker) => marker.slice(0, -1))
  );
}

/**
 * Extracts a list of non-numbered markers.
 * @param markers - List of markers containing placeholder numbered markers, e.g. ['p', 'pi#'].
 * @returns list of non-numbered markers (numbered are filtered out), e.g. ['p'].
 */
export function extractNonNumberedMarkers(markers: string[] | readonly string[]): string[] {
  return markers.filter((marker) => !marker?.endsWith(NUMBERED_MARKER_PLACEHOLDER));
}

/**
 * Checks if the given node is a ChapterNode or ImmutableChapterNode.
 * @param node - The node to check.
 * @returns `true` if the node is a ChapterNode or ImmutableChapterNode, `false` otherwise.
 */
export function $isSomeChapterNode(node: LexicalNode | null | undefined): node is SomeChapterNode {
  return $isChapterNode(node) || $isImmutableChapterNode(node);
}

/**
 * Finds the chapter node with the given chapter number amongst the nodes.
 * @param nodes - Nodes to look in.
 * @param chapterNum - Chapter number to look for.
 * @returns the chapter node if found, `undefined` otherwise.
 */
export function $findChapter(nodes: LexicalNode[], chapterNum: number) {
  return nodes.find(
    (node) => $isSomeChapterNode(node) && node.getNumber() === chapterNum.toString(),
  ) as SomeChapterNode | undefined;
}

/**
 * Finds the next chapter.
 * @param nodes - Nodes to look in.
 * @param isCurrentChapterAtFirstNode - If `true` ignore the first node.
 * @returns the next chapter node if found, `undefined` otherwise.
 */
export function $findNextChapter(nodes: LexicalNode[], isCurrentChapterAtFirstNode = false) {
  return nodes.find(
    (node, index) => (!isCurrentChapterAtFirstNode || index > 0) && $isSomeChapterNode(node),
  ) as SomeChapterNode | undefined;
}

/**
 * Find the chapter that this node is in.
 * @param node - Node to find the chapter it's in.
 * @returns the chapter node if found, `undefined` otherwise.
 */
export function $findThisChapter(node: LexicalNode | null | undefined) {
  if (!node) return;

  // is this node a chapter
  if ($isSomeChapterNode(node)) return node;

  // is the chapter a previous top level sibling
  let previousSibling = node.getTopLevelElement()?.getPreviousSibling();
  while (previousSibling && !$isSomeChapterNode(previousSibling)) {
    previousSibling = previousSibling.getPreviousSibling();
  }
  if (previousSibling && $isSomeChapterNode(previousSibling)) return previousSibling;
}

/**
 * Remove the given node and all the nodes after.
 * @param nodes - Nodes to prune.
 * @param pruneNode - Node to prune and all nodes after.
 */
export function removeNodeAndAfter(nodes: LexicalNode[], pruneNode: LexicalNode | undefined) {
  if (!pruneNode) return;

  const pruneNodeIndex = nodes.findIndex((node) => node === pruneNode);
  // prune node and after
  if (pruneNodeIndex) nodes.length = pruneNodeIndex;
}

/**
 * Removes all the nodes that proceed the given node.
 * @param nodes - Nodes to prune.
 * @param firstNode - Node to prune before.
 * @returns the nodes from the node and after.
 */
export function removeNodesBeforeNode(
  nodes: LexicalNode[],
  firstNode: LexicalNode | undefined,
): LexicalNode[] {
  if (!firstNode) return nodes;

  const firstNodeIndex = firstNode.getIndexWithinParent();
  return nodes.splice(firstNodeIndex + 1, nodes.length - firstNodeIndex - 1);
}

/**
 * Gets the opening marker text.
 * @param marker - Verse marker.
 * @returns the opening marker text.
 */
export function openingMarkerText(marker: string): string {
  return `\\${marker}`;
}

/**
 * Gets the closing marker text.
 * @param marker - Verse marker.
 * @returns the closing marker text.
 */
export function closingMarkerText(marker: string): string {
  return `\\${marker}*`;
}

/**
 * Parse number from marker text.
 * @param marker - Chapter or verse marker.
 * @param text - Text to parse.
 * @param number - Default number to use if none is found.
 * @returns the parsed number or the default value as a string.
 */
export function parseNumberFromMarkerText(
  marker: string,
  text: string | undefined,
  number: string,
): string {
  const openMarkerText = openingMarkerText(marker);
  if (text?.startsWith(openMarkerText)) {
    const numberText = parseInt(text.slice(openMarkerText.length), 10);
    if (!isNaN(numberText)) number = numberText.toString();
  }
  return number;
}

/**
 * Gets the open marker text with the marker visible.
 * @param marker - Verse marker.
 * @param content - Content such as chapter or verse number.
 * @returns the marker text with the open marker visible.
 */
export function getVisibleOpenMarkerText(marker: string, content: string | undefined): string {
  let text = openingMarkerText(marker);
  if (content) text += `${NBSP}${content}`;
  text += " ";
  return text;
}

/**
 * Gets the preview text for a serialized note caller.
 * @param childNodes - Child nodes of the NoteNode.
 * @returns the preview text.
 */
export function getPreviewTextFromSerializedNodes(childNodes: SerializedLexicalNode[]): string {
  const previewText = childNodes
    .reduce((text, node) => text + (isSerializedCharNode(node) ? ` ${node.text}` : ""), "")
    .trim();
  return previewText;
}

/**
 * Get editable note caller text.
 * @param noteCaller - Note caller.
 * @returns caller text.
 */
export function getEditableCallerText(noteCaller: string): string {
  return NBSP + noteCaller + " ";
}

/**
 * Gets the preview text for a note caller.
 * @param childNodes - Child nodes of the NoteNode.
 * @returns the preview text.
 */
export function getNoteCallerPreviewText(childNodes: LexicalNode[]): string {
  const previewText = childNodes
    .reduce((text, node) => text + ($isCharNode(node) ? ` ${node.getTextContent()}` : ""), "")
    .trim();
  return previewText;
}

/**
 * Remove all known properties of the `markerObject`.
 * @param markerObject - Scripture marker and its contents.
 * @returns all the unknown properties or `undefined` if all are known.
 */
export function getUnknownAttributes(markerObject: MarkerObject): UnknownAttributes | undefined {
  const attributes: Partial<MarkerObject> = { ...markerObject };
  MARKER_OBJECT_PROPS.forEach((property) => delete attributes[property]);
  return Object.keys(attributes).length === 0 ? undefined : (attributes as UnknownAttributes);
}

/**
 * Retrieves the lowercase tag name of the DOM element associated with a LexicalNode.
 * @param node - The LexicalNode for which to find the corresponding DOM element's tag name.
 * @param editor - The LexicalEditor instance used to access the DOM.
 * @returns The lowercase tag name of the DOM element if found, or `undefined` if no corresponding
 *   DOM element exists.
 */
export function getNodeElementTagName(
  node: LexicalNode,
  editor: LexicalEditor,
): string | undefined {
  const domElement = editor.getElementByKey(node.getKey());
  return domElement ? domElement.tagName.toLowerCase() : undefined;
}

/**
 * Removes properties with undefined values from an object.
 *
 * @template T - The type of the input object.
 * @param obj - The object to remove undefined properties from.
 * @returns A new object with the same type as the input, but with undefined properties removed.
 *
 * @example
 * const input = { a: 1, b: undefined, c: 'hello' };
 * const result = removeUndefinedProperties(input);
 * // result: { a: 1, c: 'hello' }
 *
 * @remarks
 * This function creates a new object and does not modify the original input object.
 */
export function removeUndefinedProperties<T>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj as Partial<T>).filter(([, value]) => value !== undefined),
  ) as T;
}

/**
 * Checks if the node has a `getMarker` method. Excludes React nodes - consider using
 * `$isReactNodeWithMarker` instead.
 * @param node - LexicalNode to check.
 * @returns `true` if the node has a `getMarker` method, `false` otherwise.
 */
export function $isNodeWithMarker(node: LexicalNode | null | undefined): node is NodesWithMarker {
  return (
    $isBookNode(node) ||
    $isChapterNode(node) ||
    $isCharNode(node) ||
    $isImmutableChapterNode(node) ||
    $isMilestoneNode(node) ||
    $isParaNode(node) ||
    $isNoteNode(node) ||
    $isVerseNode(node) ||
    $isUnknownNode(node)
    // ImmutableUnmatchedNode & MarkerNode also have the `getMarker` method but they left out for
    // now until we know we need them.
  );
}

/**
 * Get the next verse number or segment.
 *
 * A verse range increments the end of the range (even if the range includes segments), and a verse
 * segment increments the segment character. This is intentional to simplify the UX.
 * @param verseNum - The current verse number.
 * @param verse - The current verse string, which can be a single verse, a range, or a segment.
 * @returns The next verse number or segment as a string.
 */

export function getNextVerse(verseNum: number, verse: string | undefined): string {
  if (!verse) return (verseNum + 1).toString();

  const verseParts = verse.split("-");
  if (verseParts.length === 2)
    return parseInt(verseParts[1])
      ? `${parseInt(verseParts[1]) + 1}`
      : `${parseInt(verseParts[0]) + 1}`;

  // Don't increment beyond 'z' or 'Z'.
  const verseSegment = RegExp(/(\d+)([a-yA-Y]+)/).exec(verse);
  if (!verseSegment) return (parseInt(verse) + 1).toString();

  const nextSegmentChar = String.fromCharCode(verseSegment[2].charCodeAt(0) + 1);
  return `${verseSegment[1]}${nextSegmentChar}`;
}

/**
 * Determines if the verse number is in the given verse range. Verse segments are accounted for.
 * @param verseNum - The current verse number.
 * @param verseRange - The verse range including segments.
 * @returns `true` if the verse number is in the range, `false` otherwise.
 * @example
 *   verseRange "1-2" - verseNum 1 and 2 are `true`
 *   verseRange "1a-2b" - verseNum 1 and 2 are `true`
 *   verseRange "1-3" -  verseNum 1, 2, and 3 are `true`
 */
export function isVerseInRange(verseNum: number, verseRange: string): boolean {
  const verseNumParts = verseRange.split("-").map((v) => parseInt(v));
  if (verseNumParts.length < 1 || verseNumParts.length > 2)
    throw new Error("isVerseInRange: invalid range");

  return verseNumParts.length === 1
    ? verseNum === verseNumParts[0]
    : verseNum >= verseNumParts[0] && verseNum <= verseNumParts[1];
}

/**
 * Find a common ancestor of a and b and return the common ancestor,
 * or undefined if there is no common ancestor between the two nodes.
 *
 * This function is compatible with the deprecated `LexicalNode.getCommonAncestor` function but
 * uses the new (as of Lexical v0.26.0) NodeCaret APIs.
 *
 * @param a A LexicalNode
 * @param b A LexicalNode
 * @returns The common ancestor between the two nodes or undefined if they have no common ancestor
 */
export function $getCommonAncestorCompatible(
  a: LexicalNode,
  b: LexicalNode,
): LexicalNode | undefined {
  const a1 = $isElementNode(a) ? a : a.getParent();
  const b1 = $isElementNode(b) ? b : b.getParent();
  const result = a1 && b1 ? $getCommonAncestor(a1, b1) : undefined;
  return result ? result.commonAncestor : undefined;
}
