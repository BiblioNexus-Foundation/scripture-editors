import {
  EditorState,
  LineBreakNode,
  SerializedLexicalNode,
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
import { serializeUsjType } from "shared/converters/usj/usj.util";
import {
  NBSP,
  getEditableCallerText,
  openingMarkerText,
} from "shared/nodes/scripture/usj/node.utils";
import { BookNode, SerializedBookNode } from "shared/nodes/scripture/usj/BookNode";
import { ChapterNode, SerializedChapterNode } from "shared/nodes/scripture/usj/ChapterNode";
import { CharNode, SerializedCharNode } from "shared/nodes/scripture/usj/CharNode";
import {
  ImmutableChapterNode,
  SerializedImmutableChapterNode,
} from "shared/nodes/scripture/usj/ImmutableChapterNode";
import { ImmutableNoteCallerNode } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import {
  ImmutableVerseNode,
  SerializedImmutableVerseNode,
} from "shared/nodes/scripture/usj/ImmutableVerseNode";
import {
  ImpliedParaNode,
  SerializedImpliedParaNode,
} from "shared/nodes/scripture/usj/ImpliedParaNode";
import { MarkerNode } from "shared/nodes/scripture/usj/MarkerNode";
import { MilestoneNode, SerializedMilestoneNode } from "shared/nodes/scripture/usj/MilestoneNode";
import { NoteNode, SerializedNoteNode } from "shared/nodes/scripture/usj/NoteNode";
import { ParaNode, SerializedParaNode } from "shared/nodes/scripture/usj/ParaNode";
import { SerializedVerseNode, VerseNode } from "shared/nodes/scripture/usj/VerseNode";
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
    (rootChildren[0] as SerializedParaNode).usxStyle === "p" &&
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

function createBookMarker(node: SerializedBookNode): MarkerObject {
  let content: MarkerContent[] | undefined;
  if (node.text) content = [node.text];
  return {
    type: serializeUsjType(node.type, node.usxStyle),
    code: node.code,
    content,
  };
}

function parseNumberFromText(usxStyle: string, text: string | undefined, number: string): string {
  const openMarkerText = openingMarkerText(usxStyle);
  if (text && text.startsWith(openMarkerText)) {
    const numberText = parseInt(text.slice(openMarkerText.length), 10);
    if (!isNaN(numberText)) number = numberText.toString();
  }
  return number;
}

function createChapterMarker(
  node: SerializedImmutableChapterNode | SerializedChapterNode,
): MarkerObject {
  const { usxStyle, sid, altnumber, pubnumber } = node;
  const { text } = node as SerializedChapterNode;
  let { number } = node;
  number = parseNumberFromText(usxStyle, text, number);
  return {
    type: serializeUsjType(ChapterNode.getType(), usxStyle),
    number,
    sid,
    altnumber,
    pubnumber,
  };
}

function createVerseMarker(node: SerializedImmutableVerseNode | SerializedVerseNode): MarkerObject {
  const { usxStyle, sid, altnumber, pubnumber } = node;
  const { text } = node as SerializedVerseNode;
  let { number } = node;
  number = parseNumberFromText(usxStyle, text, number);
  return {
    type: serializeUsjType(VerseNode.getType(), usxStyle),
    number,
    sid,
    altnumber,
    pubnumber,
  };
}

function createCharMarker(node: SerializedCharNode): MarkerObject {
  let { text } = node;
  if (text.startsWith(NBSP)) text = text.slice(1);
  return {
    type: serializeUsjType(node.type, node.usxStyle),
    content: [text],
  };
}

function createParaMarker(
  node: SerializedParaNode,
  content: MarkerContent[] | undefined,
): MarkerObject {
  return {
    type: serializeUsjType(node.type, node.usxStyle),
    content,
  };
}

function createNoteMarker(
  node: SerializedNoteNode,
  content: MarkerContent[] | undefined,
): MarkerObject {
  const { type, usxStyle, caller, category } = node;
  return {
    type: serializeUsjType(type, usxStyle),
    caller,
    category,
    content,
  };
}

function createMilestoneMarker(node: SerializedMilestoneNode): MarkerObject {
  const { type, usxStyle, sid, eid } = node;
  return {
    type: serializeUsjType(type, usxStyle),
    sid,
    eid,
  };
}

function createTextMarker(node: SerializedTextNode): string {
  return node.text;
}

function recurseNodes(
  nodes: SerializedLexicalNode[],
  noteCaller?: string,
): MarkerContent[] | undefined {
  const markers: MarkerContent[] = [];
  nodes.forEach((node) => {
    const serializedParaNode = node as SerializedParaNode;
    const serializedNoteNode = node as SerializedNoteNode;
    const serializedTextNode = node as SerializedTextNode;
    switch (node.type) {
      case BookNode.getType():
        markers.push(createBookMarker(node as SerializedBookNode));
        break;
      case ImmutableChapterNode.getType():
      case ChapterNode.getType():
        markers.push(
          createChapterMarker(node as SerializedImmutableChapterNode | SerializedChapterNode),
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
          serializedTextNode.text !== NBSP &&
          (!noteCaller || serializedTextNode.text !== getEditableCallerText(noteCaller))
        ) {
          markers.push(createTextMarker(serializedTextNode));
        }
        break;
      default:
        _logger?.error(`Unexpected node type '${node.type}'!`);
    }
  });
  return markers;
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
