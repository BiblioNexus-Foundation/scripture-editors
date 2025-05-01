import { wasNodeCreated } from "../nodes/scripture/usj/node-react.utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { LexicalEditor, TextNode } from "lexical";
import { useEffect } from "react";
import { $isUnknownNode } from "shared/nodes/features/UnknownNode";
import { $isCharNode, CharNode } from "shared/nodes/scripture/usj/CharNode";
import { $isNoteNode, NoteNode } from "shared/nodes/scripture/usj/NoteNode";

export function TextNodePlugin() {
  const [editor] = useLexicalComposerContext();
  useTextNode(editor);
  return null;
}

/**
 * This hook is responsible for handling a trailing space on a TextNode, and moving text nodes
 * that are created inside an UnknownNode.
 * @param editor - The LexicalEditor instance used to access the DOM.
 */
function useTextNode(editor: LexicalEditor) {
  useEffect(() => {
    if (!editor.hasNodes([CharNode, NoteNode, TextNode])) {
      throw new Error("TextNodePlugin: CharNode, NoteNode or TextNode not registered on editor!");
    }

    return mergeRegister(
      editor.registerNodeTransform(TextNode, $textNodeTrailingSpaceTransform),
      editor.registerNodeTransform(TextNode, (node) => $textNodeInUnknownTransform(node, editor)),
    );
  }, [editor]);
}

/**
 * Adds a space to the end of a TextNode if it doesn't precede a note or isn't inside a char node.
 * It also doesn't add a space if the text node is not editable.
 * @param node - TextNode that might need updating.
 */
function $textNodeTrailingSpaceTransform(node: TextNode): void {
  const textContent = node.getTextContent();
  if (
    node.getMode() !== "normal" ||
    $isNoteNode(node.getNextSibling()) ||
    (textContent.endsWith(" ") && textContent.length > 1) ||
    $isCharNode(node.getParent())
  )
    return;

  if (!textContent.endsWith(" ") && textContent.length >= 1) node.setTextContent(textContent + " ");
  else node.setTextContent("");
}

/**
 * Moves a TextNode after its parent if the parent is an UnknownNode.
 * @param node - The TextNode to check.
 * @param editor - The LexicalEditor instance.
 */
function $textNodeInUnknownTransform(node: TextNode, editor: LexicalEditor): void {
  const unknownNode = node.getParent();
  if (!$isUnknownNode(unknownNode)) return;

  // If a text node is created inside an UnknownNode (e.g., by typing), move it after the
  // UnknownNode.
  if (wasNodeCreated(editor, node.getKey())) unknownNode.insertAfter(node);
}
