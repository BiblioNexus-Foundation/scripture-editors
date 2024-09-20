/* eslint-disable no-debugger */
import {
  $createTextNode,
  $getPreviousSelection,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  BaseSelection,
  BLUR_COMMAND,
  ElementNode,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  LexicalEditor,
  LexicalNode,
  TextNode,
} from "lexical";
import { CURSOR_POSITION_HELPER_CHAR } from "../../constants/helperCharacters";

enum CursorPosition {
  Middle = 0,
  Start = 1,
  End = 2,
}

export function registerCursorHandlers(editor: LexicalEditor) {
  // //REMOVES CURSOR POSITION HELPER CHARS WHEN TEXT NODE TRANSFORMS
  editor.registerNodeTransform(TextNode, (node) => {
    const textContent = node.getTextContent();
    const previousSelectionData = $getSelectionData($getPreviousSelection());
    if (!previousSelectionData) return;

    const helperOffset = textContent.indexOf(CURSOR_POSITION_HELPER_CHAR);
    if (helperOffset === -1) return;

    if (previousSelectionData.node.getKey() !== node.getKey()) return;

    if (previousSelectionData.position === CursorPosition.Start) {
      console.log("REMOVE ZERO WIDTH SPACE BECAUSE TEXT NODE TRANSFORMED");
      const currentSelectionData = $getSelectionData($getSelection());
      if (!currentSelectionData) return;

      const { selection } = currentSelectionData;
      const anchorOffset = selection.anchor.offset;
      const focusOffset = selection.focus.offset;

      node.setTextContent(textContent.replaceAll(CURSOR_POSITION_HELPER_CHAR, ""));
      if (helperOffset < focusOffset) {
        node.select(anchorOffset - 1, focusOffset - 1);
      }
    }
  });

  //REMOVES CURSOR POSITION HELPER CHARS WHEN SELECTION CHANGES
  editor.registerUpdateListener(
    ({ editorState, prevEditorState, dirtyLeaves, dirtyElements, tags }) => {
      console.log("UPDATE LISTENER", { tags });

      // if (editor) return;
      const previousSelectionData = prevEditorState.read(() => $getSelectionData($getSelection()));
      if (!previousSelectionData) return;
      if (dirtyLeaves.size > 0 || dirtyElements.size > 0) {
        console.log("SKIPPING CHAR REMOVAL");
        return;
      }

      editorState.read(() => {
        const selection = $getSelection();
        const selectionData = $getSelectionData(selection);
        if (!selectionData) return;

        // if (selection?.dirty || previousSelectionData.selection.dirty) return;
        console.log("START CHAR REMOVAL", { dirtyLeaves, dirtyElements });

        const node = selectionData.node;
        const textContent = node.getTextContent();
        const prevContent = previousSelectionData.node.getTextContent();
        if (
          selectionData.selection.anchor.offset === 1 &&
          previousSelectionData.selection.anchor.offset === 2 &&
          prevContent.includes(CURSOR_POSITION_HELPER_CHAR) &&
          textContent.includes(CURSOR_POSITION_HELPER_CHAR)
        )
          return;
        if (prevContent.indexOf(CURSOR_POSITION_HELPER_CHAR) !== -1) {
          // TODO: Study cases. Probably just need to update the selection to remove the Cursor Helper.
          editor.update(
            () => {
              // const offset = previousSelectionData.selection.anchor.offset;
              // const currentOffset = selectionData.selection.anchor.offset;
              // const newOffset = currentOffset - 1;
              previousSelectionData.node.setTextContent(
                prevContent.replaceAll(CURSOR_POSITION_HELPER_CHAR, ""),
              );
              if (prevContent.length === 2) selectionData.node.selectEnd();
              !selectionData.position && selectionData.node.select(1, 1);
            },
            { tag: "history-merge" },
          );
        }
      });
    },
  );

  editor.registerCommand(
    BLUR_COMMAND,
    () => {
      console.log("blurring graft");
      const editorSate = editor.getEditorState();
      editorSate.read(() => {
        const selection = $getSelection();
        if (!selection) return false;

        const selectionData = $getSelectionData(selection);
        if (!selectionData) return false;

        const node = selectionData.node;
        const textContent = node.getTextContent();
        if (textContent.includes(CURSOR_POSITION_HELPER_CHAR)) {
          editor.update(
            () => {
              node.setTextContent(textContent.replaceAll(CURSOR_POSITION_HELPER_CHAR, ""));
            },
            { tag: "history-merge" },
          );
        }
      });

      return false;
    },
    0,
  );

  editor.registerCommand(
    KEY_ARROW_RIGHT_COMMAND,
    (e) => {
      console.log(e);
      return handleArrowCommand(editor, CursorPosition.End, "right");
    },
    0,
  );

  editor.registerCommand(
    KEY_ARROW_LEFT_COMMAND,
    () => handleArrowCommand(editor, CursorPosition.Start, "left"),
    0,
  );
}

