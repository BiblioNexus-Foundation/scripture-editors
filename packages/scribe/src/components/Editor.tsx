import { Usj } from "@biblionexus-foundation/scripture-utilities";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { EditorState, LexicalEditor } from "lexical";
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import scriptureUsjNodes from "shared/nodes/scripture/usj";
import { ScriptureReference } from "shared/utils/get-marker-action.model";
import { ImmutableNoteCallerNode } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import { ImmutableVerseNode } from "shared-react/nodes/scripture/usj/ImmutableVerseNode";
import useDefaultNodeOptions from "shared-react/nodes/scripture/usj/use-default-node-options.hook";
import { UsjNodeOptions } from "shared-react/nodes/scripture/usj/usj-node-options.model";
import ClipboardPlugin from "shared-react/plugins/ClipboardPlugin";
import ContextMenuPlugin from "shared-react/plugins/ContextMenuPlugin";
import NoteNodePlugin from "shared-react/plugins/NoteNodePlugin";
import UpdateStatePlugin from "shared-react/plugins/UpdateStatePlugin";
import editorUsjAdaptor from "../adaptors/editor-usj.adaptor";
import { getViewClassList, ViewOptions } from "../adaptors/view-options.utils";
import usjEditorAdaptor from "../adaptors/usj-editor.adaptor";
import UsjNodesMenuPlugin from "../plugins/UsjNodesMenuPlugin";
import useDeferredState from "../hooks/use-deferred-state.hook";
import { ScriptureReferencePlugin } from "../plugins/ScriptureReferencePlugin";
import editorTheme from "../themes/editor-theme";
import LoadingSpinner from "./LoadingSpinner";
import { blackListedChangeTags } from "shared/nodes/scripture/usj/node-constants";
import { deepEqual } from "fast-equals";
import { getUsjMarkerAction } from "../adaptors/usj-marker-action.utils";
import KeyboardShortcutPlugin from "../plugins/KeyboardShortcutPlugin";
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
  scrRef: ScriptureReference;
  setScrRef: React.Dispatch<React.SetStateAction<ScriptureReference>>;
};
// const NODE_MENU_TRIGGER = "//";

const Editor = forwardRef(function Editor(
  { usjInput, onChange, viewOptions, nodeOptions = {}, scrRef, setScrRef }: EditorProps,
  ref: React.ForwardedRef<EditorRef>,
): JSX.Element {
  const editorRef = useRef<LexicalEditor>(null);
  const editedUsjRef = useRef<Usj>();
  const [usj, setUsj] = useState(usjInput);
  const [loadedUsj, , setEditedUsj] = useDeferredState(usj);
  useDefaultNodeOptions(nodeOptions);
  const autoNumbering = false;
  const initialConfig = {
    namespace: "ScribeEditor",
    editable: true,
    editorState: undefined,
    theme: editorTheme,
    onError(error: Error) {
      throw error;
    },
    nodes: [ImmutableNoteCallerNode, ImmutableVerseNode, ...scriptureUsjNodes],
  };

  useImperativeHandle(ref, () => ({
    focus() {
      editorRef.current?.focus();
    },
    getUsj() {
      return editedUsjRef.current;
    },
    setUsj(editedUsj) {
      if (!deepEqual(editedUsjRef.current, editedUsj) && !deepEqual(usj, editedUsj)) {
        editedUsjRef.current = editedUsj;
        setUsj(editedUsj);
      }
    },
  }));

  const handleChange = useCallback(
    (editorState: EditorState, _editor: LexicalEditor, tags: Set<string>) => {
      if (blackListedChangeTags.some((tag) => tags.has(tag))) return;

      // const serializedState = editor.parseEditorState(usjEditorAdaptor.serializeEditorState(usj));
      // console.log({ serializedState });
      const newUsj = editorUsjAdaptor.deserializeEditorState(editorState);
      if (newUsj) {
        const isEdited = !deepEqual(editedUsjRef.current, newUsj);
        if (isEdited) editedUsjRef.current = newUsj;
        if (isEdited || !deepEqual(usj, newUsj)) onChange?.(newUsj);
      }
    },
    [onChange, setEditedUsj],
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <Toolbar scrRef={scrRef} autoNumbering={autoNumbering} />
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className={`editor-input outline-none ${getViewClassList(viewOptions).join(" ")}`}
          />
        }
        placeholder={<LoadingSpinner />}
        ErrorBoundary={LexicalErrorBoundary}
      />

      {scrRef && (
        <UsjNodesMenuPlugin
          trigger={"\\"}
          scrRef={scrRef}
          getMarkerAction={(marker, markerData) =>
            getUsjMarkerAction(marker, markerData, viewOptions)
          }
          autoNumbering={autoNumbering}
        />
      )}
      <UpdateStatePlugin
        scripture={loadedUsj}
        nodeOptions={nodeOptions}
        editorAdaptor={usjEditorAdaptor}
        viewOptions={viewOptions}
      />
      <OnChangePlugin onChange={handleChange} ignoreSelectionChange={true} />
      <NoteNodePlugin nodeOptions={nodeOptions} />
      <HistoryPlugin />
      <AutoFocusPlugin />
      <ContextMenuPlugin />
      <KeyboardShortcutPlugin />
      <ClipboardPlugin />
      <ScriptureReferencePlugin scrRef={scrRef} setScrRef={setScrRef} />
    </LexicalComposer>
  );
});

export default Editor;
