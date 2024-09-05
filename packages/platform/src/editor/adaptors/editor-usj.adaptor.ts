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
  COMMENT_MARK_TYPE,
  SerializedTypedMarkNode,
  TypedMarkNode,
} from "shared/nodes/features/TypedMarkNode";
import { BookNode, SerializedBookNode } from "shared/nodes/scripture/usj/BookNode";
import { ChapterNode, SerializedChapterNode } from "shared/nodes/scripture/usj/ChapterNode";
import { CharNode, SerializedCharNode } from "shared/nodes/scripture/usj/CharNode";
import {
  ImmutableChapterNode,
  SerializedImmutableChapterNode,
} from "shared/nodes/scripture/usj/ImmutableChapterNode";
import { ImmutableNoteCallerNode } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import {
  ImmutableUnmatchedNode,
  SerializedImmutableUnmatchedNode,
  UNMATCHED_TAG_NAME,
} from "shared/nodes/scripture/usj/ImmutableUnmatchedNode";
import {
  ImmutableVerseNode,
  SerializedImmutableVerseNode,
} from "shared/nodes/scripture/usj/ImmutableVerseNode";
import {
  ImpliedParaNode,
  SerializedImpliedParaNode,
} from "shared/nodes/scripture/usj/ImpliedParaNode";
import { MarkerNode } from "shared/nodes/scripture/usj/MarkerNode";
import {
  ENDING_MS_COMMENT_MARKER,
  MILESTONE_VERSION,
  MilestoneNode,
  STARTING_MS_COMMENT_MARKER,
  SerializedMilestoneNode,
} from "shared/nodes/scripture/usj/MilestoneNode";
import { NoteNode, SerializedNoteNode } from "shared/nodes/scripture/usj/NoteNode";
import { ParaNode, SerializedParaNode } from "shared/nodes/scripture/usj/ParaNode";
import { SerializedUnknownNode, UnknownNode } from "shared/nodes/scripture/usj/UnknownNode";
import { SerializedVerseNode, VerseNode } from "shared/nodes/scripture/usj/VerseNode";
import {
  NBSP,
  getEditableCallerText,
  parseNumberFromMarkerText,
  removeEndingZwsp,
  removeUndefinedProperties,
} from "shared/nodes/scripture/usj/node.utils";
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

function createUnmatchedMarker(node: SerializedImmutableUnmatchedNode): MarkerObject {
  const { marker } = node;
  return {
    type: UNMATCHED_TAG_NAME,
    marker,
  };
}

/**
 * If the last added content is text then combine the new text content to it, otherwise add the new
 * text content.
 * @param markers - Markers accumulated so far.
 * @param textContent - New text content.
 */
function combineTextContentOrAdd(markers: MarkerContent[], textContent: string) {
  const lastContent: MarkerContent | undefined = markers[markers.length - 1];
  if (lastContent && typeof lastContent === "string")
    markers[markers.length - 1] = lastContent + textContent;
  else markers.push(textContent);
}

/**
 * Strip the mark and insert its children enclosed in milestone mark markers.
 * @param childMarkers - Children of the mark.
 * @param ids - Comment IDs from the current mark.
 * @param pids - Comment IDs from the previous mark.
 * @param nextNode - Next serialized node.
 * @param markers - Markers accumulated so far.
 */
function replaceMarkWithMilestones(
  childMarkers: MarkerContent[],
  ids: string[],
  pids: string[],
  nextNode: SerializedLexicalNode | undefined,
  markers: MarkerContent[],
) {
  // add the milestones in front of the children
  const type = MilestoneNode.getType();
  const sids = ids.filter((id) => !pids.includes(id));
  const eids = pids.filter((id) => !ids.includes(id));
  eids.forEach((eid) => {
    const milestone = createMilestoneMarker({
      type,
      marker: ENDING_MS_COMMENT_MARKER,
      eid,
      version: MILESTONE_VERSION,
    });
    markers.push(milestone);
  });
  sids.forEach((sid) => {
    const milestone = createMilestoneMarker({
      type,
      marker: STARTING_MS_COMMENT_MARKER,
      sid,
      version: MILESTONE_VERSION,
    });
    markers.push(milestone);
  });
  if (ids.length === 0) {
    const milestone = createMilestoneMarker({
      type,
      marker: STARTING_MS_COMMENT_MARKER,
      version: MILESTONE_VERSION,
    });
    markers.push(milestone);
  }
  // add the children
  markers.push(...childMarkers);
  // add any milestones needed after the children
  if (ids.length === 0) {
    const milestone = createMilestoneMarker({
      type,
      marker: ENDING_MS_COMMENT_MARKER,
      version: MILESTONE_VERSION,
    });
    markers.push(milestone);
  }
  const isLastEnd = !nextNode || nextNode.type !== TypedMarkNode.getType();
  if (isLastEnd) {
    ids.forEach((eid) => {
      const milestone = createMilestoneMarker({
        type,
        marker: ENDING_MS_COMMENT_MARKER,
        eid,
        version: MILESTONE_VERSION,
      });
      markers.push(milestone);
    });
  }
}

function recurseNodes(
  nodes: SerializedLexicalNode[],
  noteCaller?: string,
): MarkerContent[] | undefined {
  const markers: MarkerContent[] = [];
  let childMarkers: MarkerContent[] | undefined;
  /** Previous comment IDs from TypedMarkNodes. */
  let pids: string[] = [];
  nodes.forEach((node, index) => {
    const serializedBookNode = node as SerializedBookNode;
    const serializedChapterNode = node as SerializedChapterNode;
    const serializedParaNode = node as SerializedParaNode;
    const serializedNoteNode = node as SerializedNoteNode;
    const serializedTextNode = node as SerializedTextNode;
    const serializedMarkNode = node as SerializedTypedMarkNode;
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
      case LineBreakNode.getType():
      case MarkerNode.getType():
        // These nodes are for presentation only so they don't go into the USJ.
        break;
      case TypedMarkNode.getType():
        childMarkers = recurseNodes(serializedMarkNode.children);
        if (childMarkers) {
          const commentIDs = serializedMarkNode.typedIDs[COMMENT_MARK_TYPE];
          if (commentIDs && commentIDs.length >= 0) {
            replaceMarkWithMilestones(childMarkers, commentIDs, pids, nodes[index + 1], markers);
            pids = commentIDs;
          } else {
            // Strip the mark and insert its children.
            const firstChild = childMarkers.shift();
            if (firstChild) {
              if (typeof firstChild === "string") combineTextContentOrAdd(markers, firstChild);
              else markers.push(firstChild);
            }
            if (childMarkers) markers.push(...childMarkers);
          }
        }
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
          combineTextContentOrAdd(markers, createTextMarker(serializedTextNode));
        }
        break;
      case UnknownNode.getType():
        markers.push(
          createUnknownMarker(serializedUnknownNode, recurseNodes(serializedUnknownNode.children)),
        );
        break;
      case ImmutableUnmatchedNode.getType():
        markers.push(createUnmatchedMarker(node as SerializedImmutableUnmatchedNode));
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
