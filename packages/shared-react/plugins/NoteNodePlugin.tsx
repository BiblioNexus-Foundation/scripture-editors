import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalEditor } from "lexical";
import { mergeRegister } from "@lexical/utils";
import { useEffect } from "react";
import { $isCharNode, CharNode } from "shared/nodes/scripture/usj/CharNode";
import { $isNoteNode, NoteNode } from "shared/nodes/scripture/usj/NoteNode";
import { getNoteCallerPreviewText } from "shared/nodes/scripture/usj/node.utils";
import {
  $isImmutableNoteCallerNode,
  ImmutableNoteCallerNode,
} from "../nodes/scripture/usj/ImmutableNoteCallerNode";

/**
 * Changes in NoteNode children text are updated in the NoteNodeCaller preview text.
 * @param node - CharNode thats needs its preview text updated.
 */
function $noteCharNodeTransform(node: CharNode): void {
  const parent = node.getParentOrThrow();
  const children = parent.getChildren();
  const noteCaller = children.find((child) => $isImmutableNoteCallerNode(child));
  if (!$isCharNode(node) || (!$isNoteNode(parent) && !noteCaller)) return;

  const previewText = getNoteCallerPreviewText(children);
  (noteCaller as ImmutableNoteCallerNode).setPreviewText(previewText);
}

/**
 * When a note is inserted and it has a generated note caller , i.e. '+', use that until all the
 * callers can be updated.
 * @param node - ImmutableNoteCallerNode that needs its caller updated.
 */
function $noteCallerTransform(node: ImmutableNoteCallerNode): void {
  const parent = node.getParentOrThrow();
  if (!$isImmutableNoteCallerNode(node) || !$isNoteNode(parent) || node.getCaller() === "+") return;

  if (parent.getCaller() === "+") node.setCaller("+");
}

function useNoteNode(editor: LexicalEditor) {
  useEffect(() => {
    if (!editor.hasNodes([CharNode, NoteNode, ImmutableNoteCallerNode])) {
      throw new Error(
        "NoteNodePlugin: CharNode, NoteNode and/or ImmutableNoteCallerNode not registered on editor!",
      );
    }

    return mergeRegister(
      editor.registerNodeTransform(CharNode, $noteCharNodeTransform),
      editor.registerNodeTransform(ImmutableNoteCallerNode, $noteCallerTransform),
    );
  }, [editor]);
}

export default function NoteNodePlugin() {
  const [editor] = useLexicalComposerContext();
  useNoteNode(editor);
  return null;
}
