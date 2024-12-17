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
import { ScriptureReference } from "shared/adaptors/scr-ref.model";
import { TypedMarkNode } from "shared/nodes/features/TypedMarkNode";
import scriptureUsjNodes from "shared/nodes/scripture/usj";
import {
  blackListedChangeTags,
  SELECTION_CHANGE_TAG,
} from "shared/nodes/scripture/usj/node-constants";
import AnnotationPlugin, { AnnotationRef } from "shared-react/annotation/AnnotationPlugin";
import { AnnotationRange, SelectionRange } from "shared-react/annotation/selection.model";
import {
  $getRangeFromEditor,
  $getRangeFromSelection,
} from "shared-react/annotation/selection.utils";
import { ImmutableNoteCallerNode } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import { ImmutableVerseNode } from "shared-react/nodes/scripture/usj/ImmutableVerseNode";
import useDefaultNodeOptions from "shared-react/nodes/scripture/usj/use-default-node-options.hook";
import { UsjNodeOptions } from "shared-react/nodes/scripture/usj/usj-node-options.model";
import HistoryPlugin from "shared-react/plugins/HistoryPlugin";
import ClipboardPlugin from "shared-react/plugins/ClipboardPlugin";
import CommandMenuPlugin from "shared-react/plugins/CommandMenuPlugin";
import ContextMenuPlugin from "shared-react/plugins/ContextMenuPlugin";
import EditablePlugin from "shared-react/plugins/EditablePlugin";
import { LoggerBasic } from "shared/adaptors/logger-basic.model";
import NoteNodePlugin from "shared-react/plugins/NoteNodePlugin";
import OnSelectionChangePlugin from "shared-react/plugins/OnSelectionChangePlugin";
import TextDirectionPlugin from "shared-react/plugins/TextDirectionPlugin";
import { TextDirection } from "shared-react/plugins/text-direction.model";
import UpdateStatePlugin from "shared-react/plugins/UpdateStatePlugin";
import editorUsjAdaptor from "./adaptors/editor-usj.adaptor";
import usjEditorAdaptor from "./adaptors/usj-editor.adaptor";
import { getViewClassList, getViewOptions, ViewOptions } from "./adaptors/view-options.utils";
import editorTheme from "./editor.theme";
import ScriptureReferencePlugin from "./ScriptureReferencePlugin";
import ToolbarPlugin from "./toolbar/ToolbarPlugin";
import UsjNodesMenuPlugin from "shared-react/plugins/UsjNodesMenuPlugin";
import { Canon } from "@sillsdev/scripture";

/** Forward reference for the editor. */
export type EditorRef = {
  /** Focus the editor. */
  focus(): void;
  /** Get USJ Scripture data. */
  getUsj(): Usj | undefined;
  /** Set the USJ Scripture data. */
  setUsj(usj: Usj): void;
  /**
   * Get the selection location or range.
   * @returns the selection location or range, or `undefined` if there is no selection. The
   *   json-path in the selection assumes no comment Milestone nodes are present in the USJ.
   */
  getSelection(): SelectionRange | undefined;
  /**
   * Set the selection location or range.
   * @param selection - A selection location or range. The json-path in the selection assumes no
   *   comment Milestone nodes are present in the USJ.
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
  /** Ref to the end of the toolbar - INTERNAL USE ONLY to dynamically add controls in the toolbar. */
  toolbarEndRef: React.RefObject<HTMLElement> | null;
};

/** Options to configure the editor. */
export type EditorOptions = {
  /** Is the editor readonly or editable. */
  isReadonly?: boolean;
  /** Is the editor enabled for spell checking. */
  hasSpellCheck?: boolean;
  /** Text direction: "ltr" | "rtl" | "auto". */
  textDirection?: TextDirection;
  /**
   * View options - EXPERIMENTAL. Defaults to the formatted view mode which is currently the only
   * functional option.
   */
  view?: ViewOptions;
  /** Options for each editor node:
   * @param nodes.ImmutableNoteCallerNode.noteCallers - Possible note callers to use when caller is
   *   '+'. Defaults to Latin lower case letters.
   * @param nodes.ImmutableNoteCallerNode.onClick - Click handler method.
   */
  nodes?: UsjNodeOptions;
};

