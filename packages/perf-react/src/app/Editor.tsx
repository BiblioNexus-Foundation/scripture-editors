import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import ScriptureNodes from "shared/nodes";
import { OnChangePlugin } from "../lexical/plugins/OnChangePlugin";
import { useLexicalState } from "./useLexicalState";

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
  const lexicalState = useLexicalState();

  const initialConfig = {
    namespace: "ScriptureEditor",
    theme,
    editorState: lexicalState,
    onError,
    nodes: [...ScriptureNodes],
  };

  const onChange = ({ editor, listener }) => {
    console.log({ editor, listener });
  };

  return !lexicalState ? null : (
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
        <OnChangePlugin onChange={onChange} />
        <HistoryPlugin />
      </div>
    </LexicalComposer>
  );
}
