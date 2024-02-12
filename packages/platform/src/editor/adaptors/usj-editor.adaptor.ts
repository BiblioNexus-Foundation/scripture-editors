import {
  LineBreakNode,
  SerializedEditorState,
  SerializedElementNode,
  SerializedLexicalNode,
  SerializedLineBreakNode,
  SerializedTextNode,
  TextNode,
} from "lexical";
import {
  MarkerContent,
  MarkerObject,
  USJ_TYPE,
  USJ_VERSION,
  Usj,
} from "shared/converters/usj/usj.model";
import { deserializeUsjType } from "shared/converters/usj/usj.util";
import {
  BOOK_STYLE,
  BOOK_VERSION,
  BookNode,
  SerializedBookNode,
} from "shared/nodes/scripture/usj/BookNode";
import {
  SerializedImmutableChapterNode,
  CHAPTER_STYLE,
  IMMUTABLE_CHAPTER_VERSION,
  ImmutableChapterNode,
} from "shared/nodes/scripture/usj/ImmutableChapterNode";
import {
  SerializedChapterNode,
  CHAPTER_VERSION,
  ChapterNode,
} from "shared/nodes/scripture/usj/ChapterNode";
import { CHAR_VERSION, CharNode, SerializedCharNode } from "shared/nodes/scripture/usj/CharNode";
import {
  MILESTONE_VERSION,
  MilestoneNode,
  MilestoneUsxStyle,
  SerializedMilestoneNode,
} from "shared/nodes/scripture/usj/MilestoneNode";
import {
  IMPLIED_PARA_VERSION,
  ImpliedParaNode,
  SerializedImpliedParaNode,
} from "shared/nodes/scripture/usj/ImpliedParaNode";
import {
  PARA_STYLE_DEFAULT,
  PARA_VERSION,
  ParaNode,
  SerializedParaNode,
} from "shared/nodes/scripture/usj/ParaNode";
import {
  NOTE_VERSION,
  NoteNode,
  NoteUsxStyle,
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
  VERSE_STYLE,
  IMMUTABLE_VERSE_VERSION,
  ImmutableVerseNode,
} from "shared/nodes/scripture/usj/ImmutableVerseNode";
import {
  SerializedVerseNode,
  VERSE_VERSION,
  VerseNode,
} from "shared/nodes/scripture/usj/VerseNode";
import { MarkerNode, SerializedMarkerNode } from "shared/nodes/scripture/usj/MarkerNode";
import {
  NBSP,
  NO_INDENT_CLASS_NAME,
  PLAIN_FONT_CLASS_NAME,
  getPreviewTextFromSerializedNodes,
  getVisibleOpenMarkerText,
} from "shared/nodes/scripture/usj/node.utils";
import { EditorAdaptor, NodeOptions } from "shared-react/adaptors/editor-adaptor.model";
import { LoggerBasic } from "shared-react/plugins/logger-basic.model";
import { ViewOptions, getViewOptions } from "./view-options.utils";

export interface UsjNodeOptions extends NodeOptions {
  [immutableNoteCallerNodeName]?: {
    noteCallers?: string[];
    onClick?: OnClick;
  };
}

