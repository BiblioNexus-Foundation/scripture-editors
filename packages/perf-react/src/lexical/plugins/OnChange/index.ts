import { LexicalEditor } from "lexical";
import { UpdateListener } from "lexical/LexicalEditor";
import { EditorState } from "lexical";
import { getPerfOperation } from "../Perf/getPerfOperation";
import { PerfKind, PerfOperation } from "../Perf/PerfOperation";

export const registerOnChange = (
  editor: LexicalEditor,
  onChange: UpdateListener /* delay = 1000 */,
) => {
  interface HistoryStateEntry {
    editorState: EditorState;
    dirtyElements: Set<string> | null;
    dirtyLeaves: Set<string> | null;
    perfDocument?: { [key: string]: unknown };
  }
  interface HistoryState {
    stack: HistoryStateEntry[];
    cursor: number;
  }
  const HistoryState: HistoryState = {
    stack: [],
    cursor: -1,
  };
  const applyChange: UpdateListener = ({
    editorState,
    dirtyElements,
    dirtyLeaves,
    prevEditorState,
    normalizedNodes,
    tags,
  }) => {
    // console.log({
    //   editorState,
    //   dirtyElements,
    //   dirtyLeaves,
    //   prevEditorState,
    //   normalizedNodes,
    //   tags,
    //   delay,
    // });
    onChange({
      editorState,
      dirtyElements,
      dirtyLeaves,
      prevEditorState,
      normalizedNodes,
      tags,
    });
  };

  return editor.registerUpdateListener(applyChange);
};

export const handleDirtyLeaves = (
  dirtyLeaves: Set<string>,
  editorState: EditorState,
  prevEditorState: EditorState,
) => {
  if (dirtyLeaves.size > 0) {
    const perfActions = getPerfOperationsFromChangedLexicalEditorNode(
      dirtyLeaves,
      editorState,
      prevEditorState,
    );
    const newPerfActions = convertPerfActions(perfActions);
    console.log("LEAVES", { perfActions, newPerfActions, dirtyLeaves });
  }
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

const convertPerfActions = (perfActions: PerfActions) =>
  Object.keys(perfActions).reduce(
    (acc, sequenceId) => {
      acc[sequenceId] = perfActions[sequenceId].map((operation: PerfOperation) => {
        if (operation.lexicalNode) {
          return { ...operation, perfNode: operation.lexicalNode.toPerf() };
        }
        return operation;
      });
      return acc;
    },
    {} as { [key: string]: PerfOperation[] },
  );
