import { act } from "@testing-library/react";
import {
  $createPoint,
  $createRangeSelection,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  CreateEditorArgs,
  KEY_ENTER_COMMAND,
  Klass,
  LexicalEditor,
  LexicalNode,
  LexicalNodeReplacement,
  TextNode,
  createEditor,
} from "lexical";
import scriptureUsjNodes from "./scripture/usj";

export type TestEnv = {
  editor: LexicalEditor;
  container?: HTMLElement;
};

/**
 * Create basic Lexical test environment.
 * @param nodes - Array of nodes for the test environment.
 * @param $initialEditorState - Optional function to set the initial editor state.
 * @returns a test environment.
 */
export function createBasicTestEnvironment(
  nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> = scriptureUsjNodes,
  $initialEditorState?: () => void,
): TestEnv {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const config: CreateEditorArgs = {
    namespace: "TestEditor",
    onError(error) {
      throw error;
    },
    nodes,
  };
  const editor = createEditor(config);
  editor.setRootElement(container);
  if ($initialEditorState) editor.update($initialEditorState, { discrete: true });

  const testEnv: TestEnv = {
    container,
    editor,
  };

  return testEnv;
}

/**
 * Sets the selection range in the LexicalEditor.
 *
 * @param editor - The LexicalEditor instance where the selection will be set.
 * @param $createNoteNodeToInsert - A callback function to create the NoteNode to insert at the
 *   selection.
 * @param startNode - The starting TextNode of the selection.
 * @param startOffset - The offset within the startNode where the selection begins. Defaults to the
 *   end of the startNode's text content.
 * @param endNode - The ending TextNode of the selection. Defaults to the startNode.
 * @param endOffset - The offset within the endNode where the selection ends. Defaults to the
 *   startOffset.
 * @param tag - Optional tag for the update.
 */
export function updateSelection(
  editor: LexicalEditor,
  startNode: TextNode,
  startOffset?: number,
  endNode?: TextNode,
  endOffset?: number,
  tag?: string | string[],
) {
  editor.update(
    () => {
      if (startOffset === undefined) startOffset = startNode.getTextContentSize();
      if (endOffset === undefined) endOffset = startOffset;
      if (!endNode) endNode = startNode;
      const rangeSelection = $createRangeSelection();
      rangeSelection.anchor = $createPoint(startNode.getKey(), startOffset, "text");
      rangeSelection.focus = $createPoint(endNode.getKey(), endOffset, "text");
      $setSelection(rangeSelection);
    },
    { discrete: true, tag },
  );
}

/**
 * Checks the selection range in the LexicalEditor is at the specified location.
 *
 * @param startNode - The starting TextNode of the expected selection.
 * @param startOffset - The offset within the startNode where the selection begins. Defaults to the
 *   end of the startNode's text content.
 * @param endNode - The ending TextNode of the expected selection. Defaults to the startNode.
 * @param endOffset - The offset within the endNode where the selection ends. Defaults to the
 *   end of the endNode's text content.
 */
export function $expectSelectionToBe(
  startNode: TextNode,
  startOffset?: number,
  endNode?: TextNode,
  endOffset?: number,
) {
  if (startOffset === undefined) startOffset = startNode.getTextContentSize();
  if (endOffset === undefined) endOffset = endNode ? endNode.getTextContentSize() : startOffset;
  if (!endNode) endNode = startNode;

  const selection = $getSelection();
  if (!$isRangeSelection(selection)) fail("Selection is not a range selection");
  const selectionStart = selection.isBackward() ? selection.focus : selection.anchor;
  const selectionEnd = selection.isBackward() ? selection.anchor : selection.focus;
  expect(selectionStart).toEqual({
    key: startNode.getKey(),
    offset: startOffset,
    type: "text",
  });
  expect(selectionEnd).toEqual({
    key: endNode.getKey(),
    offset: endOffset,
    type: "text",
  });
}

/**
 * Press the enter key at the selection range in the LexicalEditor.
 *
 * @param editor - The LexicalEditor instance where the selection will be set.
 * @param startNode - The starting TextNode of the selection.
 * @param startOffset - The offset within the startNode where the selection begins. Defaults to the
 *   end of the startNode's text content.
 * @param endNode - The ending TextNode of the selection. Defaults to the startNode.
 * @param endOffset - The offset within the endNode where the selection ends. Defaults to the
 *   end of the endNode's text content.
 */
export async function pressEnterAtSelection(
  editor: LexicalEditor,
  startNode: TextNode,
  startOffset?: number,
  endNode?: TextNode,
  endOffset?: number,
) {
  await act(async () => {
    editor.update(() => {
      if (startOffset === undefined) startOffset = startNode.getTextContentSize();
      if (endOffset === undefined) endOffset = endNode ? endNode.getTextContentSize() : startOffset;
      if (!endNode) endNode = startNode;
      const rangeSelection = $createRangeSelection();
      rangeSelection.anchor = $createPoint(startNode.getKey(), startOffset, "text");
      rangeSelection.focus = $createPoint(endNode.getKey(), endOffset, "text");
      $setSelection(rangeSelection);
    });
    editor.dispatchCommand(KEY_ENTER_COMMAND, null);
  });
}
