import { useEffect } from "react";
import { EditButtons } from "./EditButtons";
import { InsertButtons } from "./InsertButtons";
import { $getRoot, $isElementNode, $isTextNode, ElementNode, LexicalNode } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export default function ToolbarPlugin({ font, fontSize }: { font?: string; fontSize?: number }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.update(() => {
      const rootNode = $getRoot();
      const traverseAndApplyStyle = (node: LexicalNode) => {
        if ($isTextNode(node)) {
          const styleString = `font-family: ${font}; font-size: ${fontSize}rem;`;
          node.setStyle(styleString);
        } else if ($isElementNode(node)) {
          // If the node is an element node, get its children and traverse them
          const elementNode = node as ElementNode;
          const children = elementNode.getChildren();
          children.forEach((childNode) => traverseAndApplyStyle(childNode));
        }
      };

      traverseAndApplyStyle(rootNode);
    });
  }, [editor, font, fontSize]);

  return (
    <div className="sticky top-0 flex w-full flex-shrink-0 items-center justify-between border-b border-gray-200 bg-secondary px-2 py-1 text-white">
      <EditButtons />
      <InsertButtons />
    </div>
  );
}