interface UsjEditorAdaptor extends EditorAdaptor {
  initialize: typeof initialize;
  reset: typeof reset;
  loadEditorState: typeof loadEditorState;
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
let _nodeOptions: UsjNodeOptions = {};
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

export function loadEditorState(
  usj: Usj | undefined,
  viewOptions?: ViewOptions,
): SerializedEditorState {
  if (viewOptions) _viewOptions = viewOptions;
  // use default view mode
  else _viewOptions = getViewOptions(undefined);
  /** empty para node for an 'empty' editor */
  const emptyParaNode: SerializedParaNode = createPara(PARA_STYLE_DEFAULT);
  let children: SerializedElementNode[];
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
 * Get the note caller to use. E.g. for '+' replace with a-z, aa-zz.
 * @param markerCaller - the specified note caller.
 * @returns the specified caller, if '+' replace with up to 2 characters from the possible note
 *   callers list, '*' if undefined.
 */
function getNoteCaller(markerCaller: string | undefined): string {
  const optionsNoteCallers = _nodeOptions[immutableNoteCallerNodeName]?.noteCallers;
  const noteCallers =
    optionsNoteCallers && optionsNoteCallers.length > 0 ? optionsNoteCallers : defaultNoteCallers;
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

function createBook(style: string, marker: MarkerObject): SerializedBookNode | undefined {
  if (!marker.code) {
    _logger?.error(`Unexpected book code '${marker.code}'!`);
    return undefined;
  }
  if (style !== BOOK_STYLE) {
    _logger?.error(`Unexpected book style '${style}'!`);
    return undefined;
  }

  return {
    type: BookNode.getType(),
    usxStyle: BOOK_STYLE,
    code: marker.code,
    text: getTextContent(marker.content),
    children: [],
    direction: null,
    format: "",
    indent: 0,
    version: BOOK_VERSION,
  };
}

function createChapter(
  style: string,
  marker: MarkerObject,
): SerializedChapterNode | SerializedImmutableChapterNode | undefined {
  if (style !== CHAPTER_STYLE) {
    _logger?.error(`Unexpected chapter style '${style}'!`);
    return undefined;
  }
  const node = { ...marker };
  delete node.content;
  const ChapterNodeClass = getChapterNodeClass(_viewOptions) ?? ImmutableChapterNode;
  const type = ChapterNodeClass.getType();
  const version =
    _viewOptions?.markerMode === "editable" ? CHAPTER_VERSION : IMMUTABLE_CHAPTER_VERSION;
  let text: string | undefined;
  let classList: string[] | undefined;
  let showMarker: boolean | undefined;
  if (_viewOptions?.markerMode === "editable") {
    text = getVisibleOpenMarkerText(style, marker.number);
    classList = [PLAIN_FONT_CLASS_NAME];
  } else if (_viewOptions?.markerMode === "visible") showMarker = true;

  return {
    ...node,
    type,
    text,
    usxStyle: CHAPTER_STYLE,
    number: marker.number ?? "",
    classList,
    showMarker,
    version,
  };
}

function createVerse(
  style: string,
  marker: MarkerObject,
): SerializedVerseNode | SerializedImmutableVerseNode | undefined {
  if (style !== VERSE_STYLE) {
    _logger?.error(`Unexpected verse style '${style}'!`);
    return undefined;
  }
  const node = { ...marker };
  delete node.content;
  const VerseNodeClass = getVerseNodeClass(_viewOptions) ?? ImmutableVerseNode;
  const type = VerseNodeClass.getType();
  const version = _viewOptions?.markerMode === "editable" ? VERSE_VERSION : IMMUTABLE_VERSE_VERSION;
  let text: string | undefined;
  let classList: string[] | undefined;
  let showMarker: boolean | undefined;
  if (_viewOptions?.markerMode === "editable") {
    text = getVisibleOpenMarkerText(style, marker.number);
    classList = [PLAIN_FONT_CLASS_NAME];
  } else if (_viewOptions?.markerMode === "visible") showMarker = true;

  return {
    ...node,
    type,
    text,
    usxStyle: VERSE_STYLE,
    number: marker.number ?? "",
    classList,
    showMarker,
    version,
  };
}

function createChar(style: string, marker: MarkerObject): SerializedCharNode {
  if (!CharNode.isValidStyle(style)) {
    _logger?.warn(`Unexpected char style '${style}'!`);
  }
  let text = getTextContent(marker.content);
  if (_viewOptions?.markerMode === "visible" || _viewOptions?.markerMode === "editable")
    text = NBSP + text;

  return {
    type: CharNode.getType(),
    usxStyle: style,
    text,
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
    version: CHAR_VERSION,
  };
}

function createImpliedPara(
  children: (SerializedTextNode | SerializedElementNode)[],
): SerializedImpliedParaNode {
  return {
    type: ImpliedParaNode.getType(),
    children,
    direction: null,
    format: "",
    indent: 0,
    version: IMPLIED_PARA_VERSION,
  };
}

function createPara(style: string): SerializedParaNode {
  if (!ParaNode.isValidStyle(style)) {
    _logger?.warn(`Unexpected para style '${style}'!`);
    // Always return with data as other elements need this structure.
  }
  const classList: string[] = [];
  if (!_viewOptions?.isIndented) classList.push(NO_INDENT_CLASS_NAME);
  if (_viewOptions?.isPlainFont) classList.push(PLAIN_FONT_CLASS_NAME);
  const children: SerializedLexicalNode[] = [];
  if (_viewOptions?.markerMode === "editable") children.push(createMarker(style), createText(NBSP));

  return {
    type: ParaNode.getType(),
    usxStyle: style,
    classList,
    children,
    direction: null,
    format: "",
    indent: 0,
    version: PARA_VERSION,
  };
}

function createNoteCaller(
  caller: string,
  childNodes: (SerializedElementNode | SerializedTextNode)[],
): SerializedImmutableNoteCallerNode {
  const previewText = getPreviewTextFromSerializedNodes(childNodes);
  const onClick =
    (_nodeOptions[immutableNoteCallerNodeName]?.onClick as OnClick) ?? (() => undefined);

  return {
    type: ImmutableNoteCallerNode.getType(),
    caller,
    previewText,
    onClick,
    version: IMMUTABLE_NOTE_CALLER_VERSION,
  };
}

function createNote(
  style: string,
  marker: MarkerObject,
  childNodes: (SerializedElementNode | SerializedTextNode)[],
): SerializedNoteNode {
  if (!NoteNode.isValidStyle(style)) {
    _logger?.warn(`Unexpected note style '${style}'!`);
  }
  const caller = marker.caller ?? "*";
  let callerNode: SerializedImmutableNoteCallerNode | SerializedTextNode;
  if (_viewOptions?.markerMode === "editable") {
    callerNode = createText(NBSP + caller + " ");
  } else {
    callerNode = createNoteCaller(getNoteCaller(marker.caller), childNodes);
    childNodes.forEach((node) => {
      (node as SerializedTextNode).style = "display: none";
    });
  }
  let openingMarkerNode: SerializedTextNode | undefined;
  let closingMarkerNode: SerializedTextNode | undefined;
  if (_viewOptions?.markerMode === "visible" || _viewOptions?.markerMode === "editable") {
    openingMarkerNode = createMarker(style);
    closingMarkerNode = createMarker(style, false);
  }
  const children: SerializedLexicalNode[] = [];
  if (openingMarkerNode) children.push(openingMarkerNode);
  children.push(callerNode, ...childNodes);
  if (closingMarkerNode) children.push(closingMarkerNode);
  const node = { ...marker };
  delete node.content;

  return {
    ...node,
    type: NoteNode.getType(),
    usxStyle: style as NoteUsxStyle,
    caller,
    children,
    direction: null,
    format: "",
    indent: 0,
    version: NOTE_VERSION,
  };
}

function createMilestone(style: string, marker: MarkerObject): SerializedMilestoneNode | undefined {
  if (!MilestoneNode.isValidStyle(style)) {
    _logger?.error(`Unexpected milestone style '${style}'!`);
    return undefined;
  }
  const node = { ...marker };
  delete node.content;

  return {
    ...node,
    type: MilestoneNode.getType(),
    usxStyle: style as MilestoneUsxStyle,
    version: MILESTONE_VERSION,
  };
}

function createMarker(style: string, isOpening = true): SerializedMarkerNode {
  return {
    type: MarkerNode.getType(),
    usxStyle: style,
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

function addNode(
  lexicalNode: SerializedLexicalNode | undefined,
  elementNodes: (SerializedElementNode | SerializedTextNode)[],
) {
  if (lexicalNode) {
    (elementNodes as SerializedLexicalNode[]).push(lexicalNode);
  }
}

function addOpeningMarker(
  style: string,
  lexicalNode: SerializedLexicalNode | undefined,
  elementNodes: (SerializedElementNode | SerializedTextNode)[],
) {
  if (
    lexicalNode &&
    (_viewOptions?.markerMode === "visible" || _viewOptions?.markerMode === "editable")
  ) {
    (elementNodes as SerializedLexicalNode[]).push(createMarker(style));
  }
}

function addClosingMarker(
  style: string,
  lexicalNode: SerializedLexicalNode | undefined,
  elementNodes: (SerializedElementNode | SerializedTextNode)[],
) {
  if (
    lexicalNode &&
    (_viewOptions?.markerMode === "visible" || _viewOptions?.markerMode === "editable") &&
    !(CharNode.isValidFootnoteStyle(style) || CharNode.isValidCrossReferenceStyle(style))
  ) {
    (elementNodes as SerializedLexicalNode[]).push(createMarker(style, false));
  }
}

function recurseNodes(
  markers: MarkerContent[] | undefined,
): (SerializedElementNode | SerializedTextNode)[] {
  const elementNodes: (SerializedElementNode | SerializedTextNode)[] = [];
  markers?.forEach((marker) => {
    if (typeof marker === "string") {
      elementNodes.push(createText(marker));
    } else {
      let lexicalNode: SerializedLexicalNode | undefined;
      let elementNode: SerializedElementNode | undefined;
      const { element, style } = deserializeUsjType(marker.type);
      switch (element) {
        case "book":
          lexicalNode = createBook(style, marker);
          addNode(lexicalNode, elementNodes);
          break;
        case "chapter":
          lexicalNode = createChapter(style, marker);
          addNode(lexicalNode, elementNodes);
          break;
        case "verse":
          lexicalNode = createVerse(style, marker);
          if (!_viewOptions?.isIndented) addNode(serializedLineBreakNode, elementNodes);
          addNode(lexicalNode, elementNodes);
          break;
        case "char":
          lexicalNode = createChar(style, marker);
          addOpeningMarker(style, lexicalNode, elementNodes);
          addNode(lexicalNode, elementNodes);
          addClosingMarker(style, lexicalNode, elementNodes);
          break;
        case "para":
          elementNode = createPara(style);
          if (elementNode) {
            elementNode.children.push(...recurseNodes(marker.content));
            elementNodes.push(elementNode);
          }
          break;
        case "note":
          if (marker.caller === "-") break;

          lexicalNode = createNote(style, marker, recurseNodes(marker.content));
          addNode(lexicalNode, elementNodes);
          break;
        case "ms":
          lexicalNode = createMilestone(style, marker);
          addNode(lexicalNode, elementNodes);
          break;
        default:
          if (!marker.type) break;
          _logger?.error(`Unexpected node type '${marker.type}'!`);
      }
    }
  });
  return elementNodes;
}

/**
 * Insert implied paras around any other set of nodes that contain a text element at the root.
 * @param elementNodes - serialized element nodes.
 * @returns nodes with any needed implied paras inserted.
 */
function insertImpliedParasRecurse(
  elementNodes: (SerializedElementNode | SerializedTextNode)[],
): SerializedElementNode[] {
  let nodes = elementNodes;
  const bookNodeIndex = nodes.findIndex((node) => node.type === BookNode.getType());
  const isBookNodeFound = bookNodeIndex >= 0;
  const chapterNodeIndex = nodes.findIndex((node) => node.type === ChapterNode.getType());
  const isChapterNodeFound = chapterNodeIndex >= 0;
  if (isBookNodeFound && (!isChapterNodeFound || bookNodeIndex < chapterNodeIndex)) {
    const nodesBefore = insertImpliedParasRecurse(nodes.slice(0, bookNodeIndex));
    const bookNode = nodes[bookNodeIndex];
    const nodesAfter = insertImpliedParasRecurse(nodes.slice(bookNodeIndex + 1));
    nodes = [...nodesBefore, bookNode, ...nodesAfter];
  } else if (isChapterNodeFound) {
    const nodesBefore = insertImpliedParasRecurse(nodes.slice(0, chapterNodeIndex));
    const chapterNode = nodes[chapterNodeIndex];
    const nodesAfter = insertImpliedParasRecurse(nodes.slice(chapterNodeIndex + 1));
    nodes = [...nodesBefore, chapterNode, ...nodesAfter];
  } else if (nodes.some((node) => "text" in node && "mode" in node)) {
    // If there are any text nodes as a child of this root, enclose in an implied para node.
    nodes = [createImpliedPara(nodes)];
  }

  // All root level elements are now SerializedElementNode.
  return nodes as SerializedElementNode[];
}

const usjEditorAdaptor: UsjEditorAdaptor = {
  initialize,
  reset,
  loadEditorState,
};
export default usjEditorAdaptor;
