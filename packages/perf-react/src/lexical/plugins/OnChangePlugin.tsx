import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getNodeByKey,
  $getSelection,
  EditorState,
  ElementNode,
  LexicalEditor,
  LexicalNode,
} from "lexical";
import { UsfmElementNode } from "shared/nodes/UsfmElementNode";

export type OnChange = (editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => void;
function checkIsSequence(node: UsfmElementNode | ElementNode) {
  return ["root", "graft"].includes(node?.getType() || "");
}
function getKind(
  node: UsfmElementNode | ElementNode,
  parent: UsfmElementNode | ElementNode | null,
) {
  if (node && checkIsSequence(node)) return "sequence";
  if (parent && checkIsSequence(parent)) return "block";
  return "content";
}

//Lots of experimenting here.
export const OnChangePlugin = ({ onChange }: { onChange: OnChange }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener((props) => {
      const { editorState, dirtyElements, dirtyLeaves } = props;
      console.log("CHANGE");
      editorState.read(() => {
        const selection = $getSelection();
        selection?.getNodes();
      });
      if (dirtyElements.size > 0) {
        console.log("DIRTY ELEMENTS", {
          dirtyElements,
        });
        // onChange(editorState, editor, tags);
        // console.log("LOOPING THROUGH DIRTY ELEMENTS...")
        const perfPathArray = [];
        for (const [nodeKey] of dirtyElements) {
          const { index, kind, target } = getNodeInfo(editorState, nodeKey);
          //[blocks][i][content][i][content][i]
          // console.log("ELEMENT DATA:",{ node, index, kind, children, type, target })

          if (kind === "sequence") {
            perfPathArray.unshift(target ?? "main");
            break;
          }

          perfPathArray.unshift(index);

          if (kind === "content") {
            perfPathArray.unshift("content");
          }

          if (kind === "block") {
            perfPathArray.unshift("blocks");
          }
        }
        console.log({ dirtyElementNodePath: perfPathArray }, { path: perfPathArray.join("/") });
        // console.log("FINISHED LOOPING THROUGH DIRTY ELEMENTS.")
      }
      if (dirtyLeaves.size > 0) {
        console.log("DIRTY LEAVES", {
          dirtyLeaves,
        });
        for (const nodeKey of dirtyLeaves) {
          editorState.read(() => {
            const node: UsfmElementNode | null = $getNodeByKey(nodeKey);
            if (!node) return {};
            const dirtyLeaveNodePath = recursiveGetNodePath(node);
            console.log({ dirtyLeaveNodePath }, { path: dirtyLeaveNodePath?.join("/") });
          });
        }
      }
    });
  }, [editor, onChange]);

  return null;
};
function getNodeInfo(
  editorState: EditorState,
  nodeKey: string,
): {
  node?: UsfmElementNode;
  index?: number;
  kind?: string;
  children?: LexicalNode[];
  type?: string;
  target?: string;
} {
  return editorState.read(() => {
    const node: UsfmElementNode | null = $getNodeByKey(nodeKey);
    if (!node) return {};
    const parent = node.getParent();
    const atts = node.getAttributes?.() || {};
    const type = atts["data-type"];
    const target = atts["data-target"];
    const kind = getKind(node, parent);
    const index = parent ? parent.getChildrenKeys?.().findIndex((key) => nodeKey === key) : 0;
    const children = node.getChildren?.();
    return { node, index, kind, children, type, target };
  });
}

function recursiveGetNodePath(
  node: UsfmElementNode,
  pathArray: Array<string | number> = [],
): Array<string | number> {
  const parent: UsfmElementNode | null = node.getParent();
  const kind = getKind(node, parent);
  const nodeKey = node.getKey();
  const index = parent ? parent.getChildrenKeys?.().findIndex((key) => nodeKey === key) : 0;

  if (kind === "sequence") {
    const target = node.getAttributes?.()?.["data-target"];
    pathArray.unshift(target ?? "main");
    return pathArray;
  }

  pathArray.unshift(index);

  if (kind === "content") {
    pathArray.unshift("content");
  }

  if (kind === "block") {
    pathArray.unshift("blocks");
  }

  return parent ? recursiveGetNodePath(parent, pathArray) : pathArray;
}
