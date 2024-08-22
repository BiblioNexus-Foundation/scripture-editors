import {
  MarkerContent,
  MarkerObject,
  USJ_TYPE,
  USJ_VERSION,
  Usj,
} from "@biblionexus-foundation/scripture-utilities";
import {
  EditorState,
  LineBreakNode,
  SerializedLexicalNode,
  SerializedTextNode,
  TextNode,
} from "lexical";
import {
  NBSP,
  getEditableCallerText,
  parseNumberFromMarkerText,
  removeEndingZwsp,
  removeSpacesFromMarkerContent,
  removeUndefinedProperties,
} from "shared/nodes/scripture/usj/node.utils";
import { BookNode, SerializedBookNode } from "shared/nodes/scripture/usj/BookNode";
import { ChapterNode, SerializedChapterNode } from "shared/nodes/scripture/usj/ChapterNode";
import { CharNode, SerializedCharNode } from "shared/nodes/scripture/usj/CharNode";
import {
  ImmutableChapterNode,
  SerializedImmutableChapterNode,
} from "shared/nodes/scripture/usj/ImmutableChapterNode";
import {
  ImpliedParaNode,
  SerializedImpliedParaNode,
} from "shared/nodes/scripture/usj/ImpliedParaNode";
import { MarkerNode } from "shared/nodes/scripture/usj/MarkerNode";
import { MilestoneNode, SerializedMilestoneNode } from "shared/nodes/scripture/usj/MilestoneNode";
import { NoteNode, SerializedNoteNode } from "shared/nodes/scripture/usj/NoteNode";
import { ParaNode, SerializedParaNode } from "shared/nodes/scripture/usj/ParaNode";
import { SerializedUnknownNode, UnknownNode } from "shared/nodes/scripture/usj/UnknownNode";
import { SerializedVerseNode, VerseNode } from "shared/nodes/scripture/usj/VerseNode";
import { ImmutableNoteCallerNode } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import {
  ImmutableVerseNode,
  SerializedImmutableVerseNode,
} from "shared-react/nodes/scripture/usj/ImmutableVerseNode";
import { LoggerBasic } from "shared-react/plugins/logger-basic.model";

interface EditorUsjAdaptor {
  initialize: typeof initialize;
  deserializeEditorState: typeof deserializeEditorState;
}

/** Logger instance */
let _logger: LoggerBasic;

export function initialize(logger: LoggerBasic | undefined) {
  if (logger) _logger = logger;
}

export function deserializeEditorState(editorState: EditorState): Usj | undefined {
  if (editorState.isEmpty()) return { type: USJ_TYPE, version: USJ_VERSION, content: [] };

  const serializedEditorState = editorState.toJSON();
  if (!serializedEditorState.root || !serializedEditorState.root.children) return;

  const rootChildren = serializedEditorState.root.children;
  // check for default empty para node
  if (
    rootChildren.length === 1 &&
    rootChildren[0].type === "para" &&
    (rootChildren[0] as SerializedParaNode).marker === "p" &&
    (!(rootChildren[0] as SerializedParaNode).children ||
      (rootChildren[0] as SerializedParaNode).children.length === 0)
  )
    return { type: USJ_TYPE, version: USJ_VERSION, content: [] };

  const children = removeImpliedParasRecurse(rootChildren);
  const content = recurseNodes(children);
  if (!content) return;

  const usj: Usj = { type: USJ_TYPE, version: USJ_VERSION, content };
  return usj;
}

function createBookMarker(
  node: SerializedBookNode,
  content: MarkerContent[] | undefined,
): MarkerObject {
  const { type, marker, code, unknownAttributes } = node;
  return removeUndefinedProperties({
    type,
    marker,
    code,
    ...unknownAttributes,
    content,
  });
}

function createImmutableChapterMarker(node: SerializedImmutableChapterNode): MarkerObject {
  const { marker, number, sid, altnumber, pubnumber, unknownAttributes } = node;
  return removeUndefinedProperties({
    type: ChapterNode.getType(),
    marker,
    number,
    sid,
    altnumber,
    pubnumber,
    ...unknownAttributes,
  });
}

function createChapterMarker(
  node: SerializedChapterNode,
  content: MarkerContent[] | undefined,
): MarkerObject {
  const { marker, sid, altnumber, pubnumber, unknownAttributes } = node;
  const text = content && typeof content[0] === "string" ? content[0] : undefined;
  let { number } = node;
  number = parseNumberFromMarkerText(marker, text, number);
  return removeUndefinedProperties({
    type: ChapterNode.getType(),
    marker,
    number,
    sid,
    altnumber,
    pubnumber,
    ...unknownAttributes,
  });
}

function createVerseMarker(node: SerializedImmutableVerseNode | SerializedVerseNode): MarkerObject {
  const { marker, sid, altnumber, pubnumber, unknownAttributes } = node;
  const { text } = node as SerializedVerseNode;
  let { number } = node;
  number = parseNumberFromMarkerText(marker, text, number);
  return removeUndefinedProperties({
    type: VerseNode.getType(),
    marker,
    number,
    sid,
    altnumber,
    pubnumber,
    ...unknownAttributes,
  });
}

