import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $createRangeSelection,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_DOWN_COMMAND,
  LexicalEditor,
} from "lexical";
import { useEffect } from "react";
import { $isCharNode, CharNode } from "shared/nodes/scripture/usj/CharNode";
import { $isNoteNode, GENERATOR_NOTE_CALLER, NoteNode } from "shared/nodes/scripture/usj/NoteNode";
import {
  getNodeElementTagName,
  getNoteCallerPreviewText,
} from "shared/nodes/scripture/usj/node.utils";
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
import { LoggerBasic } from "shared/adaptors/logger-basic.model";

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
 * Ensure that when double-clicking on a word after a note node (no space between) that it only
 * selects that word and does not include the note in the selection.
 * @param event - The MouseEvent triggered by the double-click interaction
 */
function $handleDoubleClick(event: MouseEvent) {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return;

  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = anchor.getNode();
  const focusNode = focus.getNode();

  if ($isNoteNode(anchorNode) && $isTextNode(focusNode)) {
    event.preventDefault();

    // Create new selection only including the TextNode
    const newSelection = $createRangeSelection();
    newSelection.anchor.set(focusNode.getKey(), 0, "text");
    newSelection.focus.set(focusNode.getKey(), focus.offset, "text");
    $setSelection(newSelection);
  }
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

    const doubleClickListener = (event: MouseEvent) =>
      editor.update(() => $handleDoubleClick(event));

    return mergeRegister(
      // Update NoteNodeCaller preview text when NoteNode children text are changed.
      editor.registerNodeTransform(CharNode, $noteCharNodeTransform),

      // Handle double-click of a word immediately following a NoteNode (no space between).
      editor.registerRootListener(
        (rootElement: HTMLElement | null, prevRootElement: HTMLElement | null) => {
          if (prevRootElement !== null) {
            prevRootElement.removeEventListener("dblclick", doubleClickListener);
          }
          if (rootElement !== null) {
            rootElement.addEventListener("dblclick", doubleClickListener);
          }
        },
      ),

      // Re-generate all note callers when a note is added or removed.
      editor.registerMutationListener(ImmutableNoteCallerNode, (nodeMutations) => {
        editor.update(
          () => {
            for (const [nodeKey, mutation] of nodeMutations) {
              const node = $getNodeByKey(nodeKey);
              const parent = node?.getParentOrThrow();
              if (
                (mutation === "created" || mutation === "destroyed") &&
                $isImmutableNoteCallerNode(node) &&
                $isNoteNode(parent) &&
                parent.getCaller() === GENERATOR_NOTE_CALLER
              )
                $generateAllNoteCallers(nodeOptions, logger);
            }
          },
          { tag: "history-merge" },
        );
      }),
    );
  }, [editor]);
}

/**
 * When moving forward with arrow keys, if a note node is next, move to the following node.
 * @param editor - The LexicalEditor instance used to access the DOM.
 */
function useArrowKeys(editor: LexicalEditor) {
  useEffect(() => {
    const $handleKeyDown = (event: KeyboardEvent): boolean => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return false;

      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return false;

      const anchorNode = selection.anchor.getNode();
      const isAtEnd = selection.anchor.offset === anchorNode.getTextContent().length;

      // Find the closest paragraph element to get the text direction
      const paragraphNode = $findMatchingParent(
        anchorNode,
        (node) => getNodeElementTagName(node, editor) === "p",
      );
      if (!paragraphNode) return false;

      const paragraphElement = editor.getElementByKey(paragraphNode.getKey());
      if (!paragraphElement) return false;

      const inputDiv = paragraphElement.parentElement;
      if (!inputDiv) return false;

      // If moving forward from the end of a text node and a note follows
      if (
        isAtEnd &&
        ((inputDiv.dir === "ltr" && event.key === "ArrowRight") ||
          (inputDiv.dir === "rtl" && event.key === "ArrowLeft"))
      ) {
        const nextSibling = anchorNode.getNextSibling();
        if ($isNoteNode(nextSibling)) {
          // Find the next text node after the NoteNode
          const nodeAfterNote = nextSibling.getNextSibling();
          if (nodeAfterNote) {
            // Move to the start of the next text node
            selection.anchor.set(nodeAfterNote.getKey(), 0, "text");
            selection.focus.set(nodeAfterNote.getKey(), 0, "text");
            event.preventDefault();
            return true;
          }
        }
      }

      return false;
    };

    return editor.registerCommand(KEY_DOWN_COMMAND, $handleKeyDown, COMMAND_PRIORITY_HIGH);
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
  useArrowKeys(editor);
  return null;
}
