import { MarkerContent } from "@biblionexus-foundation/scripture-utilities";
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  RangeSelection,
} from "lexical";
import { $createNodeFromSerializedNode } from "shared/converters/usfm/emptyUsfmNodes";
import { $isTypedMarkNode } from "shared/nodes/features/TypedMarkNode";
import { CharNode } from "shared/nodes/scripture/usj/CharNode";
import { $isNoteNode } from "shared/nodes/scripture/usj/NoteNode";
import { ParaNode } from "shared/nodes/scripture/usj/ParaNode";
import { MarkerAction, ScriptureReference } from "shared/utils/get-marker-action.model";
import { Marker } from "shared/utils/usfm/usfmTypes";
import { createLexicalUsjNode } from "shared/utils/usj/contentToLexicalNode";
import { ViewOptions } from "./view-options.utils";
import usjEditorAdaptor from "./usj-editor.adaptor";

const markerActions: {
  [marker: string]: {
    label?: string;
    action?: (currentEditor: {
      reference: ScriptureReference;
      editor: LexicalEditor;
    }) => MarkerContent[];
  };
} = {
  c: {
    action: (currentEditor) => {
      const { book, chapterNum } = currentEditor.reference;
      const nextChapter = chapterNum + 1;
      const content: MarkerContent = {
        type: "chapter",
        marker: "c",
        number: `${nextChapter}`,
        sid: `${book} ${nextChapter}`,
      };
      return [content];
    },
  },
  v: {
    action: (currentEditor) => {
      const { book, chapterNum, verseNum } = currentEditor.reference;
      const nextVerse = verseNum + 1;
      const content: MarkerContent = {
        type: "verse",
        marker: "v",
        number: `${nextVerse}`,
        sid: `${book} ${chapterNum}:${nextVerse}`,
      };
      return [content, " "];
    },
  },
  f: {
    action: (currentEditor) => {
      const { chapterNum, verseNum } = currentEditor.reference;
      const content: MarkerContent = {
        type: "note",
        marker: "f",
        caller: "+",
        content: [
          { type: "char", marker: "fr", content: [`${chapterNum}:${verseNum} `] },
          {
            type: "char",
            marker: "ft",
            content: [" "],
          },
        ],
      };
      return [content];
    },
  },
  x: {
    action: (currentEditor) => {
      const { chapterNum, verseNum } = currentEditor.reference;
      const content: MarkerContent = {
        type: "note",
        marker: "x",
        caller: "+",
        content: [
          { type: "char", marker: "xo", content: [`${chapterNum}:${verseNum} `] },
          {
            type: "char",
            marker: "xt",
            content: [" "],
          },
        ],
      };
      return [content];
    },
  },
};

/** A function that returns a marker action for a given USJ marker */
export function getUsjMarkerAction(
  marker: string,
  _markerData?: Marker,
  viewOptions?: ViewOptions,
): MarkerAction {
  const markerAction = getMarkerAction(marker);
  const action = (currentEditor: { reference: ScriptureReference; editor: LexicalEditor }) => {
    currentEditor.editor.update(() => {
      const content = markerAction?.action?.(currentEditor);
      if (!content) return;

      const serializedLexicalNode = createLexicalUsjNode(content, usjEditorAdaptor, viewOptions);
      const usjNode = $createNodeFromSerializedNode(serializedLexicalNode);

      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // If the selection has text content, wrap the text selection in an inline node
        if (selection.getTextContent().length > 0) {
          $wrapTextSelectionInInlineNode(selection, false, () =>
            $createNodeFromSerializedNode(serializedLexicalNode),
          );
        } else if ($isElementNode(usjNode) && !usjNode.isInline()) {
          // If the selection is empty, insert a new paragraph and replace it with the USJ node
          const paragraph = selection.insertParagraph();
          if (paragraph) {
            // Transfer the content of the paragraph to the USJ node
            const paragraphContent = paragraph.getChildren();
            usjNode.append(...paragraphContent);
            paragraph.replace(usjNode);
            usjNode.selectStart();
          }
        } else {
          selection.insertNodes([usjNode]);
        }
      } else {
        // Insert the USJ node directly
        selection?.insertNodes([usjNode]);
      }
    });
  };
  return { action, label: markerAction?.label };
}

