import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorState } from "lexical";
import { UpdateListener } from "lexical/LexicalEditor";
import { getPerfOperation } from "./Perf/getPerfOperation";
import { PerfKind, PerfOperation } from "./Perf/PerfOperation";

export const OnChangePlugin = ({ onChange }: { onChange: UpdateListener }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(
      ({ editorState, dirtyElements, dirtyLeaves, prevEditorState, normalizedNodes, tags }) => {
        if (dirtyElements.size > 0) {
          const perfActions = getPerfOperationsFromChangedLexicalEditorNode(
            dirtyElements,
            editorState,
            prevEditorState,
            { filterBy: PerfKind.Block },
          );
          console.log("ELEMENTS", { perfActions, dirtyElements });
        }
        if (dirtyLeaves.size > 0) {
          const perfActions = getPerfOperationsFromChangedLexicalEditorNode(
            dirtyLeaves,
            editorState,
            prevEditorState,
          );
          onChange({
            editorState,
            dirtyElements,
            dirtyLeaves,
            prevEditorState,
            normalizedNodes,
            tags,
          });

          console.log("LEAVES", { perfActions, dirtyLeaves });
        }
      },
    );
  }, [editor, onChange]);

  return null;
};

/**
 * Represents a collection of Perf actions.
 *
 * @remarks
 * The `PerfActions` interface is used to store perf actions associated with a sequence ID.
 * Each sequence ID is mapped to an array of `PerfAction` objects.
 */
interface PerfActions {
  [sequenceId: string]: PerfOperation[];
}

/**
 * Retrieves Proskomma Editor Ready Format (PERF) operations from changed nodes in the Lexical Editor.
 *
 * @param dirtyNodes - The set or map of nodes that have been modified.
 * @param editorState - The current state of the editor.
 * @param prevEditorState - The previous state of the editor.
 * @returns A collection of PERF operations grouped by sequence ID.
 *
 * @remarks
 * This function is used in the context of a Lexical Editor, where nodes represent PERF documents.
 * It retrieves operations from nodes that have been modified ("dirty" nodes), and returns a collection
 * of these operations, organized by sequence ID. Each sequence ID is mapped to an array of `PerfOperation` objects.
 */
function getPerfOperationsFromChangedLexicalEditorNode(
  dirtyNodes: Set<string> | Map<string, boolean>,
  editorState: EditorState,
  prevEditorState: EditorState,
  options: { filterBy?: PerfKind } = { filterBy: PerfKind.ContentElement },
) {
  const perfActions: PerfActions = {};
  for (const dirtyNode of dirtyNodes) {
    const nodeKey = typeof dirtyNode === "string" ? dirtyNode : dirtyNode[0];
    // Get perf action for each dirty leaf nod
    const perfAction = getPerfOperation(nodeKey, prevEditorState, editorState);
    if (perfAction.kind !== options.filterBy) continue; //TODO: infer kind and evaluate before getPerfOperation to improve performance
    if (!Object.hasOwn(perfActions, perfAction.path[0])) {
      perfActions[perfAction.path[0]] = [];
    }
    perfActions[perfAction.path[0]].push(perfAction);
  }
  return perfActions;
}
