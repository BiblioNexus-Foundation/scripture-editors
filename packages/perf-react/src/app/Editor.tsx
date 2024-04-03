import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import scriptureNodes from "shared/nodes";
import { useLexicalPerfState } from "./useLexicalState";
import { HistoryPlugin } from "shared-react/plugins/History/HistoryPlugin";
import { useMemo } from "react";
import { updatePerfHistory } from "shared/plugins/PerfOperations/updatePerfHistory";
import { HistoryMergeListener } from "shared/plugins/History";

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

  const handlePerfHistory = useMemo(
    () => (perfDocument ? updatePerfHistory(perfDocument) : null),
    [perfDocument],
  );

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
        <HistoryPlugin onChange={handlePerfHistory as HistoryMergeListener} />
      </div>
    </LexicalComposer>
  );
}