function getMarkerAction(marker: string): {
  label?: string;
  action?: (currentEditor: {
    reference: ScriptureReference;
    editor: LexicalEditor;
  }) => MarkerContent[];
} {
  let markerAction = markerActions[marker];
  if (!markerAction) {
    if (ParaNode.isValidMarker(marker)) {
      markerAction = {
        action: () => {
          const content: MarkerContent = {
            type: ParaNode.getType(),
            marker,
            content: [],
          };
          return [content];
        },
      };
    } else if (CharNode.isValidMarker(marker)) {
      markerAction = {
        action: () => {
          const content: MarkerContent = {
            type: CharNode.getType(),
            marker,
            content: [" "],
          };
          return [content];
        },
      };
    }
  }
  return markerAction;
}

function $wrapTextSelectionInInlineNode(
  selection: RangeSelection,
  isBackward: boolean,
  createNode: () => LexicalNode,
): void {
  const nodes = selection.getNodes();
  const anchorOffset = selection.anchor.offset;
  const focusOffset = selection.focus.offset;
  const startOffset = isBackward ? focusOffset : anchorOffset;
  const endOffset = isBackward ? anchorOffset : focusOffset;
  let currentNodeParent: LexicalNode | undefined;
  let lastCreatedNode: LexicalNode | undefined;

  // We only want to wrap adjacent text nodes, line break nodes and inline element nodes. For
  // decorator nodes and block element nodes, we step out of their boundary and start again after,
  // if there are more nodes.
  nodes.forEach((node, i) => {
    if ($isElementNode(lastCreatedNode) && lastCreatedNode.isParentOf(node)) {
      // If the current node is a child of the last created mark node, there is nothing to do here
      return;
    }
    const isFirstNode = i === 0;
    const isLastNode = i === nodes.length - 1;
    let targetNode: LexicalNode | undefined;

    if ($isTypedMarkNode(node) || $isNoteNode(node) || $isNoteNode(node.getParent())) {
      // Case 1: the node is a mark node and we can ignore it as a target, moving on to its children
      // OR a note node OR a notes children. Note that when we make a mark inside another mark, it
      // may ultimately be unnested by a call to `registerNestedElementResolver<TypedMarkNode>`
      // somewhere else in the codebase.
      return;
    } else if ($isTextNode(node)) {
      // Case 2: The node is a text node and we can split it
      const textContentSize = node.getTextContentSize();
      const startTextOffset = isFirstNode ? startOffset : 0;
      const endTextOffset = isLastNode ? endOffset : textContentSize;
      if (startTextOffset === 0 && endTextOffset === 0) {
        return;
      }
      const splitNodes = node.splitText(startTextOffset, endTextOffset);
      targetNode =
        splitNodes.length > 1 &&
        (splitNodes.length === 3 ||
          (isFirstNode && !isLastNode) ||
          endTextOffset === textContentSize)
          ? splitNodes[1]
          : splitNodes[0];
      lastCreatedNode = undefined;
    } else if ($isElementNode(node) && node.isInline()) {
      // Case 3: inline element nodes can be added in their entirety to the new
      // mark
      targetNode = node;
    }

    if (targetNode) {
      // Now that we have a target node for wrapping with a mark, we can run through special cases.
      if (targetNode.is(currentNodeParent)) {
        // The current node is a child of the target node to be wrapped, there is nothing to do here.
        return;
      }
      const parentNode = targetNode.getParent() ?? undefined;
      if (!parentNode?.is(currentNodeParent)) {
        // If the parent node is not the current node's parent node, we can clear the last created
        // mark node.
        lastCreatedNode = undefined;
      }

      currentNodeParent = parentNode;

      if (lastCreatedNode === undefined) {
        // If we don't have a created mark node, we can make one
        lastCreatedNode = createNode();
        targetNode.insertBefore(lastCreatedNode);
      }

      if ($isTextNode(lastCreatedNode)) {
        lastCreatedNode.setTextContent(targetNode.getTextContent());
        targetNode.remove();
      } else {
        // Add the target node to be wrapped in the latest created mark node.
        (lastCreatedNode as ElementNode).clear();
        (lastCreatedNode as ElementNode).append(targetNode);
      }
    } else {
      // If we don't have a target node to wrap we can clear our state and continue on with the
      // next node.
      currentNodeParent = undefined;
      lastCreatedNode = undefined;
    }
  });
  // Make selection collapsed at the end
  if ($isTextNode(lastCreatedNode)) {
    if (isBackward) lastCreatedNode.selectStart();
    else lastCreatedNode.selectEnd();
  }
}