export type EditorProps<TLogger extends LoggerBasic> = {
  /** Initial Scripture data in USJ format. */
  defaultUsj?: Usj;
  /** Scripture reference that controls the general cursor location of the Scripture. */
  scrRef?: ScriptureReference;
  /** Callback function when the Scripture reference has changed. */
  onScrRefChange?: (scrRef: ScriptureReference) => void;
  /** Callback function when the cursor selection changes. */
  onSelectionChange?: (selection: SelectionRange | undefined) => void;
  /** Callback function when USJ Scripture data has changed. */
  onUsjChange?: (usj: Usj) => void;
  /** Options to configure the editor. */
  options?: EditorOptions;
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
  nodes: [TypedMarkNode, ImmutableNoteCallerNode, ImmutableVerseNode, ...scriptureUsjNodes],
};

const defaultViewOptions = getViewOptions(undefined);

function Placeholder(): JSX.Element {
  return <div className="editor-placeholder">Enter some Scripture...</div>;
}

/**
 * Scripture Editor for USJ. Created for use in [Platform](https://platform.bible).
 * @see https://github.com/usfm-bible/tcdocs/blob/usj/grammar/usj.js
 *
 * @param props.ref - Forward reference for the editor.
 * @param props.defaultUsj - Default USJ Scripture data.
 * @param props.scrRef - Scripture reference that controls the cursor in the Scripture.
 * @param props.onScrRefChange - Scripture reference set callback function when the reference
 *   changes in the editor as the cursor moves.
 * @param props.onSelectionChange - Callback function when the cursor selection changes.
 * @param props.onUsjChange - Callback function when USJ Scripture data has changed.
 * @param props.options - Options to configure the editor.
 * @param props.logger - Logger instance.
 * @returns the editor element.
 */
const Editor = forwardRef(function Editor<TLogger extends LoggerBasic>(
  {
    defaultUsj,
    scrRef,
    onScrRefChange,
    onSelectionChange,
    onUsjChange,
    options,
    logger,
    children,
  }: PropsWithChildren<EditorProps<TLogger>>,
  ref: React.ForwardedRef<EditorRef>,
): JSX.Element {
  const editorRef = useRef<LexicalEditor | null>(null);
  const annotationRef = useRef<AnnotationRef | null>(null);
  const toolbarEndRef = useRef<HTMLDivElement>(null);
  const editedUsjRef = useRef(defaultUsj);
  const [usj, setUsj] = useState(defaultUsj);

  const localOnScrRefChange = (scrRef: ScriptureReference) => {
    console.log("localOnScrRefChange", scrRef);
    onScrRefChange?.(scrRef);
  };

  console.log("usj", usj);

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
    getUsj() {
      return editedUsjRef.current;
    },
    setUsj(incomingUsj) {
      if (!deepEqual(editedUsjRef.current, incomingUsj) && !deepEqual(usj, incomingUsj)) {
        editedUsjRef.current = incomingUsj;
        setUsj(incomingUsj);
      }
    },
    getSelection() {
      return editorRef.current?.read(() => $getRangeFromEditor());
    },
    setSelection(selection) {
      editorRef.current?.update(
        () => {
          const rangeSelection = $getRangeFromSelection(selection);
          if (rangeSelection !== undefined) $setSelection(rangeSelection);
        },
        { tag: SELECTION_CHANGE_TAG },
      );
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
    (editorState: EditorState, _editor: LexicalEditor, tags: Set<string>) => {
      if (blackListedChangeTags.some((tag) => tags.has(tag))) return;

      const newUsj = editorUsjAdaptor.deserializeEditorState(editorState);
      if (newUsj) {
        const isEdited = !deepEqual(editedUsjRef.current, newUsj);
        if (isEdited) editedUsjRef.current = newUsj;
        if (isEdited || !deepEqual(usj, newUsj)) onUsjChange?.(newUsj);
      }
    },
    [usj, onUsjChange],
  );

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <EditablePlugin isEditable={!isReadonly} />
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
          {scrRef && onScrRefChange && (
            <ScriptureReferencePlugin
              scrRef={scrRef}
              onScrRefChange={localOnScrRefChange}
              viewOptions={viewOptions}
            />
          )}
          <UsjNodesMenuPlugin
            trigger="\"
            scriptureReference={{
              book: Canon.bookNumberToId(scrRef?.bookNum ?? 0),
              chapter: scrRef?.chapterNum ?? 0,
              verse: scrRef?.verseNum ?? 0,
            }}
            contextMarker="p"
            editorAdaptor={usjEditorAdaptor}
          />
          <UpdateStatePlugin
            scripture={usj}
            nodeOptions={nodeOptions}
            editorAdaptor={usjEditorAdaptor}
            viewOptions={viewOptions}
            logger={logger}
          />
          <OnSelectionChangePlugin onChange={onSelectionChange} />
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
