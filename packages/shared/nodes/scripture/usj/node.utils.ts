/** Utility functions for editor nodes */

import {
  MARKER_OBJECT_PROPS,
  MarkerContent,
  MarkerObject,
} from "@biblionexus-foundation/scripture-utilities";
import { LexicalEditor, LexicalNode, SerializedLexicalNode, SerializedTextNode } from "lexical";
import { ImmutableChapterNode } from "./ImmutableChapterNode";
import { ChapterNode } from "./ChapterNode";
import { CharNode, SerializedCharNode } from "./CharNode";

export type UnknownAttributes = { [name: string]: string | undefined };

// If you want use these utils with your own chapter node, add it to this list of types.
type ChapterNodes = ChapterNode | ImmutableChapterNode;

/** RegEx to test for a string only containing digits. */
export const ONLY_DIGITS_TEST = /^\d+$/;

// Can't use `CharNode.getType()` as that sets up a circular dependency.
export const CHAR_NODE_TYPE = "char";

export const NBSP = "\u00A0";
export const ZWSP = "\u200B";

export const CHAPTER_CLASS_NAME = "chapter";
export const VERSE_CLASS_NAME = "verse";
export const INVALID_CLASS_NAME = "invalid";
export const TEXT_SPACING_CLASS_NAME = "text-spacing";
export const FORMATTED_FONT_CLASS_NAME = "formatted-font";

export const EXTERNAL_USJ_MUTATION_TAG = "external-usj-mutation";
export const SELECTION_CHANGE_TAG = "selection-change";
export const CURSOR_CHANGE_TAG = "cursor-change";
export const ANNOTATION_CHANGE_TAG = "annotation-change";
/** Tags that should not be present when handling a USJ change. */
export const blackListedChangeTags = [
  EXTERNAL_USJ_MUTATION_TAG,
  SELECTION_CHANGE_TAG,
  CURSOR_CHANGE_TAG,
  ANNOTATION_CHANGE_TAG,
];

const NUMBERED_MARKER_PLACEHOLDER = "#";

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
    .reduce(
      (text, node) =>
        text + (node.type === CHAR_NODE_TYPE ? ` ${(node as SerializedCharNode).text}` : ""),
      "",
    )
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
    .reduce(
      (text, node) =>
        text + (node.getType() === CHAR_NODE_TYPE ? ` ${(node as CharNode).getTextContent()}` : ""),
      "",
    )
    .trim();
  return previewText;
}

/**
 * Adds a Zero-Width Space (ZWSP) character to the end of an array of serialized Lexical nodes if
 * it's not already present.
 *
 * @param children - The array of serialized Lexical nodes to process.
 * @param textNodeType - The type identifier for text nodes in the Lexical structure.
 * @param createTextNodeFn - A function that creates a new serialized text node given a string.
 * @returns This function doesn't return a value; it modifies the input array in place if necessary.
 *
 * @remarks
 * - This function mutates the input array if a ZWSP needs to be added.
 * - The function only adds a ZWSP if the last child is not already a text node with ZWSP content.
 *
 * @example
 * const nodes: SerializedLexicalNode[] = [{ type: 'text', text: 'Hello' }];
 * const createTextNode = (text: string) => ({ type: 'text', text });
 * addEndingZwspIfMissing(nodes, 'text', createTextNode);
 * // nodes is now [{ type: 'text', text: 'Hello' }, { type: 'text', text: ZWSP }]
 */
export function addEndingZwspIfMissing(
  children: SerializedLexicalNode[] = [],
  textNodeType: string,
  createTextNodeFn: (text: string) => SerializedTextNode,
) {
  const lastChild = children.length > 0 ? children[children.length - 1] : undefined;
  if (
    lastChild &&
    lastChild.type === textNodeType &&
    (lastChild as SerializedTextNode).text === ZWSP
  )
    return;

  children.push(createTextNodeFn(ZWSP));
}

/**
 * Removes the Zero-Width Space (ZWSP) character from the end of a MarkerContent array if present.
 *
 * @param content - The array of MarkerContent to process.
 * @returns This function doesn't return a value; it modifies the input array in place.
 *
 * @remarks
 * - This function mutates the input array.
 * - It only removes the ZWSP if it's the last element and is a string.
 *
 * @example
 * const content: MarkerContent[] = ['Some text', 'More text', ZWSP];
 * removeEndingZwsp(content);
 * // content is now ['Some text', 'More text']
 */
export function removeEndingZwsp(content: MarkerContent[] = []) {
  const lastChild = content.length > 0 ? content[content.length - 1] : undefined;
  if (lastChild && typeof lastChild === "string" && lastChild === ZWSP) content.pop();
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
 * Checks if a node is a serialized text node.
 *
 * @param  node - The node to check.
 * @returns {boolean} True if the node is a serialized text node, false otherwise.
 */
function isSerializedTextNode(node: SerializedLexicalNode): node is SerializedTextNode {
  return node.type === "text";
}

/**
 * Adds space between note elements in an array of serialized Lexical nodes.
 *
 * @param children - The array of serialized Lexical nodes to process.
 * @param createTextNodeFn - A function that creates a new serialized text node given a string.
 * @returns {void}
 */
export function addTextSpaceBtwnNoteElements(
  children: SerializedLexicalNode[],
  createTextNodeFn: (text: string) => SerializedTextNode,
): void {
  const punctuationMarks = [".", ",", "!", "?", ":", ";", ")", "]", "}"];

  const isPunctuation = (node: SerializedLexicalNode): boolean => {
    return isSerializedTextNode(node) && punctuationMarks.includes(node.text.trim());
  };

  for (let i = children.length - 1; i > 0; i--) {
    const currentNode = children[i];
    const previousNode = children[i - 1];

    if (isPunctuation(currentNode)) continue;

    if (isSerializedTextNode(previousNode) && previousNode.text.trim() === "") continue;

    if (
      currentNode.type !== previousNode.type ||
      (currentNode.type !== "text" && previousNode.type !== "text")
    ) {
      const spaceNode = createTextNodeFn(" ");
      children.splice(i, 0, spaceNode);
    }
  }
}

/**
 * Removes standalone space elements from a mixed array of strings and CharNodes.
 *
 * @param content- The input array containing strings and CharNodes.
 * @returns  A new array with standalone space elements removed.
 */
export function removeSpacesFromMarkerContent(content: MarkerContent[] = []): MarkerContent[] {
  return content.filter((element) => {
    return typeof element !== "string" || element.trim() !== "";
  });
}
