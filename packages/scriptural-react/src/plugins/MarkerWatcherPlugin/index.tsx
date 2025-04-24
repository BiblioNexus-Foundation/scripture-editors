import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey } from "lexical";
import { $getSelection } from "lexical";
import { $isScriptureElementNode } from "shared/nodes/scripture/generic";
import { $isUsfmElementNode } from "shared/nodes/UsfmElementNode";
import { useScripturalComposerContext } from "../../context";
import { InlineNode } from "shared/nodes/scripture/generic/InlineNode";
import { BlockNode } from "shared/nodes/scripture/generic/BlockNode";

export function MarkerWatcherPlugin() {
  const [editor] = useLexicalComposerContext();
  const { setSelectedMarker } = useScripturalComposerContext();

  useEffect(() => {
    editor.registerUpdateListener(({ editorState }) => {
      if (!editor.hasNodes([InlineNode, BlockNode])) {
        throw new Error("MarkerWatcherPlugin: ScriptureElementNode is not registered on editor!");
      }
      editorState.read(() => {
        const selection = $getSelection();
        if (!selection) return;
        const startEndPoints = selection.getStartEndPoints();
        if (!startEndPoints) return;
        const startNode = $getNodeByKey(startEndPoints[0].key);
        const endNode = $getNodeByKey(startEndPoints[1].key);
        if (!startNode || !endNode) return;
        //This is the selected element expected to be a usfm element;
        const selectedElement = startNode?.getCommonAncestor(endNode);
        if (
          selectedElement &&
          ($isUsfmElementNode(selectedElement) || $isScriptureElementNode(selectedElement))
        ) {
          setSelectedMarker(selectedElement.getAttribute("data-marker"));
        }
      });
    });
  }, [editor]);

  return null;
}
