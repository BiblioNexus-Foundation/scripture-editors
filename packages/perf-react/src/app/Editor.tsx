import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import scriptureNodes from "shared/nodes";
import { useLexicalPerfState } from "./useLexicalState";
import { HistoryMergeListener } from "shared/plugins/History";
import { HistoryPlugin } from "shared-react/plugins/History/HistoryPlugin";
import { OnChangePlugin } from "shared-react/plugins/OnChange/OnChangePlugin";
import { applyPatch } from "open-patcher";
import { getOperations } from "shared/plugins/History/operations";
import { getPathBuilder } from "shared/plugins/PerfOperations/pathBuilder";
import { operationBuilder } from "shared/plugins/PerfOperations/operationBuilder";
import { devLog } from "../utils";
import { getLexicalState } from "shared/contentManager";
import { transformLexicalStateToPerf } from "shared/converters/lexicalToPerf";
import equal from "deep-equal";
import { SerializedUsfmElementNode } from "shared/nodes/UsfmElementNode";

const theme = {
  // Theme styling goes here
};

function onError(error: Error) {
  console.error(error);
}

export default function Editor() {
  /**
   *  currently useLexicalState fills lexicalState
   *  with a lexical state string which is converted from
   *  hardcoded usfm for testing purposes
   **/
  const { lexicalState, perfDocument } = useLexicalPerfState();

  const initialConfig = {
    namespace: "ScriptureEditor",
    theme,
    editorState: lexicalState,
    onError,
    nodes: [...scriptureNodes],
  };

  const handleChange: HistoryMergeListener = ({
    dirtyLeaves,
    dirtyElements,
    editorState,
    prevEditorState,
    history,
  }) => {
    const { canUndo, mergeHistory, currentEntry } = history;
    const { perfDocument: prevPerfDocument } = currentEntry as {
      perfDocument: { sequences: { [sequenceId: string]: unknown }; ["main_sequence_id"]: string };
    };
    console.log({ dirtyElements, dirtyLeaves });

    if (!canUndo && !prevPerfDocument) {
      //History initialization
      mergeHistory({ perfDocument });
      return;
    }

    //TODO: MAKE SURE MODIFICATIONS TO CONTENT ELEMENTS OF KIND GRAFT ARE ALSO CONVERTED INTO SEQUENCE ACTIONS IF THEY ARE DELETED OR REPLACED WITH A DIFFERENT GRAFT (OTHER TARGET).
    const elementOperations = getOperations({
      dirtyNodes: dirtyElements,
      editorState,
      prevEditorState,
      pathBuilder: getPathBuilder(prevPerfDocument["main_sequence_id"]),
      operationBuilder: operationBuilder,
    });

    const patchedSequences = applyPatch({
      source: prevPerfDocument.sequences,
      operations: [...elementOperations],
    });

    const patchedDocument = { ...prevPerfDocument, sequences: patchedSequences };
    devLog({ editorState });

    const editorLexicalState = editorState.toJSON();
    const _lexicalPerfState = transformLexicalStateToPerf(
      editorLexicalState.root as SerializedUsfmElementNode,
      "sequence",
    );
    const lexicalPerfState = {
      ...patchedDocument,
      sequences: {
        [patchedDocument["main_sequence_id"]]: _lexicalPerfState.targetNode,
        ..._lexicalPerfState.sequences,
      },
    };
    const isPerfDeepEqual =
      JSON.stringify(patchedDocument, null, 2) === JSON.stringify(lexicalPerfState, null, 2);
    devLog("Is perf deep equal:", isPerfDeepEqual, equal(patchedDocument, lexicalPerfState));
    devLog({
      a: JSON.stringify(patchedDocument, null, 2),
      b: JSON.stringify(lexicalPerfState, null, 2),
    });

    const perfLexicalState = getLexicalState(patchedDocument);

    const isLexicalDeepEqual =
      JSON.stringify(editorLexicalState, null, 2) === JSON.stringify(perfLexicalState, null, 2);
    devLog(
      "Is lexical deep equal:",
      isLexicalDeepEqual,
      equal(editorLexicalState, perfLexicalState),
    );

    devLog({ editorLexicalState, perfLexicalState });
    devLog({
      a: JSON.stringify(editorLexicalState, null, 2),
      b: JSON.stringify(perfLexicalState, null, 2),
    });

    mergeHistory({
      actions: { elementOperations },
      perfDocument: patchedDocument,
    });
  };

  return !lexicalState || !perfDocument ? null : (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={"editor-oce"}>
        <RichTextPlugin
          contentEditable={
            <div className="editor">
              <ContentEditable className="contentEditable" />
            </div>
          }
          placeholder={<div className="placeholder">Enter some text...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin onChange={handleChange} />
        <OnChangePlugin
          onChange={(args) => {
            console.info({ args });
          }}
        />
      </div>
    </LexicalComposer>
  );
}
