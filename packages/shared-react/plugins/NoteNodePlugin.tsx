/** Changes in NoteNode children text are updated in the NoteNodeCaller preview text. */

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $isCharNode, CharNode } from "shared/nodes/scripture/usj/CharNode";
import { $isNoteNode, NoteNode } from "shared/nodes/scripture/usj/NoteNode";
import {
  $isImmutableNoteCallerNode,
  ImmutableNoteCallerNode,
} from "../nodes/scripture/usj/ImmutableNoteCallerNode";
import { LexicalEditor } from "lexical";
import { getNoteCallerPreviewText } from "shared/nodes/scripture/usj/node.utils";

function noteCharNodeTransform(node: CharNode): void {
  const parent = node.getParentOrThrow();
  const children = parent.getChildren();
  const noteCaller = children.find((child) => $isImmutableNoteCallerNode(child));
  if (!$isCharNode(node) || (!$isNoteNode(parent) && !noteCaller)) return;

  const previewText = getNoteCallerPreviewText(children);
  (noteCaller as ImmutableNoteCallerNode).setPreviewText(previewText);
}

function useNoteNode(editor: LexicalEditor) {
  useEffect(() => {
    if (!editor.hasNodes([CharNode, NoteNode, ImmutableNoteCallerNode])) {
      throw new Error(
        "NoteNodePlugin: CharNode, NoteNode and/or ImmutableNoteCallerNode not registered on editor!",
      );
    }

    return editor.registerNodeTransform(CharNode, noteCharNodeTransform);
  }, [editor]);
}

export default function NoteNodePlugin() {
  const [editor] = useLexicalComposerContext();
  useNoteNode(editor);
  return null;
}