function handleArrowCommand(
  editor: LexicalEditor,
  targetPosition: CursorPosition,
  direction: "left" | "right",
): boolean {
  const selectionData = $getSelectionData($getSelection());
  if (!selectionData || selectionData.position !== targetPosition) {
    return false;
  }
  if (
    direction === "left" &&
    targetPosition === CursorPosition.Start &&
    selectionData.node.getTextContent().at(0) === CURSOR_POSITION_HELPER_CHAR
  ) {
    return false;
  }

  const { node: currentNode } = selectionData;
  const siblingNode =
    direction === "right" ? currentNode.getNextSibling() : currentNode.getPreviousSibling();

  if ($isElementNode(siblingNode)) {
    return handleElementSibling(siblingNode, editor, direction);
  }

  if (!siblingNode) {
    return handleNoSibling(currentNode, editor, direction);
  }

  console.warn("UNHANDLED CURSOR HELPER CASE");
  return false;
}

function handleElementSibling(
  siblingNode: ElementNode,
  editor: LexicalEditor,
  direction: "left" | "right",
): boolean {
  if (siblingNode.isInline()) {
    const cursorPositionHelperNode = $createTextNode(CURSOR_POSITION_HELPER_CHAR);
    editor.update(
      () => {
        if (siblingNode.isEmpty()) {
          siblingNode.append(cursorPositionHelperNode);
        } else {
          const targetChild = direction === "right" ? siblingNode.getFirstChild() : siblingNode;
          console.log("TARGET CHILD", targetChild);
          direction === "right"
            ? targetChild?.insertBefore(cursorPositionHelperNode)
            : targetChild?.insertAfter(cursorPositionHelperNode);
        }
      },
      { tag: "history-merge" },
    );
    return true;
  } else {
    console.log("SIBLING IS BLOCK", siblingNode);
    return false;
  }
}

function handleNoSibling(
  currentNode: LexicalNode,
  editor: LexicalEditor,
  direction: "left" | "right",
): boolean {
  console.log(`NO ${direction.toUpperCase()} SIBLING`, currentNode);
  const parent = currentNode.getParent();
  if ($isElementNode(parent) && parent.isInline()) {
    console.log("PARENT IS INLINE", parent);
    const canInsert = direction === "right" ? parent.canInsertTextAfter() : true;
    if (canInsert) {
      const cursorPositionHelperNode = $createTextNode(CURSOR_POSITION_HELPER_CHAR);
      editor.update(
        () => {
          direction === "right"
            ? parent.insertAfter(cursorPositionHelperNode)
            : currentNode.insertBefore(cursorPositionHelperNode);
        },
        { tag: "history-merge" },
      );
      return true;
    }
    console.log("CANNOT INSERT");
  }
  console.log("NO PARENT");
  return false;
}

function $getSelectionData(selection: BaseSelection | null) {
  if (!selection?.isCollapsed() || !$isRangeSelection(selection)) {
    return null;
  }

  const node = (selection.isBackward() ? selection.focus : selection.anchor).getNode();

  if (!$isTextNode(node)) {
    console.log("NOT TEXT NODE");
    return null;
  }

  const textContentSize = node.getTextContentSize();

  const offset = selection.anchor.offset;
  let position: CursorPosition = CursorPosition.Middle;
  if (offset === 1) {
    position = CursorPosition.Start;
  }
  if (offset === textContentSize) {
    position = CursorPosition.End;
  }

  return { selection, node, position };
}
