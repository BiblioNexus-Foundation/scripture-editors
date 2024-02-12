import { ScriptureReference } from "papi-components";
import React, { JSX } from "react";
import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { Usj } from "shared/converters/usj/usj.model";
import scriptureUsjNodes from "shared/nodes/scripture/usj";
import { ImmutableNoteCallerNode } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import NoteNodePlugin from "shared-react/plugins/NoteNodePlugin";
import { LoggerBasic } from "shared-react/plugins/logger-basic.model";
import UpdateStatePlugin from "shared-react/plugins/UpdateStatePlugin";
import usjEditorAdaptor, { UsjNodeOptions } from "./adaptors/usj-editor.adaptor";
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
  /** Scripture reference set function */
  setScrRef?: React.Dispatch<React.SetStateAction<ScriptureReference>>;
  /** Options for each node */
  nodeOptions?: UsjNodeOptions;
  /** Is the editor readonly or editable */
  isReadonly?: boolean;
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
 * @param props.setScrRef - Scripture reference set function when the reference changes in the
 *   editor as the cursor moves.
 * @param props.nodeOptions - Options for each node.
 * @param props.nodeOptions[].noteCallers - Possible note callers to use when caller is
 *   '+' for NoteNode.
 * @param props.nodeOptions[].onClick - Click handler for NoteCallerNode.
 * @param props.isReadonly - Is the editor readonly or editable (default).
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
  logger,
}: EditorProps<TLogger>): JSX.Element {
  editorConfig.editable = !isReadonly;

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
        </div>
      </div>
    </LexicalComposer>
  );
}
