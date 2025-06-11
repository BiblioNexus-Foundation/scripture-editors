/** This file avoids a circular dependency between `CharNode.ts` and `node.utils.ts`. */

export type UnknownAttributes = { [name: string]: string | undefined };

export const PARA_MARKER_DEFAULT = "p";

export const NBSP = "\u00A0";
export const ZWSP = "\u200B";

export const CHAPTER_CLASS_NAME = "chapter";
export const VERSE_CLASS_NAME = "verse";
export const INVALID_CLASS_NAME = "invalid";
export const TEXT_SPACING_CLASS_NAME = "text-spacing";
export const FORMATTED_FONT_CLASS_NAME = "formatted-font";
export const MARKER_MODE_CLASS_NAME_PREFIX = "marker-";

export const EXTERNAL_USJ_MUTATION_TAG = "external-usj-mutation";
export const SELECTION_CHANGE_TAG = "selection-change";
export const CURSOR_CHANGE_TAG = "cursor-change";
export const ANNOTATION_CHANGE_TAG = "annotation-change";
export const DELTA_CHANGE_TAG = "delta-change";
/** Tags that should not be present when handling a USJ change. */
export const blackListedChangeTags = [
  EXTERNAL_USJ_MUTATION_TAG,
  SELECTION_CHANGE_TAG,
  CURSOR_CHANGE_TAG,
  ANNOTATION_CHANGE_TAG,
  DELTA_CHANGE_TAG,
];
