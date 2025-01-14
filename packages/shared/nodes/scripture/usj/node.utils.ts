/** Utility functions for editor nodes */

import { MARKER_OBJECT_PROPS, MarkerObject } from "@biblionexus-foundation/scripture-utilities";
import { LexicalEditor, LexicalNode, SerializedLexicalNode } from "lexical";
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
type ChapterNodes = ChapterNode | ImmutableChapterNode;

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
  return markers.filter((marker) => !(marker && marker.endsWith(NUMBERED_MARKER_PLACEHOLDER)));
}

/**
 * Finds the chapter node with the given chapter number amongst the nodes.
 * @param nodes - Nodes to look in.
 * @param chapterNum - Chapter number to look for.
 * @param ChapterNodeClass - Use a different chapter node class if needed.
 * @returns the chapter node if found, `undefined` otherwise.
 */
export function findChapter<T extends ChapterNodes = ImmutableChapterNode>(
  nodes: LexicalNode[],
  chapterNum: number,
  ChapterNodeClass: typeof LexicalNode = ImmutableChapterNode,
) {
  return nodes.find(
    (node) =>
      node.getType() === ChapterNodeClass.getType() &&
      (node as T).getNumber() === chapterNum.toString(),
  ) as T | undefined;
}

/**
 * Finds the next chapter.
 * @param nodes - Nodes to look in.
 * @param isCurrentChapterAtFirstNode - If `true` ignore the first node.
 * @param ChapterNodeClass - Use a different chapter node class if needed.
 * @returns the next chapter node if found, `undefined` otherwise.
 */
export function findNextChapter<T extends ChapterNodes = ImmutableChapterNode>(
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
 * @param node - Node to find the chapter it's in.
 * @param ChapterNodeClass - Use a different chapter node class if needed.
 * @returns the chapter node if found, `undefined` otherwise.
 */
export function findThisChapter<T extends ChapterNodes = ImmutableChapterNode>(
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
 * Remove the given node and all the nodes after.
 * @param nodes - Nodes to prune.
 * @param firstNode - First node in nodes.
 * @param pruneNode - Node to prune and all nodes after.
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
 * @param nodes - Nodes to prune.
 * @param firstNode - Node to prune before.
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
  if (text && text.startsWith(openMarkerText)) {
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
