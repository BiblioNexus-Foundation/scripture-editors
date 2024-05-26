import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister, registerNestedElementResolver } from "@lexical/utils";
import {
  $createPoint,
  $createRangeSelection,
  $getNodeByKey,
  $getRoot,
  $isElementNode,
  $isTextNode,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  TextNode,
} from "lexical";
import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import {
  $createTypedMarkNode,
  $isTypedMarkNode,
  $unwrapTypedMarkNode,
  $wrapSelectionInTypedMarkNode,
  TypedMarkNode,
  TypedIDs,
} from "shared/nodes/features/TypedMarkNode";
import { AnnotationLocation, AnnotationRange } from "./annotation.model";
import { LoggerBasic } from "../plugins/logger-basic.model";

/** Forward reference for annotations. */
export type AnnotationRef = {
  addAnnotation(selection: AnnotationRange, type: string, id: string): void;
  removeAnnotation(type: string, id: string): void;
};

const JSON_PATH_START = "$";
const JSON_PATH_CONTENT = ".content[";

function getTypeIDMapKey(type: string, id: string): string {
  return `${type}:${id}`;
}

function useAnnotations(editor: LexicalEditor, markNodeMap: Map<string, Set<NodeKey>>) {
  useEffect(() => {
    if (!editor.hasNodes([TypedMarkNode])) {
      throw new Error("AnnotationPlugin: TypedMarkNode not registered on editor!");
    }

    const markNodeKeysToTypedIDs: Map<NodeKey, TypedIDs> = new Map();

    return mergeRegister(
      registerNestedElementResolver<TypedMarkNode>(
        editor,
        TypedMarkNode,
        (from: TypedMarkNode) => {
          return $createTypedMarkNode(from.getTypedIDs());
        },
        (from: TypedMarkNode, to: TypedMarkNode) => {
          // Merge the IDs
          for (const [type, ids] of Object.entries(from.getTypedIDs())) {
            ids.forEach((id) => {
              to.addID(type, id);
            });
          }
        },
      ),
      editor.registerMutationListener(TypedMarkNode, (mutations) => {
        editor.getEditorState().read(() => {
          // Keep track of mutated mark node keys so they can be removed later.
          for (const [key, mutation] of mutations) {
            const node = $getNodeByKey<TypedMarkNode>(key);
            let typedIDs: TypedIDs = {};

            if (mutation === "destroyed") {
              typedIDs = markNodeKeysToTypedIDs.get(key) || {};
            } else if ($isTypedMarkNode(node)) {
              typedIDs = node.getTypedIDs();
            }

            for (const [type, ids] of Object.entries(typedIDs)) {
              for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                let markNodeKeys = markNodeMap.get(getTypeIDMapKey(type, id));
                typedIDs[type] = ids;
                markNodeKeysToTypedIDs.set(key, typedIDs);

                if (mutation === "destroyed") {
                  if (markNodeKeys !== undefined) {
                    markNodeKeys.delete(key);
                    if (markNodeKeys.size === 0) {
                      markNodeMap.delete(getTypeIDMapKey(type, id));
                    }
                  }
                } else {
                  if (markNodeKeys === undefined) {
                    markNodeKeys = new Set();
                    markNodeMap.set(getTypeIDMapKey(type, id), markNodeKeys);
                  }
                  if (!markNodeKeys.has(key)) {
                    markNodeKeys.add(key);
                  }
                }
              }
            }
          }
        });
      }),
    );
  }, [editor, markNodeMap]);
}

function extractJsonPathIndexes(jsonPath: string): number[] {
  const path = jsonPath.split(JSON_PATH_CONTENT);
  if (path.shift() !== JSON_PATH_START)
    throw new Error(`extractJsonPathIndexes: jsonPath didn't start with '${JSON_PATH_START}'`);

  const indexes = path.map((str) => parseInt(str, 10));
  return indexes;
}

