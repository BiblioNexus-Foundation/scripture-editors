import { $getNodeByKey, $getSelection, LexicalEditor, NodeKey } from "lexical";
import { GraftNode } from "../../nodes/GraftNode";
import { $findMatchingParent } from "@lexical/utils";

export function registerDefaultPerfHandlers(editor: LexicalEditor) {
  registerFocusableGrafts(editor);
}

export function registerFocusableGrafts(
  editor: LexicalEditor,
  focusableGraftTypes: string[] = ["xref", "footnote"],
) {
  const $removeFocusedGrafts = () => {
    if (focusedGrafts.length === 0) return;
    console.log("removing focused grafts");
    editor.update(
      () => {
        focusedGrafts.forEach((focusedGraft) => {
          const node = $getNodeByKey<GraftNode>(focusedGraft);
          if (!node) return;
          node.removeUIAttribute("active");
        });
        focusedGrafts.length = 0;
      },
      { tag: "history-merge" },
    );
  };

  const focusedGrafts: NodeKey[] = [];
  editor.registerUpdateListener(({ editorState, tags }) => {
    if (tags.has("history-merge")) return;
    editorState.read(() => {
      const selection = $getSelection();
      const nodes = selection?.getNodes();
      if (nodes?.length !== 1) return;
      const graft = $findMatchingParent(
        nodes[0],
        (node): node is GraftNode =>
          node instanceof GraftNode &&
          focusableGraftTypes.includes(node.getAttributes()["perf-subtype"]),
      );
      if (!graft) {
        $removeFocusedGrafts();
        return;
      }
      console.log({ focusedGrafts });
      if (focusedGrafts.includes(graft.getKey())) {
        console.log("already focused, skipping");
        return;
      }

      editor.update(
        () => {
          console.log("focusing graft");
          focusedGrafts.forEach((focusedGraft) => {
            const node = $getNodeByKey<GraftNode>(focusedGraft);
            if (!node) return;
            node.removeUIAttribute("active");
          });
          focusedGrafts.length = 0;
          graft.setUIAttribute("active", "true");
          focusedGrafts.push(graft.getKey());
        },
        { tag: "history-merge" },
      );
    });
  });
}
