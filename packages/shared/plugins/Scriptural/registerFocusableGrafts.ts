import { $getNodeByKey, $getSelection, LexicalEditor, NodeKey } from "lexical";
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
        const selection = $getSelection();
        if (!selection) return;
        toggledNodes.forEach((toggledNode) => {
          const node = $getNodeByKey<ScriptureElementNode>(toggledNode);
          if (!node) return;
          node.removeUIAttribute("active");
        });
        toggledNodes.length = 0;
      },
      { tag: ["history-merge", "skip-set-active-nodes"], discrete: true },
    );
    return;
  };

  const toggledNodes: NodeKey[] = [];
  editor.registerUpdateListener(({ editorState, tags }) => {
    if (tags.has("skip-toggle-nodes")) {
      return;
    }
    editorState.read(() => {
      const selection = $getSelection();
      const nodes = selection?.getNodes();
      if (nodes?.length !== 1) return;
      const node = $findMatchingParent(nodes[0], (node): node is ScriptureElementNode => {
        if (!(node instanceof ScriptureElementNode)) return false;
        return toggableNodeTypes.includes(node.getAttributes()["data-type"]);
      });
      if (!node) {
        if (!tags.has("skip-remove-active-nodes")) {
          $removeToggledNodes();
        }
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
              if (!tags.has("skip-remove-active-nodes")) {
                node.removeUIAttribute("active");
              }
            } catch (e) {
              console.error(e);
            }
          });
          if (!tags.has("skip-set-active-nodes")) {
            toggledNodes.length = 0;
            node.setUIAttribute("active", "true");
            toggledNodes.push(node.getKey());
          }
        },
        { tag: "history-merge", discrete: true },
      );
    });
  });
}
