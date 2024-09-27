import {
  $createTextNode,
  $getSelection,
  $isTextNode,
  BLUR_COMMAND,
  BaseSelection,
  ElementNode,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  LexicalEditor,
  TextNode,
} from "lexical";
import { TEMP_INLINE_CURSOR_PLACEHOLDER } from "../../constants/helperCharacters";

const TEXT_TYPE = "text";

export function registerCursorHandlers(editor: LexicalEditor) {
  function $getSelectionData(selection: BaseSelection) {
    const nodes = selection?.getNodes() ?? [];
    const endNode = nodes[nodes.length - 1] ?? null;

    let endNodeKey = null;
    let isZeroWidthSpace = false;

    if (endNode) {
      endNodeKey = endNode.getKey();
      isZeroWidthSpace =
        $isTextNode(endNode) && endNode.getTextContent() === TEMP_INLINE_CURSOR_PLACEHOLDER;
    }

    return {
      endNode,
      endNodeKey,
      isZeroWidthSpace,
    };
  }

  //remove zeroWidthSpace if text node is edited
  editor.registerNodeTransform(TextNode, (node) => {
    const textContent = node.getTextContent();
    if (textContent.includes(TEMP_INLINE_CURSOR_PLACEHOLDER)) {
      console.log("REMOVE ZERO WIDTH SPACE BECAUSE TEXT NODE TRANSFORMED");
      node.setTextContent(textContent.replace(TEMP_INLINE_CURSOR_PLACEHOLDER, ""));
    }
  });

  // //remove zeroWidthSpace if editor is blurred
  editor.registerCommand(
    BLUR_COMMAND,
    () => {
      console.log("blurring graft");
      const editorSate = editor.getEditorState();
      editorSate.read(() => {
        const selection = $getSelection();
        if (!selection) return false;
        const currSelectionData = $getSelectionData(selection);
        if (currSelectionData.isZeroWidthSpace) {
          if (!$isTextNode(currSelectionData.endNode)) return false;
          console.log("REMOVING ZERO WIDTH SPACE BECAUSE EDITOR BLURRED");
          editor.update(() => {
            (currSelectionData.endNode as TextNode).setTextContent(
              currSelectionData.endNode
                .getTextContent()
                .replace(TEMP_INLINE_CURSOR_PLACEHOLDER, ""),
            );
          });
        }
      });

      return false;
    },
    0,
  );

  //remove zero width space if selection changed
  editor.registerUpdateListener(({ editorState, prevEditorState, dirtyLeaves, dirtyElements }) => {
    //if selection changed and previous selected node was a text node, check if it has zero width space
    if (dirtyLeaves.size !== 0 || dirtyElements.size !== 0) return;
    editorState.read(() => {
      const selection = prevEditorState._selection;
      const currSelection = editorState._selection;
      if (!selection || !currSelection) return;
      const prevSelectionData = $getSelectionData(selection);
      const currSelectionData = $getSelectionData(currSelection);
      if (prevSelectionData.endNodeKey === currSelectionData.endNodeKey) return;
      if (prevSelectionData.isZeroWidthSpace) {
        if (!$isTextNode(prevSelectionData.endNode)) return;
        console.log("REMOVING ZERO WIDTH SPACE BECAUSE SELECTION CHANGED");
        editor.update(() => {
          (prevSelectionData.endNode as TextNode).setTextContent(
            prevSelectionData.endNode.getTextContent().replace(TEMP_INLINE_CURSOR_PLACEHOLDER, ""),
          );
        });
      }
    });
  });

  const getSelectionAndNode = () => {
    const selection = $getSelection();
    if (!selection?.isCollapsed()) {
      console.log("NOT COLLAPSED");
      return null;
    }

    const nodes = selection?.getNodes();
    const currentNode = nodes?.[nodes.length - 1];

    if (!$isTextNode(currentNode)) {
      console.log("NOT TEXT NODE");
      return null;
    }

    return { selection, currentNode };
  };

  const removeZeroWidthSpace = (textNode: TextNode) => {
    const textContent = textNode.getTextContent();

    //remove zero width space from content
    if (textContent === TEMP_INLINE_CURSOR_PLACEHOLDER) {
      console.log(
        "REMOVING ZERO WIDTH SPACE BECAUSE TEXT NODE IS ZERO WIDTH SPACE AFTER ARROW LEFT",
      );
      editor.update(() => {
        textNode.setTextContent(textContent.replace(TEMP_INLINE_CURSOR_PLACEHOLDER, ""));
      });
    }
  };

  const getValidParent = (node: ElementNode): ElementNode | null => {
    const parent = node?.getParent();
    if (parent && ["root", "graft"].includes(parent.getType())) {
      return getValidParent(parent);
    }
    return node;
  };

  const insertTextNode = (
    insertFunction: (t: TextNode) => void,
    text = TEMP_INLINE_CURSOR_PLACEHOLDER,
  ) => {
    editor.update(
      () => {
        const textNode = $createTextNode(text);
        insertFunction(textNode);
      },
      { skipTransforms: true },
    );
    return true;
  };

  const $insertTextBefore = () => {
    const result = getSelectionAndNode();
    if (!result) return false;

    const { selection, currentNode } = result;

    removeZeroWidthSpace(currentNode);

    const offset = 0;
    if (selection.getStartEndPoints()?.[1].offset !== offset) {
      console.log("OFFSET", selection.getStartEndPoints()?.[1].offset, offset);
      return false;
    }

    const refNode = currentNode.getParent();
    const parent = refNode ? getValidParent(refNode) : null;
    if (!parent) {
      console.log("NO PARENT", parent);
      return false;
    }

    const parentSibling = parent.getPreviousSibling();
    if (!parentSibling || parentSibling.getType() !== TEXT_TYPE) {
      return insertTextNode((zeroWidthSpace: TextNode) => parent.insertBefore(zeroWidthSpace));
    }

    console.log("NO SIBLING", { parentSibling });
    return false;
  };

  const $insertTextAfter = () => {
    const result = getSelectionAndNode();
    if (!result) return false;

    const { selection, currentNode } = result;

    removeZeroWidthSpace(currentNode);

    const offset = currentNode.getTextContent().length;
    if (selection.getStartEndPoints()?.[1].offset !== offset) {
      return false;
    }

    const refNode = currentNode.getParent();
    const parent = refNode ? getValidParent(refNode) : null;
    if (!parent) {
      console.log("NO PARENT", parent);
      return false;
    }

    const parentSibling = parent.getNextSibling();
    if (!parentSibling || parentSibling.getType() !== TEXT_TYPE) {
      return insertTextNode((zeroWidthSpace: TextNode) => parent.insertAfter(zeroWidthSpace));
    }

    console.log("NO SIBLING", { parentSibling });
    return false;
  };

  editor.registerCommand(KEY_ARROW_RIGHT_COMMAND, () => $insertTextAfter(), 1);
  editor.registerCommand(KEY_ARROW_LEFT_COMMAND, () => $insertTextBefore(), 1);
}