/**
 * Find the text node that contains the location offset. Check if the offset fits within the current
 * text node, if it doesn't check in the next nodes ignoring the TypedMarkNodes but looking inside
 * as if the text was contiguous.
 * @param node - Current text node.
 * @param offset - Annotation location offset.
 * @returns the text node and offset where the offset was found in.
 */
function $findTextNodeInMarks(
  node: LexicalNode | undefined,
  offset: number,
): [TextNode | undefined, number | undefined] {
  if (!node || !$isTextNode(node)) return [undefined, undefined];

  const text = node.getTextContent();
  if (offset >= 0 && offset < text.length) return [node, offset];

  let nextNode = node.getNextSibling();
  if (!nextNode) {
    const parent = node.getParent();
    if ($isTypedMarkNode(parent)) nextNode = parent.getNextSibling();
  }
  if (!nextNode || (!$isTypedMarkNode(nextNode) && !$isTextNode(nextNode)))
    return [undefined, undefined];

  const nextOffset = offset - text.length;
  if (nextNode && $isTextNode(nextNode)) return $findTextNodeInMarks(nextNode, nextOffset);

  return $findTextNodeInMarks(nextNode.getFirstChild() ?? undefined, nextOffset);
}

function $getNodeFromLocation(
  location: AnnotationLocation,
): [LexicalNode | undefined, number | undefined] {
  const indexes = extractJsonPathIndexes(location.jsonPath);
  let currentNode: LexicalNode | undefined = $getRoot();
  for (const index of indexes) {
    if (!currentNode || !$isElementNode(currentNode)) return [undefined, undefined];

    currentNode = currentNode.getChildAtIndex(index) ?? undefined;
  }

  return $findTextNodeInMarks(currentNode, location.offset);
}

function $getPointType(node: LexicalNode | undefined): "text" | "element" {
  return $isElementNode(node) ? "element" : "text";
}

const AnnotationPlugin = forwardRef(function AnnotationPlugin<TLogger extends LoggerBasic>(
  { logger }: { logger?: TLogger },
  ref: React.ForwardedRef<AnnotationRef>,
) {
  const [editor] = useLexicalComposerContext();
  const markNodeMap = useMemo<Map<string, Set<NodeKey>>>(() => {
    return new Map();
  }, []);
  useAnnotations(editor, markNodeMap);

  useImperativeHandle(ref, () => ({
    addAnnotation(selection, type, id) {
      const { start, end } = selection;
      editor.update(() => {
        // Find the start and end nodes with offsets based on the location.
        const [startNode, startOffset] = $getNodeFromLocation(start);
        const [endNode, endOffset] = $getNodeFromLocation(end);
        if (!startNode || !endNode || startOffset === undefined || endOffset === undefined) {
          logger?.error("Failed to find start or end node of the annotation.");
          return;
        }

        // Apply the annotation to the selected range.
        const selection = $createRangeSelection();
        selection.anchor = $createPoint(startNode.getKey(), startOffset, $getPointType(startNode));
        selection.focus = $createPoint(endNode.getKey(), endOffset, $getPointType(endNode));
        const isBackward = selection.isBackward();
        $wrapSelectionInTypedMarkNode(selection, isBackward, type, id);
      });
    },
    removeAnnotation(type, id) {
      const markNodeKeys = markNodeMap.get(getTypeIDMapKey(type, id));
      if (markNodeKeys !== undefined) {
        // Do async to avoid causing a React infinite loop
        setTimeout(() => {
          editor.update(() => {
            for (const key of markNodeKeys) {
              const node: TypedMarkNode | null = $getNodeByKey(key);
              if ($isTypedMarkNode(node)) {
                node.deleteID(type, id);
                if (node.hasNoIDsForEveryType()) {
                  $unwrapTypedMarkNode(node);
                }
              }
            }
          });
        });
      }
    },
  }));

  return null;
});

export default AnnotationPlugin;
