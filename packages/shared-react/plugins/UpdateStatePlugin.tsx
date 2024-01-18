import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CLEAR_HISTORY_COMMAND } from "lexical";
import { useEffect } from "react";
import { LoggerBasic } from "./logger-basic.model";
import { EditorAdaptor, NodeOptions } from "../adaptors/editor-adaptor.model";

/**
 * A plugin component that updates the state of the lexical editor when incoming Scripture changes.
 * @param props.scripture - Scripture data.
 * @param props.nodeOptions - Options for each node.
 * @param props.editorAdaptor - Editor adaptor.
 * @param props.viewMode - View Mode of the editor.
 * @param props.logger - Logger instance.
 * @returns null, i.e. no DOM elements.
 */
export default function UpdateStatePlugin<TLogger extends LoggerBasic>({
  scripture,
  nodeOptions,
  editorAdaptor,
  viewMode,
  logger,
}: {
  scripture?: unknown;
  nodeOptions?: NodeOptions;
  editorAdaptor: EditorAdaptor;
  viewMode?: string;
  logger?: TLogger;
}): null {
  const [editor] = useLexicalComposerContext();
  editorAdaptor.initialize?.(nodeOptions, logger);

  useEffect(() => {
    editorAdaptor.reset?.();
    const serializedEditorState = editorAdaptor.loadEditorState(scripture, viewMode);
    const editorState = editor.parseEditorState(serializedEditorState);
    // Execute after the current render cycle.
    setTimeout(() => {
      editor.setEditorState(editorState);
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
    }, 0);
  }, [editor, scripture, viewMode, logger, editorAdaptor]);

  return null;
}
