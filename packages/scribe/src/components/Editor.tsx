import { useCallback } from "react";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { ImmutableNoteCallerNode } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import scriptureUsjNodes from "shared/nodes/scripture/usj";
import { Usj } from "shared/converters/usj/usj.model";
import { EditorState } from "lexical";
import editorUsjAdaptor from "../adaptors/editor-usj.adaptor";
import usjEditorAdaptor from "../adaptors/usj-editor.adaptor";
import UpdateStatePlugin from "shared-react/plugins/UpdateStatePlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import editorTheme from "../themes/editor-theme";
import { Usj2Usfm } from "../hooks/usj2Usfm";
import NoteNodePlugin from "shared-react/plugins/NoteNodePlugin";
import { ViewOptions } from "../adaptors/view-options.utils";
import { UsjNodeOptions } from "shared-react/nodes/scripture/usj/usj-node-options.model";
import LoadingSpinner from "./LoadingSpinner";

type EditorProps = {
  /** Scripture data in USJ form */
  usj?: Usj;
  onChange?: (usj: Usj) => void;
  viewOptions?: ViewOptions;
  nodeOptions?: UsjNodeOptions;
};

export const Editor = ({ usj, onChange, viewOptions, nodeOptions }: EditorProps) => {
  const initialConfig = {
    namespace: "ScribeEditor",
    editable: true,
    editorState: null,
    theme: editorTheme,
    onError(error: Error) {
      throw error;
    },
    nodes: [ImmutableNoteCallerNode, ...scriptureUsjNodes],
  };

  const handleChange = useCallback(
    (editorState: EditorState) => {
      const usj = editorUsjAdaptor.deserializeEditorState(editorState);
      if (usj && onChange) {
        onChange(usj);
        Usj2Usfm({ usj });
      }
    },
    [onChange]
  );

  return (
    <>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable className="outline-none" />}
          placeholder={<LoadingSpinner />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <UpdateStatePlugin
          scripture={usj}
          nodeOptions={nodeOptions}
          editorAdaptor={usjEditorAdaptor}
          viewOptions={viewOptions}
          // logger={logger}
        />
        <OnChangePlugin onChange={handleChange} ignoreSelectionChange={true} />
        <NoteNodePlugin />
        <HistoryPlugin />
        <AutoFocusPlugin />
        {/* <TreeViewPlugin /> */}
      </LexicalComposer>
    </>
  );
};
