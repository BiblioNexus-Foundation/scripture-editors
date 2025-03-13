import { MarkerContent } from "@biblionexus-foundation/scripture-utilities";
import { SerializedVerseRef } from "@sillsdev/scripture";
import {
  $createTextNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  LexicalEditor,
  LexicalNode,
  RangeSelection,
  TextNode,
} from "lexical";
import { $createNodeFromSerializedNode } from "shared/converters/usfm/emptyUsfmNodes";
import { $isTypedMarkNode } from "shared/nodes/features/TypedMarkNode";
import { CharNode } from "shared/nodes/scripture/usj/CharNode";
import { $isNoteNode } from "shared/nodes/scripture/usj/NoteNode";
import { getNextVerse } from "shared/nodes/scripture/usj/node.utils";
import { ParaNode } from "shared/nodes/scripture/usj/ParaNode";
import { MarkerAction } from "shared/utils/get-marker-action.model";
import { Marker } from "shared/utils/usfm/usfmTypes";
import { createLexicalUsjNode } from "shared/utils/usj/contentToLexicalNode";
import { $isSomeVerseNode } from "shared-react/nodes/scripture/usj/node-react.utils";
import { ViewOptions } from "./view-options.utils";
import usjEditorAdaptor from "./usj-editor.adaptor";

