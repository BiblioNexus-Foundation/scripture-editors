import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { MarkNode } from "@lexical/mark";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { ImmutableNoteCallerNode } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import scriptureUsjNodes from "shared/nodes/scripture/usj";
import { Usj } from "shared/converters/usj/usj.model";
import { EditorState, LexicalEditor } from "lexical";
import editorUsjAdaptor from "../adaptors/editor-usj.adaptor";
import usjEditorAdaptor from "../adaptors/usj-editor.adaptor";
import UpdateStatePlugin from "shared-react/plugins/UpdateStatePlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import editorTheme from "../themes/editor-theme";
import NoteNodePlugin from "shared-react/plugins/NoteNodePlugin";
import { ViewOptions } from "../adaptors/view-options.utils";
import { UsjNodeOptions } from "shared-react/nodes/scripture/usj/usj-node-options.model";
import LoadingSpinner from "./LoadingSpinner";
import useDeferredState from "../hooks/use-deferred-state.hook";
import ContextMenuPlugin from "./ContextMenuPlugin";
import ClipboardPlugin from "./ClipboardPlugin";
import { Toolbar } from "./Toolbar";

/** Forward reference for the editor. */
export type EditorRef = {
  /** Method to focus the editor. */
  focus(): void;
  /** Method to set the USJ Scripture data. */
  setUsj(usj: Usj): void;
};

/** Options to configure the editor. */
export type EditorOptions = {
  /** Is the editor readonly or editable. */
  isReadonly?: boolean;
  /** Is the editor enabled for spell checking. */
  hasSpellCheck?: boolean;
  /** View options. */
  view?: ViewOptions;
  /** Options for each editor node:
   * @param nodes[].noteCallers - Possible note callers to use when caller is '+' for
   *   ImmutableNoteCallerNode.
   * @param nodes[].onClick - Click handler method for ImmutableNoteCallerNode.
   */
  nodes?: UsjNodeOptions;
};

type EditorProps = {
  /** Scripture data in USJ form */
  usjInput?: Usj;
  onChange?: (usj: Usj) => void;
  viewOptions?: ViewOptions;
  nodeOptions?: UsjNodeOptions;
};

const Editor = forwardRef(function Editor(
  { usjInput, onChange, viewOptions, nodeOptions }: EditorProps,
  ref: React.ForwardedRef<EditorRef>,
): JSX.Element {
  const editorRef = useRef<LexicalEditor>(null);
  const [usj, setUsj] = useState(usjInput);
  const [loadedUsj, , setEditedUsj] = useDeferredState(usj);

  const initialConfig = {
    namespace: "ScribeEditor",
    editable: true,
    editorState: undefined,
    theme: editorTheme,
    onError(error: Error) {
      throw error;
    },
    nodes: [MarkNode, ImmutableNoteCallerNode, ...scriptureUsjNodes],
  };

  useImperativeHandle(ref, () => ({
    focus() {
      editorRef.current?.focus();
    },
    setUsj(usj: Usj) {
      setUsj(usj);
    },
  }));

  const handleChange = useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      const usj = editorUsjAdaptor.deserializeEditorState(editorState);
      const editorParsed = JSON.stringify(editor.getEditorState());
      console.log({ editorParsed });
      if (usj) {
        onChange?.(usj);
        setEditedUsj(usj);
      }
    },
    [onChange, setEditedUsj],
  );

  return (
    <>
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <RichTextPlugin
          contentEditable={<ContentEditable className="outline-none" />}
          placeholder={<LoadingSpinner />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <UpdateStatePlugin
          scripture={loadedUsj}
          nodeOptions={nodeOptions}
          editorAdaptor={usjEditorAdaptor}
          viewOptions={viewOptions}
          // logger={logger}
        />
        <OnChangePlugin onChange={handleChange} ignoreSelectionChange={true} />
        <NoteNodePlugin />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <ContextMenuPlugin />
        <ClipboardPlugin />
      </LexicalComposer>
    </>
  );
});

export default Editor;