function createCharMarker(node: SerializedCharNode): MarkerObject {
  const { type, marker, unknownAttributes } = node;
  let { text } = node;
  if (text.startsWith(NBSP)) text = text.slice(1);
  return removeUndefinedProperties({
    type,
    marker,
    ...unknownAttributes,
    content: [text],
  });
}

function createParaMarker(
  node: SerializedParaNode,
  content: MarkerContent[] | undefined,
): MarkerObject {
  const { type, marker, unknownAttributes } = node;
  return removeUndefinedProperties({
    type,
    marker,
    ...unknownAttributes,
    content,
  });
}

function createNoteMarker(
  node: SerializedNoteNode,
  content: MarkerContent[] | undefined,
): MarkerObject {
  const { type, marker, caller, category, unknownAttributes } = node;
  content = removeSpacesFromMarkerContent(content);
  removeEndingZwsp(content);
  return removeUndefinedProperties({
    type,
    marker,
    caller,
    category,
    ...unknownAttributes,
    content,
  });
}

function createMilestoneMarker(node: SerializedMilestoneNode): MarkerObject {
  const { type, marker, sid, eid, unknownAttributes } = node;
  return removeUndefinedProperties({
    type,
    marker,
    sid,
    eid,
    ...unknownAttributes,
  });
}

function createTextMarker(node: SerializedTextNode): string {
  return node.text;
}

function createUnknownMarker(
  node: SerializedUnknownNode,
  content: MarkerContent[] | undefined,
): MarkerObject {
  const { tag, marker, unknownAttributes } = node;
  return removeUndefinedProperties({
    type: tag,
    marker,
    ...unknownAttributes,
    content,
  });
}

export function recurseNodes(
  nodes: SerializedLexicalNode[],
  noteCaller?: string,
): MarkerContent[] | undefined {
  const markers: MarkerContent[] = [];
  nodes.forEach((node) => {
    const serializedBookNode = node as SerializedBookNode;
    const serializedChapterNode = node as SerializedChapterNode;
    const serializedParaNode = node as SerializedParaNode;
    const serializedNoteNode = node as SerializedNoteNode;
    const serializedTextNode = node as SerializedTextNode;
    const serializedUnknownNode = node as SerializedUnknownNode;
    switch (node.type) {
      case BookNode.getType():
        markers.push(
          createBookMarker(serializedBookNode, recurseNodes(serializedBookNode.children)),
        );
        break;
      case ImmutableChapterNode.getType():
        markers.push(createImmutableChapterMarker(node as SerializedImmutableChapterNode));
        break;
      case ChapterNode.getType():
        markers.push(
          createChapterMarker(serializedChapterNode, recurseNodes(serializedChapterNode.children)),
        );
        break;
      case ImmutableVerseNode.getType():
      case VerseNode.getType():
        markers.push(createVerseMarker(node as SerializedImmutableVerseNode | SerializedVerseNode));
        break;
      case CharNode.getType():
        markers.push(createCharMarker(node as SerializedCharNode));
        break;
      case ParaNode.getType():
        markers.push(
          createParaMarker(serializedParaNode, recurseNodes(serializedParaNode.children)),
        );
        break;
      case NoteNode.getType():
        markers.push(
          createNoteMarker(
            serializedNoteNode,
            recurseNodes(serializedNoteNode.children, serializedNoteNode.caller),
          ),
        );
        break;
      case ImmutableNoteCallerNode.getType():
      case MarkerNode.getType():
      case LineBreakNode.getType():
        // These nodes are for presentation only so they don't go into the USJ.
        break;
      case MilestoneNode.getType():
        markers.push(createMilestoneMarker(node as SerializedMilestoneNode));
        break;
      case TextNode.getType():
        if (
          serializedTextNode.text &&
          serializedTextNode.text !== NBSP &&
          (!noteCaller || serializedTextNode.text !== getEditableCallerText(noteCaller))
        ) {
          markers.push(createTextMarker(serializedTextNode));
        }
        break;
      case UnknownNode.getType():
        markers.push(
          createUnknownMarker(serializedUnknownNode, recurseNodes(serializedUnknownNode.children)),
        );
        break;
      default:
        _logger?.error(`Unexpected node type '${node.type}'!`);
    }
  });
  // Ensure empty arrays are removed.
  return markers && markers.length > 0 ? markers : undefined;
}

/**
 * Remove implied paras.
 * @param nodes - serialized nodes.
 * @returns nodes with all implied paras removed.
 */
function removeImpliedParasRecurse(nodes: SerializedLexicalNode[]): SerializedLexicalNode[] {
  const impliedParaIndex = nodes.findIndex((node) => node.type === ImpliedParaNode.getType());
  if (impliedParaIndex >= 0) {
    const nodesBefore = nodes.slice(0, impliedParaIndex);
    const nodesFromImpliedPara = (nodes[impliedParaIndex] as SerializedImpliedParaNode).children;
    const nodesAfter = removeImpliedParasRecurse(nodes.slice(impliedParaIndex + 1));
    nodes = [...nodesBefore, ...nodesFromImpliedPara, ...nodesAfter];
  }
  return nodes;
}

const editorUsjAdaptor: EditorUsjAdaptor = {
  initialize,
  deserializeEditorState,
};
export default editorUsjAdaptor;
