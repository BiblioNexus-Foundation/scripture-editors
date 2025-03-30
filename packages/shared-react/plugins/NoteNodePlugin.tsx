import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $createRangeSelection,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  COMMAND_PRIORITY_HIGH,
  EditorState,
  KEY_DOWN_COMMAND,
  LexicalEditor,
  NodeMutation,
} from "lexical";
import { useEffect, useRef } from "react";
import { LoggerBasic } from "shared/adaptors/logger-basic.model";
import { $isCharNode, CharNode } from "shared/nodes/scripture/usj/CharNode";
import { $isNoteNode, NoteNode } from "shared/nodes/scripture/usj/NoteNode";
import {
  getNodeElementTagName,
  getNoteCallerPreviewText,
} from "shared/nodes/scripture/usj/node.utils";
import {
  $isImmutableNoteCallerNode,
  defaultNoteCallers,
  GENERATOR_NOTE_CALLER,
  ImmutableNoteCallerNode,
  immutableNoteCallerNodeName,
} from "../nodes/scripture/usj/ImmutableNoteCallerNode";
import { UsjNodeOptions } from "../nodes/scripture/usj/usj-node-options.model";

export default function NoteNodePlugin<TLogger extends LoggerBasic>({
  nodeOptions,
  logger,
}: {
  nodeOptions: UsjNodeOptions;
  logger?: TLogger;
}): null {
  const [editor] = useLexicalComposerContext();
  useNodeOptions(nodeOptions, logger);
  useNoteNode(editor);
  useArrowKeys(editor);
  return null;
}

/**
 * This hook is responsible for handling updates to `nodeOptions`.
 * @param nodeOptions - Node options that includes the list of potential node callers.
 * @param logger - Logger to use, if any.
 */
function useNodeOptions(nodeOptions: UsjNodeOptions, logger?: LoggerBasic) {
  const previousNoteCallersRef = useRef<string[]>();

  useEffect(() => {
    let noteCallers = nodeOptions[immutableNoteCallerNodeName]?.noteCallers;
    if (!noteCallers || noteCallers.length <= 0) noteCallers = defaultNoteCallers;
    if (previousNoteCallersRef.current !== noteCallers) {
      previousNoteCallersRef.current = noteCallers;
      updateCounterStyleSymbols("note-callers", noteCallers, logger);
    }
  }, [nodeOptions[immutableNoteCallerNodeName]?.noteCallers]);
}

/**
 * This hook is responsible for handling NoteNode and NoteNodeCaller interactions.
 * @param editor - The LexicalEditor instance used to access the DOM.
 */
function useNoteNode(editor: LexicalEditor) {
  useEffect(() => {
    if (!editor.hasNodes([CharNode, NoteNode, ImmutableNoteCallerNode])) {
      throw new Error(
        "NoteNodePlugin: CharNode, NoteNode or ImmutableNoteCallerNode not registered on editor!",
      );
    }

    const doubleClickListener = (event: MouseEvent) =>
      editor.update(() => $handleDoubleClick(event));

    return mergeRegister(
      // Update NoteNodeCaller preview text when NoteNode children text is changed.
      editor.registerNodeTransform(CharNode, $noteCharNodeTransform),

      // Re-generate all note callers when a note is removed.
      editor.registerMutationListener(
        ImmutableNoteCallerNode,
        (nodeMutations, { prevEditorState }) =>
          generateNoteCallersOnDestroy(nodeMutations, prevEditorState),
      ),

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
    );
  }, [editor]);
}

/**
 * Changes in NoteNode children text are updated in the NoteNodeCaller preview text.
 * @param node - CharNode thats needs its preview text updated.
 */
function $noteCharNodeTransform(node: CharNode): void {
  const parent = node.getParentOrThrow();
  const children = parent.getChildren();
  const noteCaller = children.find((child) => $isImmutableNoteCallerNode(child));
  if (!$isCharNode(node) || !$isNoteNode(parent) || !noteCaller) return;

  const previewText = getNoteCallerPreviewText(children);
  noteCaller.setPreviewText(previewText);
}

/**
 * When a NoteNode is destroyed, check if it was generated and force a CSS reflow.
 * @param nodeMutations - Map of node mutations.
 * @param prevEditorState - The previous EditorState.
 */
function generateNoteCallersOnDestroy(
  nodeMutations: Map<string, NodeMutation>,
  prevEditorState: EditorState,
) {
  for (const [nodeKey, mutation] of nodeMutations) {
    if (mutation !== "destroyed") continue;

    const nodeWasGenerated = prevEditorState.read(() => {
      const node = $getNodeByKey<ImmutableNoteCallerNode>(nodeKey);
      const parent = node?.getParent();
      return (
        $isImmutableNoteCallerNode(node) &&
        $isNoteNode(parent) &&
        parent.getCaller() === GENERATOR_NOTE_CALLER
      );
    });
    const editorElement = document.querySelector<HTMLElement>(".editor-input");
    if (!nodeWasGenerated || !editorElement) continue;

    const originalDisplay = editorElement.style.display;
    editorElement.style.display = "none";

    // Force a reflow to ensure the counter reset is applied
    void editorElement.offsetHeight;

    editorElement.style.display = originalDisplay;
  }
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

function updateCounterStyleSymbols(
  counterStyleName: string,
  newSymbols: string[],
  logger?: LoggerBasic,
): void {
  // Loop through all stylesheets
  for (const styleSheet of document.styleSheets) {
    try {
      const cssRules = styleSheet.cssRules || styleSheet.rules;

      // Loop through all CSS rules in the current stylesheet
      for (const rule of cssRules) {
        // Check if the rule is a counter-style rule with the matching name
        if (rule instanceof CSSCounterStyleRule && rule.name === counterStyleName) {
          // Create the symbols string (space-separated symbols)
          const symbolsValue = newSymbols.map((symbol) => `"${symbol}"`).join(" ");

          // Set the new symbols
          rule.symbols = symbolsValue;
          return;
        }
      }
    } catch (e) {
      // Skip cross-origin stylesheets that can't be accessed
      continue;
    }
  }

  // If the counter-style wasn't found, you could create it
  logger?.warn(`Editor: counter style "${counterStyleName}" not found.`);
}
