import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister, registerNestedElementResolver } from "@lexical/utils";
import { $getNodeByKey, LexicalEditor, NodeKey } from "lexical";
import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import {
  $createTypedMarkNode,
  $isTypedMarkNode,
  $unwrapTypedMarkNode,
  $wrapSelectionInTypedMarkNode,
  TypedMarkNode,
  TypedIDs,
} from "shared/nodes/features/TypedMarkNode";
import { ANNOTATION_CHANGE_TAG } from "shared/nodes/scripture/usj/node.utils";
import { LoggerBasic } from "../plugins/logger-basic.model";
import { AnnotationRange } from "./selection.model";
import { $getRangeFromSelection } from "./selection.utils";

/** Forward reference for annotations. */
export type AnnotationRef = {
  addAnnotation(selection: AnnotationRange, type: string, id: string): void;
  removeAnnotation(type: string, id: string): void;
};

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
      editor.registerMutationListener(
        TypedMarkNode,
        (mutations) => {
          editor.getEditorState().read(() => {
            // Keep track of mutated mark node keys so they can be removed later.
            for (const [key, mutation] of mutations) {
              const node = $getNodeByKey<TypedMarkNode>(key);
              let typedIDs: TypedIDs = {};

              if (mutation === "destroyed") {
                typedIDs = markNodeKeysToTypedIDs.get(key) ?? {};
              } else if ($isTypedMarkNode(node)) {
                typedIDs = node.getTypedIDs();
              }

              for (const [type, ids] of Object.entries(typedIDs)) {
                // Skip reserved types as they will handle their own keys.
                if (TypedMarkNode.isReservedType(type)) continue;

                for (const id of ids) {
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
        },
        { skipInitialization: true },
      ),
    );
  }, [editor, markNodeMap]);
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
      if (TypedMarkNode.isReservedType(type))
        throw new Error(
          `addAnnotation: Can't directly add this reserved annotation type '${type}'.` +
            " Use the appropriate plugin instead.",
        );

      editor.update(
        () => {
          // Apply the annotation to the selected range.
          const rangeSelection = $getRangeFromSelection(selection);
          if (rangeSelection === undefined) {
            logger?.error("Failed to find start or end node of the annotation.");
            return;
          }

          $wrapSelectionInTypedMarkNode(rangeSelection, type, id);
        },
        { tag: ANNOTATION_CHANGE_TAG },
      );
    },

    removeAnnotation(type, id) {
      if (TypedMarkNode.isReservedType(type))
        throw new Error(
          `removeAnnotation: Can't directly remove this reserved annotation type '${type}'.` +
            " Use the appropriate plugin instead.",
        );

      const markNodeKeys = markNodeMap.get(getTypeIDMapKey(type, id));
      if (markNodeKeys !== undefined) {
        // Do async to avoid causing a React infinite loop
        setTimeout(() => {
          editor.update(
            () => {
              for (const key of markNodeKeys) {
                const node: TypedMarkNode | null = $getNodeByKey(key);
                if ($isTypedMarkNode(node)) {
                  node.deleteID(type, id);
                  if (node.hasNoIDsForEveryType()) {
                    $unwrapTypedMarkNode(node);
                  }
                }
              }
            },
            { tag: ANNOTATION_CHANGE_TAG },
          );
        });
      }
    },
  }));

  return null;
});

export default AnnotationPlugin;
