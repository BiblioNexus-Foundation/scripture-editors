import { MarkNode, SerializedMarkNode } from "@lexical/mark";
import {
  LineBreakNode,
  SerializedEditorState,
  SerializedLexicalNode,
  SerializedLineBreakNode,
  SerializedTextNode,
  TextNode,
} from "lexical";
import {
  BookCode,
  MarkerContent,
  MarkerObject,
  USJ_TYPE,
  USJ_VERSION,
  Usj,
} from "shared/converters/usj/usj.model";
import {
  BOOK_MARKER,
  BOOK_VERSION,
  BookMarker,
  BookNode,
  SerializedBookNode,
} from "shared/nodes/scripture/usj/BookNode";
import {
  SerializedImmutableChapterNode,
  IMMUTABLE_CHAPTER_VERSION,
  ImmutableChapterNode,
} from "shared/nodes/scripture/usj/ImmutableChapterNode";
import {
  SerializedChapterNode,
  CHAPTER_VERSION,
  ChapterNode,
  CHAPTER_MARKER,
  ChapterMarker,
} from "shared/nodes/scripture/usj/ChapterNode";
import { CHAR_VERSION, CharNode, SerializedCharNode } from "shared/nodes/scripture/usj/CharNode";
import {
  MILESTONE_VERSION,
  MilestoneNode,
  MilestoneMarker,
  SerializedMilestoneNode,
  STARTING_MS_COMMENT_MARKER,
  ENDING_MS_COMMENT_MARKER,
  isMilestoneCommentMarker,
} from "shared/nodes/scripture/usj/MilestoneNode";
import {
  IMPLIED_PARA_VERSION,
  ImpliedParaNode,
  SerializedImpliedParaNode,
} from "shared/nodes/scripture/usj/ImpliedParaNode";
import {
  PARA_MARKER_DEFAULT,
  PARA_VERSION,
  ParaNode,
  SerializedParaNode,
} from "shared/nodes/scripture/usj/ParaNode";
import {
  NOTE_VERSION,
  NoteNode,
  NoteMarker,
  SerializedNoteNode,
} from "shared/nodes/scripture/usj/NoteNode";
import {
  IMMUTABLE_NOTE_CALLER_VERSION,
  ImmutableNoteCallerNode,
  OnClick,
  SerializedImmutableNoteCallerNode,
  immutableNoteCallerNodeName,
} from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import {
  SerializedImmutableVerseNode,
  IMMUTABLE_VERSE_VERSION,
  ImmutableVerseNode,
} from "shared/nodes/scripture/usj/ImmutableVerseNode";
import {
  SerializedUnknownNode,
  UNKNOWN_VERSION,
  UnknownNode,
} from "shared/nodes/scripture/usj/UnknownNode";
import {
  SerializedVerseNode,
  VERSE_MARKER,
  VERSE_VERSION,
  VerseMarker,
  VerseNode,
} from "shared/nodes/scripture/usj/VerseNode";
import { MarkerNode, SerializedMarkerNode } from "shared/nodes/scripture/usj/MarkerNode";
import {
  NBSP,
  TEXT_SPACING_CLASS_NAME,
  FORMATTED_FONT_CLASS_NAME,
  getEditableCallerText,
  getPreviewTextFromSerializedNodes,
  getUnknownAttributes,
  getVisibleOpenMarkerText,
} from "shared/nodes/scripture/usj/node.utils";
import { EditorAdaptor } from "shared-react/adaptors/editor-adaptor.model";
import { UsjNodeOptions } from "shared-react/nodes/scripture/usj/usj-node-options.model";
import { LoggerBasic } from "shared-react/plugins/logger-basic.model";
import { ViewOptions, getViewOptions } from "./view-options.utils";

interface UsjEditorAdaptor extends EditorAdaptor {
  initialize: typeof initialize;
  reset: typeof reset;
  serializeEditorState: typeof serializeEditorState;
}

const serializedLineBreakNode: SerializedLineBreakNode = {
  type: LineBreakNode.getType(),
  version: 1,
};
/** Possible note callers to use when caller is '+'. Up to 2 characters are used, e.g. a-zz */
const defaultNoteCallers = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

