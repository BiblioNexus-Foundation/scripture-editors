import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CLEAR_HISTORY_COMMAND } from "lexical";
import { useEffect } from "react";
import { LoggerBasic } from "./logger-basic.model";
import { EditorAdaptor, NodeOptions } from "../adaptors/editor-adaptor.model";

function performanceDiffLog(context: string, start: number): number {
  const end = performance.now();
  console.log(`${context} took ${Math.round(end - start)} ms`);
  return end;
}

/**
 * A plugin component that updates the state of the lexical editor when incoming Scripture changes.
 * @param props.scripture - Scripture data.
 * @param props.nodeOptions - Options for each node.
 * @param props.editorAdaptor - Editor adaptor.
 * @param props.viewOptions - View options of the editor.
 * @param props.logger - Logger instance.
 * @returns null, i.e. no DOM elements.
 */
export default function UpdateStatePlugin<TLogger extends LoggerBasic>({
  scripture,
  nodeOptions,
  editorAdaptor,
  viewOptions,
  logger,
}: {
  scripture?: unknown;
  nodeOptions?: NodeOptions;
  editorAdaptor: EditorAdaptor;
  viewOptions?: unknown;
  logger?: TLogger;
}): null {
  const start = performance.now();
  let diff = start;
  const [editor] = useLexicalComposerContext();
  editorAdaptor.initialize?.(nodeOptions, logger);
  diff = performanceDiffLog("editorAdaptor.initialize()", diff);

  useEffect(() => {
    editorAdaptor.reset?.();
    diff = performanceDiffLog("editorAdaptor.reset()", diff);
    const serializedEditorState = editorAdaptor.serializeEditorState(scripture, viewOptions);
    diff = performanceDiffLog("editorAdaptor.loadEditorState()", diff);
    const editorState = editor.parseEditorState(serializedEditorState);
    performanceDiffLog("editor.parseEditorState()", diff);
    // Execute after the current render cycle.
    setTimeout(() => {
      editor.setEditorState(editorState);
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
      console.log(`UpdateStatePlugin() took ${Math.round(performance.now() - start)} ms`);
    }, 0);
  }, [editor, scripture, viewOptions, logger, editorAdaptor]);

  return null;
}
