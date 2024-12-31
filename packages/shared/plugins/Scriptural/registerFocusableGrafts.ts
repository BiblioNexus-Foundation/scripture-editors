import { $getNodeByKey, $getSelection, LexicalEditor, NodeKey } from "lexical";
import { GraftNode } from "../../nodes/GraftNode";
import { $findMatchingParent } from "@lexical/utils";
import { ScriptureElementNode } from "../../nodes/scripture/generic/ScriptureElementNode";

export function registerToggableNodes(
  editor: LexicalEditor,
  toggableNodeTypes: string[] = ["note"],
) {
  const $removeToggledNodes = () => {
    if (toggledNodes.length === 0) return;
    editor.update(
      () => {
        toggledNodes.forEach((toggledNode) => {
          const node = $getNodeByKey<GraftNode>(toggledNode);
          if (!node) return;
          node.removeUIAttribute("active");
        });
        toggledNodes.length = 0;
      },
      { tag: "history-merge" },
    );
  };

  const toggledNodes: NodeKey[] = [];
  editor.registerUpdateListener(({ editorState }) => {
    editorState.read(() => {
      const selection = $getSelection();
      const nodes = selection?.getNodes();
      if (nodes?.length !== 1) return;
      const node = $findMatchingParent(nodes[0], (node): node is ScriptureElementNode => {
        if (!(node instanceof ScriptureElementNode)) return false;
        return toggableNodeTypes.includes(node.getAttributes()["data-type"]);
      });
      if (!node) {
        $removeToggledNodes();
        return;
      }
      if (toggledNodes.includes(node.getKey())) {
        return;
      }
      editor.update(
        () => {
          toggledNodes.forEach((toggledNode) => {
            try {
              const node = $getNodeByKey<ScriptureElementNode>(toggledNode);
              if (!node) return;
              node.removeUIAttribute("active");
            } catch (e) {
              console.error(e);
            }
          });
          toggledNodes.length = 0;

          node.setUIAttribute("active", "true");
          toggledNodes.push(node.getKey());
        },
        { tag: "history-merge" },
      );
    });
  });
}
