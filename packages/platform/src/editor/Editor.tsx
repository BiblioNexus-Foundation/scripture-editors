import { MarkNode } from "@lexical/mark";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { EditorState, LexicalEditor } from "lexical";
import React, { JSX, forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { ScriptureReference } from "papi-components";
import { Usj } from "shared/converters/usj/usj.model";
import scriptureUsjNodes from "shared/nodes/scripture/usj";
import { ImmutableNoteCallerNode } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import { UsjNodeOptions } from "shared-react/nodes/scripture/usj/usj-node-options.model";
import NoteNodePlugin from "shared-react/plugins/NoteNodePlugin";
import { LoggerBasic } from "shared-react/plugins/logger-basic.model";
import UpdateStatePlugin from "shared-react/plugins/UpdateStatePlugin";
import editorUsjAdaptor from "./adaptors/editor-usj.adaptor";
import usjEditorAdaptor from "./adaptors/usj-editor.adaptor";
import { ViewOptions } from "./adaptors/view-options.utils";
import editorTheme from "./editor-theme";
import ScriptureReferencePlugin from "./ScriptureReferencePlugin";
import ToolbarPlugin from "./toolbar/ToolbarPlugin";
import useDeferredState from "./use-deferred-state.hook";

export type EditorRef = {
  focus(): void;
  setUsj(usj: Usj): void;
};

export type EditorOptions = {
  /** Is the editor readonly or editable */
  isReadonly?: boolean;
  /** Is the editor enabled for spell checking */
  hasSpellCheck?: boolean;
  /** View options */
  view?: ViewOptions;
  /** Options for each node */
  nodes?: UsjNodeOptions;
};

type EditorProps<TLogger extends LoggerBasic> = {
  /** Initial Scripture data in USJ form */
  defaultUsj?: Usj;
  /** Scripture reference */
  scrRef?: ScriptureReference;
  /** Set Scripture reference callback function */
  setScrRef?: (scrRef: ScriptureReference) => void;
  /** Editor options */
  options?: EditorOptions;
  /** Callback function when USJ Scripture data has changed */
  onChange?: (usj: Usj) => void;
  /** Logger instance */
  logger?: TLogger;
};

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

const editorConfig: Mutable<InitialConfigType> = {
  namespace: "platformEditor",
  theme: editorTheme,
  editable: true,
  editorState: undefined,
  // Handling of errors during update
  onError(error) {
    throw error;
  },
  nodes: [MarkNode, ImmutableNoteCallerNode, ...scriptureUsjNodes],
};

function Placeholder(): JSX.Element {
  return <div className="editor-placeholder">Enter some Scripture...</div>;
}

/**
 * Scripture Editor for USJ. Created for use in Platform.Bible.
 * @see https://github.com/usfm-bible/tcdocs/blob/usj/grammar/usj.js
 *
 * @param props.defaultUsj - Default USJ Scripture data.
 * @param props.ref - Forward reference for the editor.
 * @param props.ref.focus - Method to focus the editor.
 * @param props.ref.setUsj - Method to set the USJ Scripture data.
 * @param props.scrRef - Scripture reference that controls the cursor in the Scripture.
 * @param props.setScrRef - Scripture reference set callback function when the reference changes in
 *   the editor as the cursor moves.
 * @param props.options.isReadonly - Is the editor readonly or editable (default).
 * @param props.options.hasSpellCheck - Is the editor enabled for spell checking (default `true`).
 * @param props.options.view - View options to select different view modes.
 * @param props.options.nodes - Options for each node.
 * @param props.options.nodes[].noteCallers - Possible note callers to use when caller is '+' for
 *   NoteNode.
 * @param props.options.nodes[].onClick - Click handler for NoteCallerNode.
 * @param props.onChange - Callback function when USJ Scripture data has changed.
 * @param props.logger - Logger instance.
 * @returns the editor element.
 */
const Editor = forwardRef(function Editor<TLogger extends LoggerBasic>(
  { defaultUsj, scrRef, setScrRef, options, onChange, logger }: EditorProps<TLogger>,
  ref: React.ForwardedRef<EditorRef>,
): JSX.Element {
  const editorRef = useRef<LexicalEditor>(null);
  const [usj, setUsj] = useState(defaultUsj);
  const [loadedUsj, , setEditedUsj] = useDeferredState(usj);
  editorConfig.editable = !options?.isReadonly;
  editorConfig.editorState = (editor: LexicalEditor) => {
    editor.parseEditorState(usjEditorAdaptor.serializeEditorState(defaultUsj, options?.view));
  };
  editorUsjAdaptor.initialize(logger);

  useImperativeHandle(ref, () => ({
    focus() {
      editorRef.current?.focus();
    },
    setUsj(usj: Usj) {
      setUsj(usj);
    },
  }));

  const handleChange = useCallback(
    (editorState: EditorState) => {
      const usj = editorUsjAdaptor.deserializeEditorState(editorState);
      if (usj) {
        setEditedUsj(usj);
        onChange?.(usj);
      }
    },
    [onChange, setEditedUsj],
  );

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="editor-input" spellCheck={options?.hasSpellCheck} />
            }
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          {scrRef && setScrRef && (
            <ScriptureReferencePlugin
              scrRef={scrRef}
              setScrRef={setScrRef}
              viewOptions={options?.view}
            />
          )}
          <EditorRefPlugin editorRef={editorRef} />
          <UpdateStatePlugin
            scripture={loadedUsj}
            nodeOptions={options?.nodes}
            editorAdaptor={usjEditorAdaptor}
            viewOptions={options?.view}
            logger={logger}
          />
          <NoteNodePlugin />
          <OnChangePlugin onChange={handleChange} ignoreSelectionChange={true} />
        </div>
      </div>
    </LexicalComposer>
  );
});

export default Editor;
