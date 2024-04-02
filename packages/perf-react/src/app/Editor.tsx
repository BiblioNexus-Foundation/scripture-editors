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
import { getPathBuilder } from "../lexical/plugins/Perf/pathBuilder";
import { operationBuilder } from "../lexical/plugins/Perf/operationBuilder";

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
    dirtyElements,
    editorState,
    prevEditorState,
    history,
  }) => {
    const { canUndo, mergeHistory, currentEntry } = history;
    const { perfDocument: prevPerfDocument } = currentEntry as {
      perfDocument: { sequences: { [sequenceId: string]: unknown }; ["main_sequence_id"]: string };
    };
    console.log({ prevPerfDocument });

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