const markerActions: {
  [marker: string]: {
    label?: string;
    action?: (currentEditor: {
      reference: SerializedVerseRef;
      editor: LexicalEditor;
    }) => MarkerContent[];
  };
} = {
  c: {
    action: (currentEditor) => {
      const { chapterNum } = currentEditor.reference;
      const nextChapter = chapterNum + 1;
      const content: MarkerContent = {
        type: "chapter",
        marker: "c",
        number: `${nextChapter}`,
      };
      return [content];
    },
  },
  v: {
    action: (currentEditor) => {
      const { verseNum, verse } = currentEditor.reference;
      const nextVerse = getNextVerse(verseNum, verse);
      const content: MarkerContent = {
        type: "verse",
        marker: "v",
        number: `${nextVerse}`,
      };
      return [content];
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
  const action = (currentEditor: { reference: SerializedVerseRef; editor: LexicalEditor }) => {
    currentEditor.editor.update(() => {
      const content = markerAction?.action?.(currentEditor);
      if (!content) return;

      const serializedLexicalNode = createLexicalUsjNode(content, usjEditorAdaptor, viewOptions);
      const nodeToInsert = $createNodeFromSerializedNode(serializedLexicalNode);

      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // If the selection has text content, wrap the text selection in an inline node
        if (selection.getTextContent().length > 0) {
          $wrapTextSelectionInInlineNode(selection, () =>
            $createNodeFromSerializedNode(serializedLexicalNode),
          );
        } else if ($isElementNode(nodeToInsert) && !nodeToInsert.isInline()) {
          // If the selection is empty, insert a new paragraph and replace it with the USJ node
          const paragraph = selection.insertParagraph();
          if (paragraph) {
            // Transfer the content of the paragraph to the USJ node
            const paragraphContent = paragraph.getChildren();
            nodeToInsert.append(...paragraphContent);
            paragraph.replace(nodeToInsert);
            nodeToInsert.selectStart();
          }
        } else {
          const nodes = $addVerseLeadingSpaceIfNeeded(selection, nodeToInsert);
          selection.insertNodes(nodes);
        }
      } else {
        // Insert the node directly
        selection?.insertNodes([nodeToInsert]);
      }
    });
  };
  return { action, label: markerAction?.label };
}

function getMarkerAction(marker: string): {
  label?: string;
  action?: (currentEditor: {
    reference: SerializedVerseRef;
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
  createNode: () => LexicalNode,
): void {
  const nodes = selection.getNodes();
  const [startOffset, endOffset] = getSelectionOffsets(selection);

  let currentWrapper: LexicalNode | undefined;

  nodes.forEach((node, index) => {
    // Skip if node is already wrapped
    if ($isElementNode(currentWrapper) && currentWrapper.isParentOf(node)) {
      return;
    }

    // Get the target node to wrap
    const targetNode = $getTargetNode(
      node,
      index === 0,
      index === nodes.length - 1,
      startOffset,
      endOffset,
    );

    if (!targetNode) {
      currentWrapper = undefined;
      return;
    }

    // Create or reuse wrapper node
    if (!currentWrapper) {
      currentWrapper = createNode();
      targetNode.insertBefore(currentWrapper);
    }

    // Wrap the target node
    $wrapNode(targetNode, currentWrapper);
  });

  // Update selection
  if ($isTextNode(currentWrapper)) {
    currentWrapper.selectEnd();
  }
}

// #region Helper functions for $wrapTextSelectionInInlineNode

/**
 * Get the start and end offsets of a selection.
 * @param selection - The selection to get the offsets from.
 * @returns the start and end offsets of the selection.
 */
function getSelectionOffsets(selection: RangeSelection): [number, number] {
  const anchorOffset = selection.anchor.offset;
  const focusOffset = selection.focus.offset;
  return selection.isBackward() ? [focusOffset, anchorOffset] : [anchorOffset, focusOffset];
}

function $getTargetNode(
  node: LexicalNode,
  isFirst: boolean,
  isLast: boolean,
  startOffset: number,
  endOffset: number,
): LexicalNode | undefined {
  // Skip mark nodes and note nodes
  if ($isTypedMarkNode(node) || $isNoteNode(node) || $isNoteNode(node.getParent())) {
    return;
  }

  // Handle text nodes
  if ($isTextNode(node)) {
    return handleTextNode(node, isFirst, isLast, startOffset, endOffset);
  }

  // Handle inline elements
  if ($isElementNode(node) && node.isInline()) {
    return node;
  }
}

function handleTextNode(
  node: TextNode,
  isFirst: boolean,
  isLast: boolean,
  startOffset: number,
  endOffset: number,
): TextNode | undefined {
  const textLength = node.getTextContentSize();
  const start = isFirst ? startOffset : 0;
  const end = isLast ? endOffset : textLength;

  if (start === 0 && end === 0) {
    return;
  }

  const splitNodes = node.splitText(start, end);

  if (splitNodes.length === 1) {
    return splitNodes[0];
  }

  return splitNodes.length === 3 || isFirst || end === textLength ? splitNodes[1] : splitNodes[0];
}

function $wrapNode(node: LexicalNode, wrapper: LexicalNode): void {
  if ($isTextNode(wrapper)) {
    wrapper.setTextContent(node.getTextContent());
    node.remove();
  } else if ($isElementNode(wrapper)) {
    wrapper.clear();
    wrapper.append(node);
  }
}

// #endregion

/**
 * Adds a leading space before a verse node if needed.
 *
 * This function checks if the given selection is collapsed and if the node to be inserted is a
 * verse node or an immutable verse node. If both conditions are met, it further checks if the
 * anchor node of the selection is a text node and if there is no leading space before the insertion
 * point. If there is no leading space, it prepends a space to the node to be inserted.
 *
 * @param selection - The current selection range in the editor.
 * @param nodeToInsert - The node that is to be inserted into the editor.
 * @returns An array containing the nodes to be inserted, potentially with a leading space node.
 */
function $addVerseLeadingSpaceIfNeeded(
  selection: RangeSelection,
  nodeToInsert: LexicalNode,
): LexicalNode[] {
  if (!selection.isCollapsed()) return [nodeToInsert];
  if (!$isSomeVerseNode(nodeToInsert)) return [nodeToInsert];

  const anchorNode = selection.anchor.getNode();
  if (!$isTextNode(anchorNode)) return [nodeToInsert];

  const offset = selection.anchor.offset;
  const textContent = anchorNode.getTextContent();
  const hasLeadingSpace = textContent[offset - 1] === " ";
  if (hasLeadingSpace) return [nodeToInsert];

  return [$createTextNode(" "), nodeToInsert];
}
