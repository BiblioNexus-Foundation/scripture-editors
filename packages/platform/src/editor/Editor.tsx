import { Usj } from "@biblionexus-foundation/scripture-utilities";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { $setSelection, EditorState, LexicalEditor } from "lexical";
import { deepEqual } from "fast-equals";
import React, {
  JSX,
  PropsWithChildren,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { ScriptureReference } from "platform-bible-utils";
import { TypedMarkNode } from "shared/nodes/features/TypedMarkNode";
import scriptureUsjNodes from "shared/nodes/scripture/usj";
import AnnotationPlugin, {
  $getRangeFromSelection,
  AnnotationRef,
} from "shared-react/annotation/AnnotationPlugin";
import { AnnotationRange, SelectionRange } from "shared-react/annotation/selection.model";
import { ImmutableNoteCallerNode } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import useDefaultNodeOptions from "shared-react/nodes/scripture/usj/use-default-node-options.hook";
import { UsjNodeOptions } from "shared-react/nodes/scripture/usj/usj-node-options.model";
import { HistoryPlugin } from "shared-react/plugins/HistoryPlugin";
import ClipboardPlugin from "shared-react/plugins/ClipboardPlugin";
import CommandMenuPlugin from "shared-react/plugins/CommandMenuPlugin";
import ContextMenuPlugin from "shared-react/plugins/ContextMenuPlugin";
import { LoggerBasic } from "shared-react/plugins/logger-basic.model";
import NoteNodePlugin from "shared-react/plugins/NoteNodePlugin";
import TextDirectionPlugin from "shared-react/plugins/TextDirectionPlugin";
import { TextDirection } from "shared-react/plugins/text-direction.model";
import UpdateStatePlugin from "shared-react/plugins/UpdateStatePlugin";
import editorUsjAdaptor from "./adaptors/editor-usj.adaptor";
import usjEditorAdaptor from "./adaptors/usj-editor.adaptor";
import { getViewClassList, getViewOptions, ViewOptions } from "./adaptors/view-options.utils";
import editorTheme from "./editor.theme";
import ScriptureReferencePlugin from "./ScriptureReferencePlugin";
import ToolbarPlugin from "./toolbar/ToolbarPlugin";
import useDeferredState from "./use-deferred-state.hook";

/** Forward reference for the editor. */
export type EditorRef = {
  /** Focus the editor. */
  focus(): void;
  /** Set the USJ Scripture data. */
  setUsj(usj: Usj): void;
  /**
   * Set the selection location or range.
   * @param selection - A selection location or range. The json-path in the selection location
   *   assumes no comment Milestone nodes are present in the USJ.
   */
  setSelection(selection: SelectionRange): void;
  /**
   * Add an ephemeral annotation.
   * @param selection - An annotation range containing the start and end location. The json-path in
   *   an annotation location assumes no comment Milestone nodes are present in the USJ.
   * @param type - Type of the annotation.
   * @param id - ID of the annotation.
   */
  addAnnotation(selection: AnnotationRange, type: string, id: string): void;
  /**
   * Remove an ephemeral annotation.
   * @param type - Type of the annotation.
   * @param id - ID of the annotation.
   */
  removeAnnotation(type: string, id: string): void;
  toolbarEndRef: React.RefObject<HTMLElement> | null;
};

/** Options to configure the editor. */
export type EditorOptions = {
  /** Is the editor readonly or editable. */
  isReadonly?: boolean;
  /** Is the editor enabled for spell checking. */
  hasSpellCheck?: boolean;
  /** Text direction. */
  textDirection?: TextDirection;
  /** View options. */
  view?: ViewOptions;
  /** Options for each editor node:
   * @param nodes.ImmutableNoteCallerNode.noteCallers - Possible note callers to use when caller is '+'.
   * @param nodes.ImmutableNoteCallerNode.onClick - Click handler method.
   */
  nodes?: UsjNodeOptions;
};

export type EditorProps<TLogger extends LoggerBasic> = {
  /** Initial Scripture data in USJ form. */
  defaultUsj?: Usj;
  /** Scripture reference. */
  scrRef?: ScriptureReference;
  /** Set Scripture reference callback function. */
  setScrRef?: (scrRef: ScriptureReference) => void;
  /** Options to configure the editor. */
  options?: EditorOptions;
  /** Callback function when USJ Scripture data has changed. */
  onChange?: (usj: Usj) => void;
  /** Logger instance. */
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
  nodes: [TypedMarkNode, ImmutableNoteCallerNode, ...scriptureUsjNodes],
};

const defaultViewOptions = getViewOptions(undefined);

function Placeholder(): JSX.Element {
  return <div className="editor-placeholder">Enter some Scripture...</div>;
}

/**
 * Scripture Editor for USJ. Created for use in Platform.Bible.
 * @see https://github.com/usfm-bible/tcdocs/blob/usj/grammar/usj.js
 *
 * @param props.ref - Forward reference for the editor.
 * @param props.defaultUsj - Default USJ Scripture data.
 * @param props.scrRef - Scripture reference that controls the cursor in the Scripture.
 * @param props.setScrRef - Scripture reference set callback function when the reference changes in
 *   the editor as the cursor moves.
 * @param props.options - Options to configure the editor.
 * @param props.onChange - Callback function when USJ Scripture data has changed.
 * @param props.logger - Logger instance.
 * @returns the editor element.
 */
const Editor = forwardRef(function Editor<TLogger extends LoggerBasic>(
  {
    defaultUsj,
    scrRef,
    setScrRef,
    options,
    onChange,
    logger,
    children,
  }: PropsWithChildren<EditorProps<TLogger>>,
  ref: React.ForwardedRef<EditorRef>,
): JSX.Element {
  const editorRef = useRef<LexicalEditor | null>(null);
  const annotationRef = useRef<AnnotationRef | null>(null);
  const toolbarEndRef = useRef<HTMLDivElement>(null);
  const [usj, setUsj] = useState(defaultUsj);
  const [loadedUsj, editedUsj, setEditedUsj] = useDeferredState(usj);
  const {
    isReadonly = false,
    hasSpellCheck = false,
    textDirection = "auto",
    view: viewOptions = defaultViewOptions,
    nodes: nodeOptions = {},
  } = options ?? {};
  useDefaultNodeOptions(nodeOptions);

  editorConfig.editable = !isReadonly;
  editorUsjAdaptor.initialize(logger);

  useImperativeHandle(ref, () => ({
    focus() {
      editorRef.current?.focus();
    },
    setUsj(usj) {
      setUsj(usj);
    },
    setSelection(selection) {
      editorRef.current?.update(() => {
        const rangeSelection = $getRangeFromSelection(selection);
        if (rangeSelection !== undefined) $setSelection(rangeSelection);
      });
    },
    addAnnotation(selection, type, id) {
      annotationRef.current?.addAnnotation(selection, type, id);
    },
    removeAnnotation(type, id) {
      annotationRef.current?.removeAnnotation(type, id);
    },
    get toolbarEndRef() {
      return toolbarEndRef;
    },
  }));

  const handleChange = useCallback(
    (editorState: EditorState) => {
      const newUsj = editorUsjAdaptor.deserializeEditorState(editorState);
      if (newUsj) {
        const isEdited = !deepEqual(editedUsj, newUsj);
        if (isEdited) setEditedUsj(newUsj);
        if (isEdited || !deepEqual(loadedUsj, newUsj)) onChange?.(newUsj);
      }
    },
    [editedUsj, loadedUsj, onChange, setEditedUsj],
  );

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        {!isReadonly && <ToolbarPlugin ref={toolbarEndRef} />}
        <div className="editor-inner">
          <EditorRefPlugin editorRef={editorRef} />
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={`editor-input ${getViewClassList(viewOptions).join(" ")}`}
                spellCheck={hasSpellCheck}
              />
            }
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
            scripture={loadedUsj}
            nodeOptions={nodeOptions}
            editorAdaptor={usjEditorAdaptor}
            viewOptions={viewOptions}
            logger={logger}
          />
          <OnChangePlugin
            onChange={handleChange}
            ignoreSelectionChange
            ignoreHistoryMergeTagChange
          />
          <AnnotationPlugin ref={annotationRef} logger={logger} />
          <ClipboardPlugin />
          <CommandMenuPlugin logger={logger} />
          <ContextMenuPlugin />
          <NoteNodePlugin nodeOptions={nodeOptions} logger={logger} />
          <TextDirectionPlugin textDirection={textDirection} />
          {children}
        </div>
      </div>
    </LexicalComposer>
  );
});

export default Editor;
