import {
  $createTextNode,
  $getPreviousSelection,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  BaseSelection,
  KEY_ARROW_RIGHT_COMMAND,
  LexicalEditor,
  TextNode,
} from "lexical";
import { CURSOR_POSITION_HELPER_CHAR } from "../../constants/helperCharacters";

enum CursorPosition {
  Middle = 0,
  Start = 1,
  End = 2,
}

export function registerCursorHandlers(editor: LexicalEditor) {
  editor.registerNodeTransform(TextNode, (node) => {
    const textContent = node.getTextContent();
    const previousSelectionData = $getSelectionData($getPreviousSelection());
    if (!previousSelectionData) return;

    handleHelperCharEdgeCases(textContent, previousSelectionData.position, (helperPosition) => {
      console.log("REMOVE ZERO WIDTH SPACE BECAUSE TEXT NODE TRANSFORMED");
      const { selection } = $getSelectionData($getSelection()) ?? {};
      const anchorOffset = selection?.anchor.offset;
      const focusOffset = selection?.focus.offset;
      node.setTextContent(textContent.replace(CURSOR_POSITION_HELPER_CHAR, ""));
      if (focusOffset && anchorOffset && helperPosition < focusOffset) {
        node.select(anchorOffset - 1, focusOffset - 1);
      }
    });
  });

  editor.registerUpdateListener(({ editorState, prevEditorState, dirtyLeaves, dirtyElements }) => {
    const previousSelectionData = prevEditorState.read(() => $getSelectionData($getSelection()));
    if (!previousSelectionData) return;
    editorState.read(() => {
      if (dirtyLeaves.size === 0 && dirtyElements.size === 0) {
        const selection = $getSelection();
        const selectionData = $getSelectionData(selection);
        if (!selectionData) return;

        const node = selectionData.currentNode;
        const textContent = node.getTextContent();
        const prevContent = previousSelectionData.currentNode.getTextContent();

        if (prevContent.indexOf(CURSOR_POSITION_HELPER_CHAR) !== -1) {
          //TODO: Study cases. Probably just need to update the selection to remove the Cursor Helper.
          editor.update(
            () => {
              previousSelectionData.currentNode.setTextContent(
                prevContent.replace(CURSOR_POSITION_HELPER_CHAR, ""),
              );
            },
            { tag: "history-merge" },
          );
        }

        handleHelperCharEdgeCases(textContent, previousSelectionData.position, () => {
          editor.update(
            () => {
              const anchorOffset = previousSelectionData.selection?.anchor.offset;
              const focusOffset = previousSelectionData.selection.focus.offset;
              node.setTextContent(textContent.replace(CURSOR_POSITION_HELPER_CHAR, ""));
              node.select(anchorOffset, focusOffset);
            },
            { tag: "history-merge" },
          );
        });
      }
    });
  });

  editor.registerCommand(
    KEY_ARROW_RIGHT_COMMAND,
    () => {
      const selection = $getSelection();
      const selectionData = $getSelectionData(selection);
      if (!selectionData) {
        console.log("NO SELECTION DATA");
        return false;
      }

      const { currentNode, position } = selectionData;

      if (position !== CursorPosition.End) {
        console.log("CURSOR NOT AT END");
        return false;
      }

      const nextSibling = currentNode.getNextSibling();
      if ($isElementNode(nextSibling)) {
        if (nextSibling.isInline()) {
          //EDGE CASE 1: NEXT SIBLING IS AN INLINE ELEMENT
          const cursorPositionHelperNode = $createTextNode(CURSOR_POSITION_HELPER_CHAR);
          editor.update(
            () =>
              nextSibling.isEmpty()
                ? nextSibling.append(cursorPositionHelperNode)
                : nextSibling.getFirstChild()?.insertBefore(cursorPositionHelperNode),
            { tag: "history-merge" },
          );

          return true;
        } else {
          //EDGE CASE 2: NEXT SIBLING IS A BLOCK ELEMENT
          console.log("SIBLING IS BLOCK", nextSibling);
          return false;
        }
      }

      if (!nextSibling) {
        //EDGE CASE 3: THERE ARE NO NEXT SIBLINGS
        console.log("NO NEXT SIBLING", currentNode);
        const parent = currentNode.getParent();
        if ($isElementNode(parent)) {
          if (parent.isInline()) {
            console.log("PARENT IS INLINE", parent);
            if (parent?.canInsertTextAfter()) {
              const cursorPositionHelperNode = $createTextNode(CURSOR_POSITION_HELPER_CHAR);
              editor.update(
                () => {
                  parent.insertAfter(cursorPositionHelperNode);
                },
                { tag: "history-merge" },
              );
              return true;
            }
            //TODO: STUDY WHICH USFM NODES SHOULD NOT ACCEPT TEXT CHILDREN AND SET THEM UP IN THAT WAY E.G. Footnote wrapper "\f"
            console.log("CANNOT INSERT AFTER");
            return false;
          }
        }
        console.log("NO PARENT");

        return false;
      }

      console.log("SOMETHING ELSE");

      //EDGE CASE 2: NEXT SIBLING IS AN ELEMENT

      //EDGE CASE 3: NEXT SIBLING IS A TEXT NODE

      //EDGE CASE 4: NEXT SIBLING IS A ZERO WIDTH SPACE
      return false;
    },
    0,
  );
}

function handleHelperCharEdgeCases(
  textContent: string,
  previousPosition: CursorPosition,
  onHelperCharFound: (helperPosition: number) => void,
): boolean {
  const helperOffset = textContent.indexOf(CURSOR_POSITION_HELPER_CHAR);

  // EDGE CASE 0: Transform occurred after a cursor movement forward
  if (
    previousPosition === CursorPosition.End &&
    textContent.at(0) === CURSOR_POSITION_HELPER_CHAR
  ) {
    return true;
  }

  // EDGE CASE 1: Transform occurred after a cursor movement backward
  if (
    previousPosition === CursorPosition.Start &&
    textContent.at(-1) === CURSOR_POSITION_HELPER_CHAR
  ) {
    return true;
  }

  // EDGE CASE 2: Text node is a CURSOR_POSITION_HELPER_CHAR
  if (textContent === CURSOR_POSITION_HELPER_CHAR) {
    return true;
  }

  // EDGE CASE 3: Text node contains a CURSOR_POSITION_HELPER_CHAR
  if (helperOffset !== -1) {
    onHelperCharFound(helperOffset);
    return true;
  }

  return false;
}
function $getSelectionData(selection: BaseSelection | null) {
  if (!selection?.isCollapsed() || !$isRangeSelection(selection)) {
    return null;
  }

  const currentNode = (selection.isBackward() ? selection.focus : selection.anchor).getNode();

  if (!$isTextNode(currentNode)) {
    console.log("NOT TEXT NODE");
    return null;
  }

  const textContentSize = currentNode.getTextContentSize();

  const offset = selection.anchor.offset;
  let position: CursorPosition = CursorPosition.Middle;
  if (offset === 1) {
    position = CursorPosition.Start;
  }
  if (offset === textContentSize) {
    position = CursorPosition.End;
  }

  return { selection, currentNode, position };
}
