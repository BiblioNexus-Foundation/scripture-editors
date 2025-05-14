import {
  $isImmutableNoteCallerNode,
  defaultNoteCallers,
  GENERATOR_NOTE_CALLER,
  ImmutableNoteCallerNode,
  immutableNoteCallerNodeName,
} from "../../nodes/usj/ImmutableNoteCallerNode";
import { UsjNodeOptions } from "../../nodes/usj/usj-node-options.model";
import { ViewOptions } from "../../views/view-options.utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $createRangeSelection,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  EditorState,
  LexicalEditor,
  NodeMutation,
  TextNode,
} from "lexical";
import { useEffect, useRef } from "react";
import { LoggerBasic } from "shared/adaptors/logger-basic.model";
import { $isCharNode, CharNode } from "shared/nodes/usj/CharNode";
import { $isNoteNode, NoteNode } from "shared/nodes/usj/NoteNode";
import { $findFirstAncestorNoteNode, getNoteCallerPreviewText } from "shared/nodes/usj/node.utils";

/**
 * This plugin is responsible for handling NoteNode and NoteNodeCaller interactions. It also
 * updates the counter style symbols for note callers when the node options change.
 * @param nodeOptions - Node options that includes the list of potential node callers.
 * @param viewOptions - View options that includes the list of potential node callers.
 * @param logger - Logger to use, if any.
 * @returns
 */
export function NoteNodePlugin<TLogger extends LoggerBasic>({
  nodeOptions,
  viewOptions,
  logger,
}: {
  nodeOptions: UsjNodeOptions;
  viewOptions: ViewOptions | undefined;
  logger?: TLogger;
}): null {
  const [editor] = useLexicalComposerContext();
  useNodeOptions(nodeOptions, logger);
  useNoteNode(editor, viewOptions);
  return null;
}

/**
 * This hook is responsible for handling updates to `nodeOptions`.
 * @param nodeOptions - Node options that includes the list of potential node callers.
 * @param logger - Logger to use, if any.
 */
function useNodeOptions(nodeOptions: UsjNodeOptions, logger?: LoggerBasic) {
  const previousNoteCallersRef = useRef<string[]>();
  const nodeOptionsNoteCallers = nodeOptions[immutableNoteCallerNodeName]?.noteCallers;

  useEffect(() => {
    let noteCallers = nodeOptionsNoteCallers;
    if (!noteCallers || noteCallers.length <= 0) noteCallers = defaultNoteCallers;
    if (previousNoteCallersRef.current !== noteCallers) {
      previousNoteCallersRef.current = noteCallers;
      updateCounterStyleSymbols("note-callers", noteCallers, logger);
    }
  }, [logger, nodeOptionsNoteCallers]);
}

/**
 * This hook is responsible for handling NoteNode and NoteNodeCaller interactions.
 * @param editor - The LexicalEditor instance used to access the DOM.
 * @param viewOptions - View options that includes the list of potential node callers.
 */
function useNoteNode(editor: LexicalEditor, viewOptions: ViewOptions | undefined) {
  useEffect(() => {
    if (!editor.hasNodes([CharNode, NoteNode, ImmutableNoteCallerNode])) {
      throw new Error(
        "NoteNodePlugin: CharNode, NoteNode or ImmutableNoteCallerNode not registered on editor!",
      );
    }

    const doubleClickListener = (event: MouseEvent) =>
      editor.update(() => $handleDoubleClick(event));

    return mergeRegister(
      // Remove NoteNode if it doesn't contain a caller node.
      editor.registerNodeTransform(NoteNode, (node) => $noteNodeTransform(node, viewOptions)),

      // Update NoteNodeCaller preview text when NoteNode children text is changed.
      editor.registerNodeTransform(CharNode, $noteCharNodeTransform),
      editor.registerNodeTransform(TextNode, $noteTextNodeTransform),

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
  }, [editor, viewOptions]);
}

/**
 * Removes a NoteNode if it does not contain an ImmutableNoteCallerNode child when `markerMode` is
 * not 'editable'. This can happen during certain editing operations or data inconsistencies.
 * @param node - The NoteNode to check.
 * @param viewOptions - The view options that includes the marker mode.
 */
function $noteNodeTransform(node: NoteNode, viewOptions: ViewOptions | undefined): void {
  const hasNoteCaller = node.getChildren().some((child) => $isImmutableNoteCallerNode(child));
  if (!hasNoteCaller && viewOptions?.markerMode !== "editable") node.remove();
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
  if (noteCaller.getPreviewText() !== previewText) noteCaller.setPreviewText(previewText);
}

/**
 * Changes in NoteNode children text are updated in the NoteNodeCaller preview text.
 * @param node - TextNode thats needs its preview text updated.
 */
function $noteTextNodeTransform(node: TextNode): void {
  const noteNode = $findFirstAncestorNoteNode(node);
  const children = noteNode?.getChildren();
  const noteCaller = children?.find((child) => $isImmutableNoteCallerNode(child));
  if (!$isTextNode(node) || !$isNoteNode(noteNode) || !noteCaller || !children) return;

  const previewText = getNoteCallerPreviewText(children);
  if (noteCaller.getPreviewText() !== previewText) noteCaller.setPreviewText(previewText);
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

    editorElement.classList.add("reset-counters");

    // Force a reflow to ensure the counter reset is applied
    void editorElement.offsetHeight;

    editorElement.classList.remove("reset-counters");
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
    } catch {
      // Skip cross-origin stylesheets that can't be accessed
      continue;
    }
  }

  // If the counter-style wasn't found, you could create it
  logger?.warn(`Editor: counter style "${counterStyleName}" not found.`);
}
