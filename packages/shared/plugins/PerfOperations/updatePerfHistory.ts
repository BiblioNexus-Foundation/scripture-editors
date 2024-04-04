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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reparse = (x: any): any => JSON.parse(JSON.stringify(x));

export const updatePerfHistory: (perfSource: PerfDocument) => HistoryMergeListener =
  (perfSource) =>
  ({ editorChanged, dirtyElements, editorState, prevEditorState, history }) => {
    const { canUndo, mergeHistory, currentEntry } = history;
    const { perfDocument: prevPerfDocument } = currentEntry as {
      perfDocument: PerfDocument;
    };

    if (!canUndo && !prevPerfDocument) {
      //History initialization
      console.log("Initializing Perf History");
      mergeHistory({ perfDocument: perfSource });
      return;
    }

    if (!editorChanged) return;

    const elementOperations = getOperations({
      dirtyNodes: dirtyElements,
      editorState,
      prevEditorState,
      pathBuilder: getPathBuilder(prevPerfDocument["main_sequence_id"] ?? "main_sequence"),
      operationBuilder: operationBuilder,
    });

    console.log({ elementOperations });

    const patchedSequences = applyPatch({
      source: prevPerfDocument.sequences ?? {},
      operations: [...elementOperations] as Operation[],
    });

    const patchedPerfDocument = { ...prevPerfDocument, sequences: patchedSequences };

    checkRoundtrip({ editorState, perfSource, patchedPerfDocument, show: true });

    mergeHistory({
      actions: { elementOperations },
      perfDocument: patchedPerfDocument,
    });
    console.log("=================================");
  };

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
