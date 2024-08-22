import { Usj } from "@biblionexus-foundation/scripture-utilities";
import { MarkNode } from "@lexical/mark";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { EditorState, LexicalEditor } from "lexical";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import scriptureUsjNodes from "shared/nodes/scripture/usj";
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
import useDeferredState from "../hooks/use-deferred-state.hook";
import { ScriptureReferencePlugin, ScriptureReference } from "../plugins/ScriptureReferencePlugin";
import editorTheme from "../themes/editor-theme";
import LoadingSpinner from "./LoadingSpinner";
import ToolbarPlugin from "../plugins/ToolbarPlugin";
import TextDirectionPlugin from "shared-react/plugins/TextDirectionPlugin";
import { TextDirection } from "shared-react/plugins/text-direction.model";
import { blackListedChangeTags } from "shared/nodes/scripture/usj/node.utils";

/** Forward reference for the editor. */
export type EditorRef = {
  /** Method to focus the editor. */
  focus(): void;
  /** Method to set the USJ Scripture data. */
  setUsj(usj: Usj): void;
  getScrollPosition: () => number;
  setScrollPosition: (position: number) => void;
  addEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void;
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
  textDirection: TextDirection;
  onScroll?: (position: number) => void;
  syncScrollPosition?: number;
  IsRefEditor?: boolean;
  font?: string;
  fontSize?: number;
};

const Editor = forwardRef(function Editor(
  {
    usjInput,
    onChange,
    viewOptions,
    nodeOptions = {},
    scrRef,
    setScrRef,
    textDirection,
    onScroll,
    syncScrollPosition,
    IsRefEditor = false,
    font,
    fontSize,
  }: EditorProps,
  ref: React.ForwardedRef<EditorRef>,
): JSX.Element {
  const editorRef = useRef<LexicalEditor>(null);
  const [usj, setUsj] = useState(usjInput);
  const [loadedUsj, , setEditedUsj] = useDeferredState(usj);
  const contentEditableRef = useRef<HTMLDivElement>(null);

  useDefaultNodeOptions(nodeOptions);

  useEffect(() => {
    if (usjInput) {
      setUsj(usjInput);
    }
  }, [usjInput]);

  const initialConfig = {
    namespace: "ScribeEditor",
    editable: true,
    editorState: undefined,
    theme: editorTheme,
    onError(error: Error) {
      throw error;
    },
    nodes: [MarkNode, ImmutableNoteCallerNode, ImmutableVerseNode, ...scriptureUsjNodes],
  };

  useImperativeHandle(ref, () => ({
    focus() {
      editorRef.current?.focus();
    },
    setUsj(usj: Usj) {
      setUsj(usj);
    },
    getScrollPosition: () => {
      return contentEditableRef.current?.scrollTop || 0;
    },
    setScrollPosition: (position: number) => {
      if (contentEditableRef.current) {
        contentEditableRef.current.scrollTop = position;
      }
    },
  }));

  useEffect(() => {
    if (syncScrollPosition !== undefined) {
      if (contentEditableRef.current) {
        contentEditableRef.current.scrollTop = syncScrollPosition;
      }
    }
  }, [syncScrollPosition]);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (contentEditableRef.current) {
  //       const scrollTop = contentEditableRef.current.scrollTop;
  //       console.log("Scroll Top:", scrollTop);
  //     }
  //   };

  //   if (contentEditableRef.current) {
  //     contentEditableRef.current.addEventListener("scroll", handleScroll);
  //   }

  //   return () => {
  //     if (contentEditableRef.current) {
  //       contentEditableRef.current.removeEventListener("scroll", handleScroll);
  //     }
  //   };
  // }, []);

  const handleChange = useCallback(
    (editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => {
      if (blackListedChangeTags.some((tag) => tags.has(tag))) return;
      const usj = editorUsjAdaptor.deserializeEditorState(editorState);
      const serializedState = editor.parseEditorState(usjEditorAdaptor.serializeEditorState(usj));
      console.log({ serializedState });
      if (usj) {
        onChange?.(usj);
        setEditedUsj(usj);
      }
    },
    [onChange, setEditedUsj],
  );

  const handleScroll = useCallback(() => {
    if (contentEditableRef.current) {
      const scrollTop = contentEditableRef.current.scrollTop;
      if (onScroll) {
        onScroll(scrollTop);
      }
    }
  }, [onScroll]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <LexicalComposer initialConfig={initialConfig}>
        {!IsRefEditor && <ToolbarPlugin font={font} fontSize={fontSize} />}
        <div
          className="max-h-[calc(100vh-40px)] flex-grow overflow-y-auto"
          onScroll={handleScroll}
          ref={contentEditableRef}
        >
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={`min-h-full p-4 outline-none ${getViewClassList(viewOptions).join(" ")}`}
              />
            }
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
          <NoteNodePlugin nodeOptions={nodeOptions} />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ContextMenuPlugin />
          <ClipboardPlugin />
          <ScriptureReferencePlugin
            viewOptions={viewOptions}
            scrRef={scrRef}
            setScrRef={setScrRef}
          />
          <TextDirectionPlugin textDirection={textDirection} />
        </div>
      </LexicalComposer>
    </div>
  );
});

export default Editor;
