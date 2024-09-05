import { Usj } from "@biblionexus-foundation/scripture-utilities";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { EditorState } from "lexical";
import { useCallback, useEffect } from "react";
import scriptureUsjNodes from "shared/nodes/scripture/usj";
import { ImmutableNoteCallerNode } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import useDefaultNodeOptions from "shared-react/nodes/scripture/usj/use-default-node-options.hook";
import { UsjNodeOptions } from "shared-react/nodes/scripture/usj/usj-node-options.model";
import NoteNodePlugin from "shared-react/plugins/NoteNodePlugin";
import UpdateStatePlugin from "shared-react/plugins/UpdateStatePlugin";
import editorUsjAdaptor from "../adaptors/editor-usj.adaptor";
import usjNoteEditorAdapter from "../adaptors/note-usj-editor.adaptor";
import { ViewOptions } from "../adaptors/view-options.utils";
import editorTheme from "../themes/editor-theme";

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
  nodeOptions = {},
  scrollId,
}: NoteEditorProps) => {
  useDefaultNodeOptions(nodeOptions);

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
    [onChange],
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
        <NoteNodePlugin nodeOptions={nodeOptions} />
        <HistoryPlugin />
        <AutoFocusPlugin />
        {/* <TreeViewPlugin /> */}
      </LexicalComposer>
    </>
  );
};
