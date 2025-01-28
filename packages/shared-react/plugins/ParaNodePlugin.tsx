import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, LexicalEditor } from "lexical";
import { useEffect } from "react";
import { $isParaNode, ParaNode } from "shared/nodes/scripture/usj/ParaNode";

/**
 * Update ParaNode to not contain text if it is a 'b' marker (blank line). However, if the 'b'
 * ParaNode already contained text, it can be modified (backwards compatible with PT9 & USFM v3.0).
 * @param node - ParaNode thats needs updating.
 */
function $paraNodeTransform(node: ParaNode, editor: LexicalEditor): void {
  if (!$isParaNode(node) || node.getMarker() !== "b" || node.isEmpty()) return;

  const prevEditorState = editor.getEditorState();
  const wasEmpty = prevEditorState.read(() => {
    const prevNode = $getNodeByKey(node.getKey());
    return $isParaNode(prevNode) && (prevNode?.isEmpty() ?? false);
  });
  if (!wasEmpty) return;

  node.clear();
}

function useParaNode(editor: LexicalEditor) {
  useEffect(() => {
    if (!editor.hasNodes([ParaNode])) {
      throw new Error("ParaNodePlugin: ParaNode not registered on editor!");
    }

    // Update ParaNode to not contain text if it is a b marker.
    return editor.registerNodeTransform(ParaNode, (node: ParaNode) =>
      $paraNodeTransform(node, editor),
    );
  }, [editor]);
}

export default function ParaNodePlugin(): null {
  const [editor] = useLexicalComposerContext();
  useParaNode(editor);
  return null;
}
