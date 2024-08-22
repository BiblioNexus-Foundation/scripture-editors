import { useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { MarkerContent, Usj } from "@biblionexus-foundation/scripture-utilities";
import { EditorState } from "lexical";
import UsjNoteEditorAdapter from "../adaptors/note-usj-editor.adaptor";
import { ViewOptions } from "../adaptors/view-options.utils";
import { UsjNodeOptions } from "shared-react/nodes/scripture/usj/usj-node-options.model";
import editorUsjAdaptor from "../adaptors/editor-usj.adaptor";
import scriptureUsjNodes from "shared/nodes/scripture/usj";
import UpdateStatePlugin from "shared-react/plugins/UpdateStatePlugin";
import NoteNodePlugin from "shared-react/plugins/NoteNodePlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ImmutableNoteCallerNode } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import { MarkNode } from "@lexical/mark";
import editorTheme from "../themes/editor-theme";
import useDefaultNodeOptions from "shared-react/nodes/scripture/usj/use-default-node-options.hook";

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
  const [noteUsj, setNoteUsj] = useState<Usj | null>(null);

  const initialConfig = {
    namespace: "ScribeNoteEditor",
    editable: true,
    editorState: null,
    theme: editorTheme,
    onError(error: Error) {
      throw error;
    },
    nodes: [MarkNode, ImmutableNoteCallerNode, ...scriptureUsjNodes],
  };

  const handleChange = (editorState: EditorState) => {
    if (usj && onChange) {
      const updatedNoteUsj = editorUsjAdaptor.deserializeEditorState(editorState);
      if (updatedNoteUsj) {
        // Merge the updated note nodes back into the original USJ
        const updatedUsj = mergeUpdatedNotes(usj, updatedNoteUsj);
        onChange(updatedUsj);
      }
    }
  };

  useEffect(() => {
    if (usj) {
      const noteNodes = extractNoteNodes(usj.content);
      const noteUsj: Usj = { ...usj, content: noteNodes };
      setNoteUsj(noteUsj);
    }
  }, [usj, viewOptions]);

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
          scripture={noteUsj}
          nodeOptions={nodeOptions}
          editorAdaptor={UsjNoteEditorAdapter}
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

export function extractNoteNodes(usjContent: MarkerContent[]): MarkerContent[] {
  const noteNodes: MarkerContent[] = [];
  console.log({ usjContent });
  function traverse(content: MarkerContent[]) {
    content.forEach((item) => {
      if (typeof item === "object" && item.type === "note") {
        noteNodes.push(item);
      } else if (typeof item === "object" && item.content) {
        traverse(item.content);
      }
    });
  }

  traverse(usjContent);
  return noteNodes;
}

export function mergeUpdatedNotes(originalUsj: Usj, updatedNoteUsj: Usj): Usj {
  const updatedUsj = { ...originalUsj };
  const updatedNotes = updatedNoteUsj.content;

  function updateNotes(content: MarkerContent[]): MarkerContent[] {
    let updatedNoteIndex = 0;

    return content.map((item): MarkerContent => {
      if (typeof item === "object") {
        if (item.type === "note") {
          if (updatedNoteIndex < updatedNotes.length) {
            const updatedNote = updatedNotes[updatedNoteIndex];
            updatedNoteIndex++;
            if (typeof updatedNote === "object" && updatedNote.type === "note") {
              return updatedNote;
            }
          }
          return item;
        } else if (item.content) {
          return { ...item, content: updateNotes(item.content) };
        }
      }
      return item;
    });
  }

  updatedUsj.content = updateNotes(originalUsj.content);
  return updatedUsj;
}
