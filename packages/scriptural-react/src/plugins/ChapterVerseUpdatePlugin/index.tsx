import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useScripturalComposerContext } from "../../context";
import { $getNodeByKey, TextNode } from "lexical";

import { useEffect } from "react";
import { $isScriptureElementNode } from "shared/nodes/scripture/generic";

export const ChapterVerseUpdatePlugin = () => {
  const [editor] = useLexicalComposerContext();
  const { scriptureReference } = useScripturalComposerContext();

  useEffect(() => {
    editor.registerNodeTransform(TextNode, (node) => {
      const parent = node.getParent();
      const nodeKey = node.getKey();
      if (
        parent &&
        $isScriptureElementNode(parent) &&
        ["c", "v"].includes(parent.getAttribute("data-marker") ?? "")
      ) {
        const { oldContent } = editor.getEditorState().read(() => {
          const oldNode = $getNodeByKey(nodeKey);
          if (!oldNode) return { oldContent: "", oldKey: "", oldNode: null };
          return { oldContent: oldNode.getTextContent(), oldKey: oldNode.getKey(), oldNode };
        });
        const newContent = node.getTextContent().replace(/[^\d-]+/g, "");

        if (newContent === oldContent) return;

        editor.update(() => {
          parent.setAttribute("data-number", newContent);
          const sid = parent.getAttribute("data-sid");
          if (sid) {
            if (parent.getAttribute("data-marker") === "v") {
              const { chapter } = scriptureReference ?? {};
              const newSid = sid.replace(
                /(.*? )*\d*(?:(:|.)\d*-*\d*)*/,
                `$1${chapter}$2${newContent}`,
              );
              parent.setAttribute("data-sid", newSid);
            } else {
              const newSid = sid.replace(/(.+? )*\d*/, `$1${newContent}`);
              parent.setAttribute("data-sid", newSid);
            }
          }
        });
      }
    });
  }, [editor, scriptureReference]);

  return null;
};
