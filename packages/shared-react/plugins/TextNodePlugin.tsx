import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalEditor, TextNode } from "lexical";
import { useEffect } from "react";
import { $isNoteNode, NoteNode } from "shared/nodes/scripture/usj/NoteNode";

export function TextNodePlugin() {
  const [editor] = useLexicalComposerContext();
  useTextNode(editor);
  return null;
}

/**
 * This hook is responsible for handling a TextNode preceding a note node.
 * @param editor - The LexicalEditor instance used to access the DOM.
 */
function useTextNode(editor: LexicalEditor) {
  useEffect(() => {
    if (!editor.hasNodes([TextNode, NoteNode])) {
      throw new Error("TextNodePlugin: TextNode or NoteNode not registered on editor!");
    }

    return editor.registerNodeTransform(TextNode, $textNodeBeforeNoteTransform);
  }, [editor]);
}

/**
 * Adds a space to the end of a TextNode if it doesn't precede a note.
 * @param node - TextNode that might need updating.
 */
function $textNodeBeforeNoteTransform(node: TextNode): void {
  const textContent = node.getTextContent();
  if ($isNoteNode(node.getNextSibling()) || (textContent.endsWith(" ") && textContent.length > 1))
    return;

  if (!textContent.endsWith(" ") && textContent.length >= 1) node.setTextContent(textContent + " ");
  else node.setTextContent("");
}
