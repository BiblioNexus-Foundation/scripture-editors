import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  RangeSelection,
  SerializedLexicalNode,
} from "lexical";
import { $createNodeFromSerializedNode } from "../../converters/usfm/emptyUsfmNodes";
import { createLexicalNodeFromUsfm } from "./usfmToLexical";
import { $isMarkerNode } from "../../nodes/scripture/usj/MarkerNode";
import { MarkerType, Marker } from "./usfmTypes";
import { CURSOR_POSITION_HELPER_CHAR } from "../../constants/helperCharacters";
import { $isUsfmParagraphNode } from "../../nodes/UsfmParagraphNode";

export const markerActions: {
  [marker: string]: {
    label?: string;
    action?: (currentEditor: {
      reference: { chapter: number; verse: number };
      editor: LexicalEditor;
    }) => SerializedLexicalNode | string;
  };
} = {
  no: {
    label: "format_clear",
  },
  it: {
    label: "format_italic",
  },
  bd: {
    label: "format_bold",
  },
  sc: {
    label: "uppercase",
  },
  sup: {
    label: "superscript",
  },
  v: {
    action: (currentEditor) => {
      const { verse } = currentEditor.reference;
      return String.raw`\v ${verse + 1} `;
    },
  },
  c: {
    action: (currentEditor) => {
      const { chapter } = currentEditor.reference;
      return String.raw`\c ${chapter + 1} `;
    },
  },
  f: {
    action: (currentEditor) => {
      const { chapter, verse } = currentEditor.reference;
      return String.raw`\f + \fr ${chapter}.${verse}: \ft ${CURSOR_POSITION_HELPER_CHAR} \f*`;
    },
  },
  x: {
    action: (currentEditor) => {
      const { chapter, verse } = currentEditor.reference;
      return String.raw`\x + \xo ${chapter}.${verse}: \xt ${CURSOR_POSITION_HELPER_CHAR} \x*`;
    },
  },
};

export function getMarkerAction(marker: string, markerData?: Marker) {
  const markerAction = markerActions[marker];
  const action = (currentEditor: {
    editor: LexicalEditor;
    reference: { chapter: number; verse: number };
  }) => {
    currentEditor.editor.update(() => {
      const node = markerAction?.action?.(currentEditor);
      const selection = $getSelection();
      const usfmSerializedNode =
        typeof node === "object"
          ? node
          : createLexicalNodeFromUsfm(
              node ||
                `\\${marker} ${CURSOR_POSITION_HELPER_CHAR}${markerData?.hasEndMarker ? ` \\${marker}*` : ""}`,
              !markerData ||
                markerData.type === MarkerType.Character ||
                markerData.type === MarkerType.Note
                ? "inline"
                : "block",
            );
      const usfmNode = $createNodeFromSerializedNode(usfmSerializedNode);

      // Check if the selection is a range selection
      if ($isRangeSelection(selection)) {
        // If the selection has text content, wrap the text selection in an inline node
        if (selection.getTextContent().length > 0) {
          $wrapTextSelectionInInlineNode(selection, false, () => usfmNode);
        } else {
          if ($isUsfmParagraphNode(usfmNode)) {
            // If the selection is empty, insert a new paragraph and replace it with the USFM node
            const paragraph = selection.insertParagraph();

            if (paragraph) {
              // Transfer the content of the paragraph to the USFM node
              const paragraphContent = paragraph.getChildren();
              usfmNode.append(...paragraphContent);
              paragraph.replace(usfmNode);
              usfmNode.selectStart();
            }
          } else {
            selection?.insertNodes([usfmNode]);
          }
        }
      } else {
        // If the selection is not a range selection, insert the USFM node directly
        selection?.insertNodes([usfmNode]);
      }
    });
  };
  return { action, label: markerAction?.label };
}

//TODO: handle edge cases for unwrapable usfm elements
export function $wrapTextSelectionInInlineNode(
  selection: RangeSelection,
  isBackward: boolean,
  createNode: () => LexicalNode,
): void {
  const nodes = selection.getNodes();
  const anchorOffset = selection.anchor.offset;
  const focusOffset = selection.focus.offset;
  const nodesLength = nodes.length;
  const startOffset = isBackward ? focusOffset : anchorOffset;
  const endOffset = isBackward ? anchorOffset : focusOffset;
  let currentNodeParent;
  let lastCreatedNode;

  // We only want wrap adjacent text nodes, line break nodes
  // and inline element nodes. For decorator nodes and block
  // element nodes, we step out of their boundary and start
  // again after, if there are more nodes.
  for (let i = 0; i < nodesLength; i++) {
    const node = nodes[i];
    if ($isElementNode(lastCreatedNode) && lastCreatedNode.isParentOf(node)) {
      // If the current node is a child of the last created mark node, there is nothing to do here
      continue;
    }
    const isFirstNode = i === 0;
    const isLastNode = i === nodesLength - 1;
    let targetNode: LexicalNode | null = null;

    if ($isTextNode(node)) {
      // Case 1: The node is a text node and we can split it
      const textContentSize = node.getTextContentSize();
      const startTextOffset = isFirstNode ? startOffset : 0;
      const endTextOffset = isLastNode ? endOffset : textContentSize;
      if (startTextOffset === 0 && endTextOffset === 0) {
        continue;
      }
      const splitNodes = node.splitText(startTextOffset, endTextOffset);
      targetNode =
        splitNodes.length > 1 &&
        (splitNodes.length === 3 ||
          (isFirstNode && !isLastNode) ||
          endTextOffset === textContentSize)
          ? splitNodes[1]
          : splitNodes[0];
    } else if ($isMarkerNode(node)) {
      // Case 2: the node is a mark node and we can ignore it as a target,
      // moving on to its children. Note that when we make a mark inside
      // another mark, it may utlimately be unnested by a call to
      // `registerNestedElementResolver<MarkNode>` somewhere else in the
      // codebase.

      continue;
    } else if ($isElementNode(node) && node.isInline()) {
      // Case 3: inline element nodes can be added in their entirety to the new
      // mark
      targetNode = node;
    }

    if (targetNode !== null) {
      // Now that we have a target node for wrapping with a mark, we can run
      // through special cases.
      if (targetNode && targetNode.is(currentNodeParent)) {
        // The current node is a child of the target node to be wrapped, there
        // is nothing to do here.
        continue;
      }
      const parentNode = targetNode.getParent();
      if (parentNode == null || !parentNode.is(currentNodeParent)) {
        // If the parent node is not the current node's parent node, we can
        // clear the last created mark node.
        lastCreatedNode = undefined;
      }

      currentNodeParent = parentNode;

      if (lastCreatedNode === undefined) {
        // If we don't have a created mark node, we can make one
        lastCreatedNode = createNode();
        targetNode.insertBefore(lastCreatedNode);
      }

      // Add the target node to be wrapped in the latest created mark node
      (lastCreatedNode as ElementNode).clear();
      (lastCreatedNode as ElementNode).append(targetNode);
    } else {
      // If we don't have a target node to wrap we can clear our state and
      // continue on with the next node
      currentNodeParent = undefined;
      lastCreatedNode = undefined;
    }
  }
  // Make selection collapsed at the end
  if ($isElementNode(lastCreatedNode)) {
    // eslint-disable-next-line no-unused-expressions
    isBackward ? lastCreatedNode.selectStart() : lastCreatedNode.selectEnd();
  }
}
