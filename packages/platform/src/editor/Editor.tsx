import { ScriptureReference } from "papi-components";
import { JSX, useCallback } from "react";
import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { EditorState } from "lexical";
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
import editorTheme from "./themes/editor-theme";
import ScriptureReferencePlugin from "./plugins/ScriptureReferencePlugin";
import ToolbarPlugin from "./plugins/toolbar/ToolbarPlugin";

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

type EditorProps<TLogger extends LoggerBasic> = {
  /** Scripture data in USJ form */
  usj?: Usj;
  /** View options */
  viewOptions?: ViewOptions;
  /** Scripture reference */
  scrRef?: ScriptureReference;
  /** Set Scripture reference callback function */
  setScrRef?: (scrRef: ScriptureReference) => void;
  /** Options for each node */
  nodeOptions?: UsjNodeOptions;
  /** Is the editor readonly or editable */
  isReadonly?: boolean;
  /** Callback function when USJ Scripture data has changed */
  onChange?: (usj: Usj) => void;
  /** Logger instance */
  logger?: TLogger;
};

const editorConfig: Mutable<InitialConfigType> = {
  namespace: "platformEditor",
  theme: editorTheme,
  editable: true,
  // Avoid the onChange handler being triggered initially.
  editorState: null,
  // Handling of errors during update
  onError(error) {
    throw error;
  },
  // Any custom nodes go here
  nodes: [ImmutableNoteCallerNode, ...scriptureUsjNodes],
};

function Placeholder(): JSX.Element {
  return <div className="editor-placeholder">Enter some Scripture...</div>;
}

/**
 * Scripture Editor for USJ. Created for use in Platform.Bible.
 * @see https://github.com/usfm-bible/tcdocs/blob/usj/grammar/usj.js
 *
 * @param props.usj - USJ Scripture data.
 * @param props.viewOptions - View options to select different view modes.
 * @param props.scrRef - Scripture reference that controls the cursor in the Scripture.
 * @param props.setScrRef - Scripture reference set callback function when the reference changes in
 *   the editor as the cursor moves.
 * @param props.nodeOptions - Options for each node.
 * @param props.nodeOptions[].noteCallers - Possible note callers to use when caller is
 *   '+' for NoteNode.
 * @param props.nodeOptions[].onClick - Click handler for NoteCallerNode.
 * @param props.isReadonly - Is the editor readonly or editable (default).
 * @param props.onChange - Callback function when USJ Scripture data has changed.
 * @param props.logger - Logger instance.
 * @returns the editor element.
 */
export default function Editor<TLogger extends LoggerBasic>({
  usj,
  viewOptions,
  scrRef,
  setScrRef,
  nodeOptions,
  isReadonly,
  onChange,
  logger,
}: EditorProps<TLogger>): JSX.Element {
  editorConfig.editable = !isReadonly;
  editorUsjAdaptor.initialize(logger);
  const handleChange = useCallback(
    (editorState: EditorState) => {
      const start = performance.now();
      const usj = editorUsjAdaptor.deserializeEditorState(editorState);
      if (usj && onChange) onChange(usj);
      console.log(`onChange() took ${Math.round(performance.now() - start)} ms`);
    },
    [onChange],
  );

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          {scrRef && setScrRef && (
            <ScriptureReferencePlugin
              scrRef={scrRef}
              setScrRef={setScrRef}
              viewOptions={viewOptions}
            />
          )}
          <UpdateStatePlugin
            scripture={usj}
            nodeOptions={nodeOptions}
            editorAdaptor={usjEditorAdaptor}
            viewOptions={viewOptions}
            logger={logger}
          />
          <NoteNodePlugin />
          <OnChangePlugin onChange={handleChange} ignoreSelectionChange={true} />
        </div>
      </div>
    </LexicalComposer>
  );
}
