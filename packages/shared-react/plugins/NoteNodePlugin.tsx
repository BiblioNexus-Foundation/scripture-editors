import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $getNodeByKey, $getRoot, LexicalEditor } from "lexical";
import { useEffect } from "react";
import { $isCharNode, CharNode } from "shared/nodes/scripture/usj/CharNode";
import { $isNoteNode, GENERATOR_NOTE_CALLER, NoteNode } from "shared/nodes/scripture/usj/NoteNode";
import { getNoteCallerPreviewText } from "shared/nodes/scripture/usj/node.utils";
import {
  $isImmutableNoteCallerNode,
  ImmutableNoteCallerNode,
  immutableNoteCallerNodeName,
} from "../nodes/scripture/usj/ImmutableNoteCallerNode";
import {
  $findImmutableNoteCallerNodes,
  CallerData,
  generateNoteCaller,
} from "../nodes/scripture/usj/node-react.utils";
import { UsjNodeOptions } from "../nodes/scripture/usj/usj-node-options.model";
import { MERGE_HISTORY_COMMAND } from "./HistoryPlugin";
import { LoggerBasic } from "./logger-basic.model";

const callerData: CallerData = { count: 0 };

/**
 * Changes in NoteNode children text are updated in the NoteNodeCaller preview text.
 * @param node - CharNode thats needs its preview text updated.
 */
function $noteCharNodeTransform(node: CharNode): void {
  const parent = node.getParentOrThrow();
  const children = parent.getChildren();
  const noteCaller = children.find((child) => $isImmutableNoteCallerNode(child));
  if (!$isCharNode(node) || (!$isNoteNode(parent) && !noteCaller)) return;

  const previewText = getNoteCallerPreviewText(children);
  (noteCaller as ImmutableNoteCallerNode).setPreviewText(previewText);
}

/**
 * This will regenerate all the changed node callers to keep them sequential. E.g. use this method
 * if a caller node is inserted so that node and all following caller nodes will get regenerated
 * callers. Also if a caller node is deleted following caller nodes get regenerated callers.
 * @param nodeOptions - Node options that includes the list of potential node callers.
 * @param logger - Logger to use, if any.
 */
function $generateAllNoteCallers(nodeOptions: UsjNodeOptions, logger?: LoggerBasic) {
  const children = $getRoot().getChildren();
  // find all ImmutableNoteCallerNodes whose parent NoteNode caller requires generating
  const noteCallerNodes = $findImmutableNoteCallerNodes(children).filter((node) => {
    const parent = node.getParentOrThrow();
    if (!parent || !$isNoteNode(parent)) return false;

    return parent.getCaller() === GENERATOR_NOTE_CALLER;
  });
  // generate caller for each
  callerData.count = 0;
  noteCallerNodes.forEach((noteCallerNode) => {
    const noteCallers = nodeOptions[immutableNoteCallerNodeName]?.noteCallers;
    const caller = generateNoteCaller(GENERATOR_NOTE_CALLER, noteCallers, callerData, logger);
    if (noteCallerNode.__caller !== caller) noteCallerNode.setCaller(caller);
  });
}

function useNoteNode(editor: LexicalEditor, nodeOptions: UsjNodeOptions, logger?: LoggerBasic) {
  useEffect(() => {
    if (!editor.hasNodes([CharNode, NoteNode, ImmutableNoteCallerNode])) {
      throw new Error(
        "NoteNodePlugin: CharNode, NoteNode or ImmutableNoteCallerNode not registered on editor!",
      );
    }

    return mergeRegister(
      editor.registerNodeTransform(CharNode, $noteCharNodeTransform),
      editor.registerMutationListener(ImmutableNoteCallerNode, (nodeMutations) => {
        editor.update(() => {
          for (const [nodeKey, mutation] of nodeMutations) {
            const node = $getNodeByKey(nodeKey);
            const parent = node && node.getParentOrThrow();
            if (
              (mutation === "created" || mutation === "destroyed") &&
              $isImmutableNoteCallerNode(node) &&
              $isNoteNode(parent) &&
              parent.getCaller() === GENERATOR_NOTE_CALLER
            )
              $generateAllNoteCallers(nodeOptions, logger);
          }
        });
        editor.dispatchCommand(MERGE_HISTORY_COMMAND, undefined);
      }),
    );
  }, [editor]);
}

export default function NoteNodePlugin<TLogger extends LoggerBasic>({
  nodeOptions,
  logger,
}: {
  nodeOptions: UsjNodeOptions;
  logger?: TLogger;
}): null {
  const [editor] = useLexicalComposerContext();
  useNoteNode(editor, nodeOptions, logger);
  return null;
}