/** View options - view mode parameters */
let _viewOptions: ViewOptions | undefined;
/** Options for each node */
let _nodeOptions: UsjNodeOptions | undefined;
/** Count used for note callers */
let callerCount = 0;
/** Logger instance */
let _logger: LoggerBasic;

export function initialize(
  nodeOptions: UsjNodeOptions | undefined,
  logger: LoggerBasic | undefined,
) {
  setNodeOptions(nodeOptions);
  setLogger(logger);
}

export function reset(callerCountValue = 0) {
  resetCallerCount(callerCountValue);
}

export function serializeEditorState(
  usj: Usj | undefined,
  viewOptions?: ViewOptions,
): SerializedEditorState {
  if (viewOptions) _viewOptions = viewOptions;
  // use default view mode
  else _viewOptions = getViewOptions(undefined);
  /** empty para node for an 'empty' editor */
  const emptyParaNode: SerializedParaNode = createPara({
    type: ParaNode.getType(),
    marker: PARA_MARKER_DEFAULT,
  });
  let children: SerializedLexicalNode[];
  if (usj) {
    if (usj.type !== USJ_TYPE)
      _logger?.warn(`This USJ type '${usj.type}' didn't match the expected type '${USJ_TYPE}'.`);
    if (usj.version !== USJ_VERSION)
      _logger?.warn(
        `This USJ version '${usj.version}' didn't match the expected version '${USJ_VERSION}'.`,
      );

    if (usj.content.length > 0) children = insertImpliedParasRecurse(recurseNodes(usj.content));
    else children = [emptyParaNode];
  } else {
    children = [emptyParaNode];
  }

  return {
    root: {
      children,
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

/**
 * Set the node options.
 * @param nodeOptions - Node options.
 */
function setNodeOptions(nodeOptions: UsjNodeOptions | undefined) {
  if (nodeOptions) _nodeOptions = nodeOptions;
}

/**
 * Set the logger to use if needed when loading Scripture data to editor state.
 * @param logger - Logger to use.
 */
function setLogger(logger: LoggerBasic | undefined) {
  if (logger) _logger = logger;
}

/**
 * Reset the count used for note callers.
 * @param resetValue - Value to reset to. Defaults to 0.
 */
function resetCallerCount(resetValue = 0) {
  callerCount = resetValue;
}

/**
 * Get the chapter node class for the given view options.
 * @param viewOptions - View options of the editor.
 * @returns the chapter node class if the view is defined, `undefined` otherwise.
 */
export function getChapterNodeClass(viewOptions: ViewOptions | undefined) {
  if (!viewOptions) return;

  return viewOptions.markerMode === "editable" ? ChapterNode : ImmutableChapterNode;
}

/**
 * Get the verse node class for the given view options.
 * @param viewOptions - View options of the editor.
 * @returns the verse node class if the view is defined, `undefined` otherwise.
 */
export function getVerseNodeClass(viewOptions: ViewOptions | undefined) {
  if (!viewOptions) return;

  return viewOptions.markerMode === "editable" ? VerseNode : ImmutableVerseNode;
}

/**
 * Get the class list for an element node.
 * @param viewOptions - View options of the editor.
 * @returns the element class list based on view options.
 */
function getClassList(viewOptions: ViewOptions | undefined) {
  const classList: string[] = [];
  if (viewOptions?.hasSpacing) classList.push(TEXT_SPACING_CLASS_NAME);
  if (viewOptions?.isFormattedFont) classList.push(FORMATTED_FONT_CLASS_NAME);
  return classList;
}

/**
 * Get the note caller to use. E.g. for '+' replace with a-z, aa-zz.
 * @param markerCaller - the specified note caller.
 * @returns the specified caller, if '+' replace with up to 2 characters from the possible note
 *   callers list, '*' if undefined.
 */
function getNoteCaller(markerCaller: string | undefined): string {
  let noteCallers = defaultNoteCallers;
  if (_nodeOptions && _nodeOptions[immutableNoteCallerNodeName]) {
    const optionsNoteCallers = _nodeOptions[immutableNoteCallerNodeName].noteCallers;
    if (optionsNoteCallers && optionsNoteCallers.length > 0) noteCallers = optionsNoteCallers;
  }
  let caller = markerCaller;
  if (markerCaller === "+") {
    if (callerCount >= noteCallers.length ** 2 + noteCallers.length) {
      resetCallerCount();
      _logger?.warn("Note caller count was reset. Consider adding more possible note callers.");
    }

    const callerIndex = callerCount % noteCallers.length;
    let callerLeadChar = "";
    if (callerCount >= noteCallers.length) {
      const callerLeadCharIndex = Math.trunc(callerCount / noteCallers.length) - 1;
      callerLeadChar = noteCallers[callerLeadCharIndex];
    }
    caller = callerLeadChar + noteCallers[callerIndex];
    callerCount += 1;
  }
  return caller ?? "*";
}

function getTextContent(markers: MarkerContent[] | undefined): string {
  if (!markers || markers.length !== 1 || typeof markers[0] !== "string") return "";

  return markers[0];
}

function createBook(markerObject: MarkerObject): SerializedBookNode {
  const { marker, code } = markerObject;
  if (marker !== BOOK_MARKER) {
    _logger?.warn(`Unexpected book marker '${marker}'!`);
  }
  if (!code || !BookNode.isValidBookCode(code)) {
    _logger?.warn(`Unexpected book code '${code}'!`);
  }
  const unknownAttributes = getUnknownAttributes(markerObject);

  return {
    type: BookNode.getType(),
    marker: marker as BookMarker,
    code: code ?? ("" as BookCode),
    unknownAttributes,
    children: [createText(getTextContent(markerObject.content))],
    direction: null,
    format: "",
    indent: 0,
    version: BOOK_VERSION,
  };
}

function createChapter(
  markerObject: MarkerObject,
): SerializedChapterNode | SerializedImmutableChapterNode {
  const { marker, number, sid, altnumber, pubnumber } = markerObject;
  if (marker !== CHAPTER_MARKER) {
    _logger?.warn(`Unexpected chapter marker '${marker}'!`);
  }
  const ChapterNodeClass = getChapterNodeClass(_viewOptions) ?? ImmutableChapterNode;
  const type = ChapterNodeClass.getType();
  const version =
    _viewOptions?.markerMode === "editable" ? CHAPTER_VERSION : IMMUTABLE_CHAPTER_VERSION;
  let text: string | undefined;
  const classList = getClassList(_viewOptions);
  let showMarker: boolean | undefined;
  if (_viewOptions?.markerMode === "editable") text = getVisibleOpenMarkerText(marker, number);
  else if (_viewOptions?.markerMode === "visible") showMarker = true;
  const unknownAttributes = getUnknownAttributes(markerObject);

  return {
    type,
    text,
    marker: marker as ChapterMarker,
    number: number ?? "",
    classList,
    sid,
    altnumber,
    pubnumber,
    showMarker,
    unknownAttributes,
    version,
  };
}

function createVerse(
  markerObject: MarkerObject,
): SerializedVerseNode | SerializedImmutableVerseNode {
  const { marker, number, sid, altnumber, pubnumber } = markerObject;
  if (marker !== VERSE_MARKER) {
    _logger?.warn(`Unexpected verse marker '${marker}'!`);
  }
  const VerseNodeClass = getVerseNodeClass(_viewOptions) ?? ImmutableVerseNode;
  const type = VerseNodeClass.getType();
  const version = _viewOptions?.markerMode === "editable" ? VERSE_VERSION : IMMUTABLE_VERSE_VERSION;
  let text: string | undefined;
  let showMarker: boolean | undefined;
  if (_viewOptions?.markerMode === "editable") text = getVisibleOpenMarkerText(marker, number);
  else if (_viewOptions?.markerMode === "visible") showMarker = true;
  const unknownAttributes = getUnknownAttributes(markerObject);

  return {
    type,
    text,
    marker: marker as VerseMarker,
    number: number ?? "",
    sid,
    altnumber,
    pubnumber,
    showMarker,
    unknownAttributes,
    version,
  };
}

function createChar(markerObject: MarkerObject): SerializedCharNode {
  const { marker } = markerObject;
  if (!CharNode.isValidMarker(marker)) {
    _logger?.warn(`Unexpected char marker '${marker}'!`);
  }
  let text = getTextContent(markerObject.content);
  if (_viewOptions?.markerMode === "visible" || _viewOptions?.markerMode === "editable")
    text = NBSP + text;
  const unknownAttributes = getUnknownAttributes(markerObject);

  return {
    type: CharNode.getType(),
    marker,
    text,
    unknownAttributes,
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
    version: CHAR_VERSION,
  };
}

function createImpliedPara(children: SerializedLexicalNode[]): SerializedImpliedParaNode {
  return {
    type: ImpliedParaNode.getType(),
    children,
    direction: null,
    format: "",
    indent: 0,
    textFormat: 0,
    version: IMPLIED_PARA_VERSION,
  };
}

function createPara(
  markerObject: MarkerObject,
  childNodes: SerializedLexicalNode[] = [],
): SerializedParaNode {
  const { marker } = markerObject;
  if (!ParaNode.isValidMarker(marker)) {
    _logger?.warn(`Unexpected para marker '${marker}'!`);
  }
  const classList = getClassList(_viewOptions);
  const children: SerializedLexicalNode[] = [];
  if (_viewOptions?.markerMode === "editable")
    children.push(createMarker(marker), createText(NBSP));
  children.push(...childNodes);
  const unknownAttributes = getUnknownAttributes(markerObject);

  return {
    type: ParaNode.getType(),
    marker,
    classList,
    unknownAttributes,
    children,
    direction: null,
    format: "",
    indent: 0,
    textFormat: 0,
    version: PARA_VERSION,
  };
}

function createNoteCaller(
  caller: string,
  childNodes: SerializedLexicalNode[],
): SerializedImmutableNoteCallerNode {
  const previewText = getPreviewTextFromSerializedNodes(childNodes);
  let onClick: OnClick = () => undefined;
  if (
    _nodeOptions &&
    _nodeOptions[immutableNoteCallerNodeName] &&
    _nodeOptions[immutableNoteCallerNodeName].onClick
  )
    onClick = _nodeOptions[immutableNoteCallerNodeName].onClick;

  return {
    type: ImmutableNoteCallerNode.getType(),
    caller,
    previewText,
    onClick,
    version: IMMUTABLE_NOTE_CALLER_VERSION,
  };
}

function createNote(
  markerObject: MarkerObject,
  childNodes: SerializedLexicalNode[],
): SerializedNoteNode {
  const { marker, category } = markerObject;
  if (!NoteNode.isValidMarker(marker)) {
    _logger?.warn(`Unexpected note marker '${marker}'!`);
  }
  const caller = markerObject.caller ?? "*";
  let callerNode: SerializedImmutableNoteCallerNode | SerializedTextNode;
  if (_viewOptions?.markerMode === "editable") {
    callerNode = createText(getEditableCallerText(caller));
  } else {
    callerNode = createNoteCaller(getNoteCaller(markerObject.caller), childNodes);
    childNodes.forEach((node) => {
      (node as SerializedTextNode).style = "display: none";
    });
  }
  let openingMarkerNode: SerializedTextNode | undefined;
  let closingMarkerNode: SerializedTextNode | undefined;
  if (_viewOptions?.markerMode === "visible" || _viewOptions?.markerMode === "editable") {
    openingMarkerNode = createMarker(marker);
    closingMarkerNode = createMarker(marker, false);
  }
  const children: SerializedLexicalNode[] = [];
  if (openingMarkerNode) children.push(openingMarkerNode);
  children.push(callerNode, ...childNodes);
  if (closingMarkerNode) children.push(closingMarkerNode);
  const unknownAttributes = getUnknownAttributes(markerObject);

  return {
    type: NoteNode.getType(),
    marker: marker as NoteMarker,
    caller,
    category,
    unknownAttributes,
    children,
    direction: null,
    format: "",
    indent: 0,
    version: NOTE_VERSION,
  };
}

function createMilestone(markerObject: MarkerObject): SerializedMilestoneNode {
  const { marker, sid, eid } = markerObject;
  if (!marker || !MilestoneNode.isValidMarker(marker)) {
    _logger?.warn(`Unexpected milestone marker '${marker}'!`);
  }
  const unknownAttributes = getUnknownAttributes(markerObject);

  return {
    type: MilestoneNode.getType(),
    marker: marker as MilestoneMarker,
    sid,
    eid,
    unknownAttributes,
    version: MILESTONE_VERSION,
  };
}

function createMark(children: SerializedLexicalNode[], ids: string[] = []): SerializedMarkNode {
  return {
    type: MarkNode.getType(),
    ids,
    children,
    direction: null,
    format: "",
    indent: 0,
    version: 1,
  };
}

function createUnknown(
  markerObject: MarkerObject,
  childNodes: SerializedLexicalNode[],
): SerializedUnknownNode {
  const { marker } = markerObject;
  const tag = markerObject.type;
  const unknownAttributes = getUnknownAttributes(markerObject);
  const children: SerializedLexicalNode[] = [...childNodes];
  return {
    type: UnknownNode.getType(),
    tag,
    marker,
    unknownAttributes,
    children,
    direction: null,
    format: "",
    indent: 0,
    version: UNKNOWN_VERSION,
  };
}

function createMarker(marker: string, isOpening = true): SerializedMarkerNode {
  return {
    type: MarkerNode.getType(),
    marker,
    isOpening,
    text: "",
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
    version: 1,
  };
}

function createText(text: string): SerializedTextNode {
  return {
    type: TextNode.getType(),
    text,
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
    version: 1,
  };
}

function addOpeningMarker(marker: string, nodes: SerializedLexicalNode[]) {
  if (_viewOptions?.markerMode === "visible" || _viewOptions?.markerMode === "editable") {
    nodes.push(createMarker(marker));
  }
}

function addClosingMarker(marker: string, nodes: SerializedLexicalNode[]) {
  if (
    (_viewOptions?.markerMode === "visible" || _viewOptions?.markerMode === "editable") &&
    !(CharNode.isValidFootnoteMarker(marker) || CharNode.isValidCrossReferenceMarker(marker))
  ) {
    nodes.push(createMarker(marker, false));
  }
}

function reIndex(indexes: number[], offset: number): number[] {
  if (indexes.length <= 0 || offset === 0) return indexes;

  return indexes.map((index) => index - offset);
}

function removeValueFromArray<T>(arr: T[], value: T) {
  const index = arr.indexOf(value, 0);
  if (index > -1) {
    arr.splice(index, 1);
  }
}

function updateSids(sids: string[], msMarkNode: SerializedMilestoneNode) {
  if (msMarkNode.marker === STARTING_MS_COMMENT_MARKER && msMarkNode.sid !== undefined)
    sids.push(msMarkNode.sid);
  if (msMarkNode.marker === ENDING_MS_COMMENT_MARKER && msMarkNode.eid !== undefined)
    removeValueFromArray(sids, msMarkNode.eid);
}

function insertMilestoneMarksRecurse(
  nodes: SerializedLexicalNode[],
  msMarkIndexes: number[],
  isPreviousMsStarting = false,
  sids: string[] = [],
): SerializedLexicalNode[] {
  if (msMarkIndexes.length <= 0 || msMarkIndexes[0] >= nodes.length) return nodes;

  const firstIndex = msMarkIndexes.shift();
  const secondIndex = msMarkIndexes.length > 0 ? msMarkIndexes.shift() : nodes.length - 1;
  if (!firstIndex || !secondIndex) return nodes;

  const startNodes = nodes.slice(0, firstIndex);
  const nodesBefore = isPreviousMsStarting ? [createMark(startNodes, [...sids])] : startNodes;
  const firstMSMarkNode = nodes[firstIndex] as SerializedMilestoneNode;
  updateSids(sids, firstMSMarkNode);
  const markedNodes = insertMilestoneMarksRecurse(
    nodes.slice(firstIndex + 1, secondIndex),
    reIndex(msMarkIndexes, firstIndex + 1),
    firstMSMarkNode.marker === STARTING_MS_COMMENT_MARKER,
    sids,
  );
  const markNode = createMark(markedNodes, [...sids]);
  const secondMSMarkNode = nodes[secondIndex] as SerializedMilestoneNode;
  updateSids(sids, secondMSMarkNode);
  const nodesAfter = insertMilestoneMarksRecurse(
    nodes.slice(secondIndex + 1),
    reIndex(msMarkIndexes, secondIndex + 1),
    secondMSMarkNode.marker === STARTING_MS_COMMENT_MARKER,
    sids,
  );
  return [...nodesBefore, firstMSMarkNode, markNode, secondMSMarkNode, ...nodesAfter];
}

function recurseNodes(markers: MarkerContent[] | undefined): SerializedLexicalNode[] {
  const msMarkIndexes: number[] = [];
  const nodes: SerializedLexicalNode[] = [];
  markers?.forEach((markerContent) => {
    if (typeof markerContent === "string") {
      nodes.push(createText(markerContent));
    } else if (!markerContent.type) {
      _logger?.error(`Marker type is missing!`);
    } else {
      switch (markerContent.type) {
        case BookNode.getType():
          nodes.push(createBook(markerContent));
          break;
        case ChapterNode.getType():
          nodes.push(createChapter(markerContent));
          break;
        case VerseNode.getType():
          if (!_viewOptions?.hasSpacing) nodes.push(serializedLineBreakNode);
          nodes.push(createVerse(markerContent));
          break;
        case CharNode.getType():
          addOpeningMarker(markerContent.marker, nodes);
          nodes.push(createChar(markerContent));
          addClosingMarker(markerContent.marker, nodes);
          break;
        case ParaNode.getType():
          nodes.push(createPara(markerContent, recurseNodes(markerContent.content)));
          break;
        case NoteNode.getType():
          nodes.push(createNote(markerContent, recurseNodes(markerContent.content)));
          break;
        case MilestoneNode.getType():
          if (isMilestoneCommentMarker(markerContent.marker)) msMarkIndexes.push(nodes.length);
          nodes.push(createMilestone(markerContent));
          break;
        default:
          _logger?.warn(`Unknown type-marker '${markerContent.type}-${markerContent.marker}'!`);
          nodes.push(createUnknown(markerContent, recurseNodes(markerContent.content)));
      }
    }
  });
  return insertMilestoneMarksRecurse(nodes, msMarkIndexes);
}

/**
 * Insert implied paras around any other set of nodes that contain a text element at the root.
 * @param nodes - Serialized nodes.
 * @returns nodes with any needed implied paras inserted.
 */
function insertImpliedParasRecurse(nodes: SerializedLexicalNode[]): SerializedLexicalNode[] {
  const bookNodeIndex = nodes.findIndex((node) => node.type === BookNode.getType());
  const isBookNodeFound = bookNodeIndex >= 0;
  const chapterNodeIndex = nodes.findIndex((node) => node.type === ChapterNode.getType());
  const isChapterNodeFound = chapterNodeIndex >= 0;
  if (isBookNodeFound && (!isChapterNodeFound || bookNodeIndex < chapterNodeIndex)) {
    const nodesBefore = insertImpliedParasRecurse(nodes.slice(0, bookNodeIndex));
    const bookNode = nodes[bookNodeIndex];
    const nodesAfter = insertImpliedParasRecurse(nodes.slice(bookNodeIndex + 1));
    return [...nodesBefore, bookNode, ...nodesAfter];
  } else if (isChapterNodeFound) {
    const nodesBefore = insertImpliedParasRecurse(nodes.slice(0, chapterNodeIndex));
    const chapterNode = nodes[chapterNodeIndex];
    const nodesAfter = insertImpliedParasRecurse(nodes.slice(chapterNodeIndex + 1));
    return [...nodesBefore, chapterNode, ...nodesAfter];
  } else if (nodes.some((node) => "text" in node && "mode" in node)) {
    // If there are any text nodes as a child of this root, enclose in an implied para node.
    return [createImpliedPara(nodes)];
  }
  return nodes;
}

const usjEditorAdaptor: UsjEditorAdaptor = {
  initialize,
  reset,
  serializeEditorState,
};
export default usjEditorAdaptor;
