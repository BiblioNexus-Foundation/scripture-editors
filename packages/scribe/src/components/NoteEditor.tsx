import { useCallback, useEffect } from "react";
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
import UpdateStatePlugin from "shared-react/plugins/UpdateStatePlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import editorTheme from "../themes/editor-theme";
import NoteNodePlugin from "shared-react/plugins/NoteNodePlugin";
import { ViewOptions } from "../adaptors/view-options.utils";
import { UsjNodeOptions } from "shared-react/nodes/scripture/usj/usj-node-options.model";
import usjNoteEditorAdapter from "../adaptors/note-usj-editor.adaptor";

type NoteEditorProps = {
  /** Scripture data in USJ form */
  usj?: Usj;
  onChange?: (usj: Usj) => void;
  viewOptions?: ViewOptions;
  nodeOptions?: UsjNodeOptions;
  scrollId?: string;
};

export const NoteEditor = ({
  usj,
  onChange,
  viewOptions,
  nodeOptions,
  scrollId,
}: NoteEditorProps) => {
  const initialConfig = {
    namespace: "ScribeNoteEditor",
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
      }
    },
    [onChange]
  );
  useEffect(() => {
    const noteEditor = document.getElementById("noteEditor");
    if (scrollId && noteEditor) {
      const element = noteEditor.querySelector(`[data-caller-id="${scrollId}"]`);
      if (element) {
        console.log("scrolling", element);
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [scrollId]);

  return (
    <>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable className="outline-none" />}
          placeholder={<div>Enter some text...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <UpdateStatePlugin
          scripture={usj}
          nodeOptions={nodeOptions}
          editorAdaptor={usjNoteEditorAdapter}
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
