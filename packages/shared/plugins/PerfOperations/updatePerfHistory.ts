import { transformLexicalStateToPerf } from "../../converters/lexicalToPerf";
import { SerializedUsfmElementNode } from "../../nodes/UsfmElementNode";
import { HistoryMergeListener } from "../History";
import { getOperations } from "../History/operations";
import { operationBuilder } from "./operationBuilder";
import { getPathBuilder } from "./pathBuilder";
import { getLexicalState } from "../../contentManager";
import { applyPatch } from "open-patcher";
import equal from "deep-equal";
import { PerfDocument } from "./perfTypes";
import { EditorState } from "lexical";
import { Operation } from "open-patcher/dist/types";

/**
 * Reparses an object by converting it to JSON and then parsing it back to an object.
 * This is used to create a deep copy of the object.
 * @param x - The object to reparse.
 * @returns A deep copy of the object.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reparse = (x: any): any => JSON.parse(JSON.stringify(x));

/**
 * Returns a history merge listener function that updates the perf history.
 * @param perfSource - The initial perf document.
 * @returns A history merge listener function.
 */
export const getPerfHistoryUpdater: (perfSource: PerfDocument) => HistoryMergeListener =
  (perfSource) =>
  /**
   * Updates the perf history based on editor changes.
   * @param editorChanged - Indicates whether the editor has changed.
   * @param dirtyElements - The dirty elements in the editor.
   * @param editorState - The current editor state.
   * @param prevEditorState - The previous editor state.
   * @param history - The history object.
   */
  ({ editorChanged, dirtyElements, editorState, prevEditorState, history }) => {
    const { canUndo, mergeHistory, currentEntry } = history;
    const { perfDocument: prevPerfDocument } = currentEntry as {
      perfDocument: PerfDocument;
    };

    // History initialization
    if (!canUndo && !prevPerfDocument) {
      console.log("Initializing Perf History");
      mergeHistory({ perfDocument: perfSource });
      return;
    }

    // If the editor has not changed, return
    if (!editorChanged) return;

    // Get the operations (add, remove, replace) for the dirty elements
    const elementOperations = getOperations({
      dirtyNodes: dirtyElements,
      editorState,
      prevEditorState,
      pathBuilder: getPathBuilder(prevPerfDocument["main_sequence_id"] ?? "main_sequence"),
      operationBuilder: operationBuilder,
    });

    // Apply the operations to the previous perf document sequences
    const patchedSequences = applyPatch({
      source: prevPerfDocument.sequences ?? {},
      operations: [...elementOperations] as Operation[],
    });

    // Patch the sequences in the previous perf document
    const patchedPerfDocument = { ...prevPerfDocument, sequences: patchedSequences };

    // Check the roundtrip of the patched document (should remove this in production)
    checkRoundtrip({ editorState, perfSource, patchedPerfDocument, show: true });

    // Merge the history with the patched perf document
    mergeHistory({
      perfDocument: patchedPerfDocument,
    });
    console.log("=================================");
  };

/**
 * Checks the roundtrip of the patched perf document and logs any differences.
 * @param editorState - The current editor state.
 * @param perfSource - The initial perf document.
 * @param patchedPerfDocument - The patched perf document.
 * @param show - Indicates whether to show the roundtrip check results.
 */
const checkRoundtrip = ({
  editorState,
  perfSource,
  patchedPerfDocument,
  show = true,
}: {
  editorState: EditorState;
  perfSource: PerfDocument;
  patchedPerfDocument: PerfDocument;
  show: boolean;
}) => {
  if (!show) return;
  const editorLexicalState = editorState.toJSON();
  const _lexicalPerfState = transformLexicalStateToPerf(
    editorLexicalState.root as SerializedUsfmElementNode,
    "sequence",
  );
  const lexicalPerfState = {
    ...perfSource,
    sequences: {
      [perfSource["main_sequence_id"] ?? "main_sequence"]: _lexicalPerfState.targetNode,
      ..._lexicalPerfState.sequences,
    },
  };
  // Check if the patched document is equal to the lexicalState converted to Perf
  const isPerfEqual = equal(patchedPerfDocument, lexicalPerfState);
  console.log("Is perf deep equal:", isPerfEqual);
  // If they are not equal, log the source and target for comparison
  if (!isPerfEqual) {
    console.log({
      source: JSON.stringify(lexicalPerfState, null, 2),
      target: JSON.stringify(patchedPerfDocument, null, 2),
    });
  }

  // Get a lexical state from the patched perf document
  const perfLexicalState = getLexicalState(patchedPerfDocument);

  // Check if the patched lexical state is equal to the editor's lexical state
  const isLexicalEqual = equal(reparse(editorLexicalState), perfLexicalState);
  console.log("Is lexical deep equal:", isLexicalEqual);

  // If they are not equal, log the source and target for comparison
  if (!isLexicalEqual) {
    console.log({
      source: JSON.stringify(editorLexicalState, null, 2),
      target: JSON.stringify(perfLexicalState, null, 2),
    });
  }

  if (!isLexicalEqual && !isPerfEqual) console.warn("Roundtrip failed");
};
