import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { render, act } from "@testing-library/react";
import {
  $getRoot,
  $createTextNode,
  LexicalEditor,
  $setSelection,
  $createRangeSelection,
  $createPoint,
  TextNode,
} from "lexical";
import scriptureUsjNodes from "shared/nodes/scripture/usj";
import { $createCharNode, $isCharNode } from "shared/nodes/scripture/usj/CharNode";
import { $createImmutableChapterNode } from "shared/nodes/scripture/usj/ImmutableChapterNode";
import {
  $createNoteNode,
  GENERATOR_NOTE_CALLER,
  NoteNode,
} from "shared/nodes/scripture/usj/NoteNode";
import { $createParaNode } from "shared/nodes/scripture/usj/ParaNode";
import {
  $createImmutableNoteCallerNode,
  defaultNoteCallers,
  ImmutableNoteCallerNode,
  immutableNoteCallerNodeName,
} from "../nodes/scripture/usj/ImmutableNoteCallerNode";
import {
  $createImmutableVerseNode,
  ImmutableVerseNode,
} from "../nodes/scripture/usj/ImmutableVerseNode";
import { UsjNodeOptions } from "../nodes/scripture/usj/usj-node-options.model";
import NoteNodePlugin from "./NoteNodePlugin";

let firstVerseTextNode: TextNode;
let firstNoteNode: NoteNode;
let secondNoteNode: NoteNode;
let thirdNoteNode: NoteNode;
let insertedNoteNode: NoteNode | undefined;

describe("NoteNodePlugin", () => {
  it("should load default initialEditorState (sanity check)", async () => {
    const { editor } = await testEnvironment();

    editor.getEditorState().read(() => {
      expect($getRoot().getTextContent()).toBe(
        "1:1 First footnote text first verse text \n\n1:2 Second footnote text second verse text \n\n1:3 Third footnote text third verse text ",
      );
      expect(getNoteCaller(firstNoteNode)).toBe("a");
      expect(getNoteCaller(secondNoteNode)).toBe("b");
      expect(getNoteCaller(thirdNoteNode)).toBe("c");
    });
  });

  describe("Note Caller Renumbering", () => {
    it("should insert footnote after the first footnote and renumber", async () => {
      const { editor } = await testEnvironment();
      const $createNoteNodeToInsert = () =>
        $createFootnoteNode(GENERATOR_NOTE_CALLER, "1:1 ", "Inserted footnote text ");

      insertedNoteNode = await insertNoteNodeAtSelection(
        editor,
        $createNoteNodeToInsert,
        firstVerseTextNode,
      );

      editor.getEditorState().read(() => {
        expect(getNoteCaller(firstNoteNode)).toBe("a");
        expect(getNoteCaller(insertedNoteNode)).toBe("b");
        expect(getNoteCaller(secondNoteNode)).toBe("c");
        expect(getNoteCaller(thirdNoteNode)).toBe("d");
      });
    });

    it("should remove note and renumber", async () => {
      const { editor } = await testEnvironment();

      await removeNode(editor, firstNoteNode);

      editor.getEditorState().read(() => {
        expect(firstNoteNode.isAttached()).toBe(false);
        expect(getNoteCaller(secondNoteNode)).toBe("a");
        expect(getNoteCaller(thirdNoteNode)).toBe("b");
      });
    });

    it("should insert footnote after the first footnote and renumber with caller subset", async () => {
      const nodeOptions: UsjNodeOptions = {
        [immutableNoteCallerNodeName]: { noteCallers: ["a", "b", "c"] },
      };
      const { editor } = await testEnvironment(nodeOptions);
      const $createNoteNodeToInsert = () =>
        $createFootnoteNode(GENERATOR_NOTE_CALLER, "1:1 ", "Inserted footnote text ");

      insertedNoteNode = await insertNoteNodeAtSelection(
        editor,
        $createNoteNodeToInsert,
        firstVerseTextNode,
      );

      editor.getEditorState().read(() => {
        expect(getNoteCaller(firstNoteNode)).toBe("a");
        expect(getNoteCaller(insertedNoteNode)).toBe("b");
        expect(getNoteCaller(secondNoteNode)).toBe("c");
        expect(getNoteCaller(thirdNoteNode)).toBe("aa");
      });
    });
  });

  describe("Note Caller Renumbering Across Chapters", () => {
    let ch2FirstNoteNode: NoteNode;
    let ch2SecondNoteNode: NoteNode;

    function $initialEditorState() {
      $defaultInitialEditorState();
      const ch2FirstVerseNode = $createImmutableVerseNode("1");
      ch2FirstNoteNode = $createFootnoteNode("d", "1:1 ", "First footnote text ");
      const ch2FirstVerseTextNode = $createTextNode("first verse text ");
      const ch2SecondVerseNode = $createImmutableVerseNode("2");
      ch2SecondNoteNode = $createFootnoteNode("e", "1:2 ", "Second footnote text ");
      const ch2SecondVerseTextNode = $createTextNode("second verse text ");
      $getRoot().append(
        $createImmutableChapterNode("2"),
        $createParaNode().append(ch2FirstVerseNode, ch2FirstNoteNode, ch2FirstVerseTextNode),
        $createParaNode().append(ch2SecondVerseNode, ch2SecondNoteNode, ch2SecondVerseTextNode),
      );
    }

    it("should insert footnote after the first footnote and renumber", async () => {
      const { editor } = await testEnvironment(undefined, $initialEditorState);
      editor.getEditorState().read(() => {
        expect(getNoteCaller(ch2FirstNoteNode)).toBe("d");
        expect(getNoteCaller(ch2SecondNoteNode)).toBe("e");
      });
      const $createFootnoteNodeToInsert = () =>
        $createFootnoteNode(GENERATOR_NOTE_CALLER, "1:1 ", "Inserted footnote text ");

      insertedNoteNode = await insertNoteNodeAtSelection(
        editor,
        $createFootnoteNodeToInsert,
        firstVerseTextNode,
      );

      editor.getEditorState().read(() => {
        expect(getNoteCaller(ch2FirstNoteNode)).toBe("e");
        expect(getNoteCaller(ch2SecondNoteNode)).toBe("f");
      });
    });

    it("should remove note and renumber", async () => {
      const { editor } = await testEnvironment(undefined, $initialEditorState);

      await removeNode(editor, firstNoteNode);

      editor.getEditorState().read(() => {
        expect(firstNoteNode.isAttached()).toBe(false);
        expect(getNoteCaller(secondNoteNode)).toBe("a");
        expect(getNoteCaller(thirdNoteNode)).toBe("b");
        expect(getNoteCaller(ch2FirstNoteNode)).toBe("c");
        expect(getNoteCaller(ch2SecondNoteNode)).toBe("d");
      });
    });
  });

  describe("Note Caller Preview Text", () => {
    it("should update preview text", async () => {
      const { editor } = await testEnvironment();
      editor.getEditorState().read(() => {
        expect(getPreviewText(firstNoteNode)).toBe("1:1  First footnote text");
      });

      await updateNoteNodeText(editor, firstNoteNode, 1, "1:1a ");

      editor.getEditorState().read(() => {
        expect(getPreviewText(firstNoteNode)).toBe("1:1a  First footnote text");
      });
    });
  });
});

function $createFootnoteNode(caller: string, reference: string, text: string) {
  const footnoteNode = $createNoteNode("f", GENERATOR_NOTE_CALLER);
  footnoteNode.append(
    $createImmutableNoteCallerNode(caller, `${reference} ${text}`),
    $createCharNode("fr", reference),
    $createCharNode("ft", text),
  );
  return footnoteNode;
}

function $defaultInitialEditorState() {
  const firstVerseNode = $createImmutableVerseNode("1");
  const secondVerseNode = $createImmutableVerseNode("2");
  const secondVerseTextNode = $createTextNode("second verse text ");
  const thirdVerseNode = $createImmutableVerseNode("3");
  const thirdVerseTextNode = $createTextNode("third verse text ");

  firstNoteNode = $createFootnoteNode("a", "1:1 ", "First footnote text ");
  firstVerseTextNode = $createTextNode("first verse text ");
  secondNoteNode = $createFootnoteNode("b", "1:2 ", "Second footnote text ");
  thirdNoteNode = $createFootnoteNode("c", "1:3 ", "Third footnote text ");

  $getRoot().append(
    $createImmutableChapterNode("1"),
    $createParaNode().append(firstVerseNode, firstNoteNode, firstVerseTextNode),
    $createParaNode().append(secondVerseNode, secondNoteNode, secondVerseTextNode),
    $createParaNode().append(thirdVerseNode, thirdNoteNode, thirdVerseTextNode),
  );
}

async function testEnvironment(
  nodeOptions: UsjNodeOptions = {
    [immutableNoteCallerNodeName]: { noteCallers: defaultNoteCallers },
  },
  $initialEditorState: () => void = $defaultInitialEditorState,
) {
  let editor: LexicalEditor;

  function GrabEditor() {
    [editor] = useLexicalComposerContext();
    return null;
  }

  function App() {
    return (
      <LexicalComposer
        initialConfig={{
          editorState: $initialEditorState,
          namespace: "TestEditor",
          nodes: [ImmutableNoteCallerNode, ImmutableVerseNode, ...scriptureUsjNodes],
          onError: () => {
            throw Error();
          },
          theme: {},
        }}
      >
        <GrabEditor />
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <NoteNodePlugin nodeOptions={nodeOptions} logger={console} />
      </LexicalComposer>
    );
  }

  await act(async () => {
    render(<App />);
  });

  // `editor` is defined on React render.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return { editor: editor! };
}

/**
 * Insert a NoteNode at the selection range in the LexicalEditor.
 *
 * @param editor - The LexicalEditor instance where the selection will be set.
 * @param $createNoteNodeToInsert - A callback function to create the NoteNode to insert at the
 *   selection.
 * @param startNode - The starting TextNode of the selection.
 * @param startOffset - The offset within the startNode where the selection begins. Defaults to the
 *   end of the startNode's text content.
 * @param endNode - The ending TextNode of the selection. Defaults to the startNode.
 * @param endOffset - The offset within the endNode where the selection ends. Defaults to the
 *   end of the endNode's text content.
 * @returns The inserted NoteNode.
 */
async function insertNoteNodeAtSelection(
  editor: LexicalEditor,
  $createNoteNodeToInsert: () => NoteNode,
  startNode: TextNode,
  startOffset?: number,
  endNode?: TextNode,
  endOffset?: number,
) {
  let insertedNoteNode: NoteNode | undefined;
  await act(async () => {
    editor.update(() => {
      if (startOffset === undefined) startOffset = startNode.getTextContentSize();
      if (endOffset === undefined) endOffset = endNode ? endNode.getTextContentSize() : startOffset;
      if (!endNode) endNode = startNode;
      const rangeSelection = $createRangeSelection();
      rangeSelection.anchor = $createPoint(startNode.getKey(), startOffset, "text");
      rangeSelection.focus = $createPoint(endNode.getKey(), endOffset, "text");
      $setSelection(rangeSelection);
      insertedNoteNode = $createNoteNodeToInsert();
      rangeSelection.insertNodes([insertedNoteNode]);
    });
  });
  return insertedNoteNode;
}

/**
 * Removes a specified NoteNode from the LexicalEditor.
 *
 * @param editor - The LexicalEditor instance from which the node will be removed.
 * @param nodeToRemove - The NoteNode instance that needs to be removed.
 * @returns A promise that resolves once the node has been removed.
 */
async function removeNode(editor: LexicalEditor, nodeToRemove: NoteNode) {
  await act(async () => {
    editor.update(() => {
      nodeToRemove.remove();
    });
  });
}

/**
 * Updates the text content of a CharNode within a NoteNode.
 *
 * @param editor - The LexicalEditor instance where the NoteNode is located.
 * @param noteNode - The NoteNode instance containing the CharNode to update.
 * @param childIndex - The index of the CharNode within the NoteNode's children.
 * @param text - The new text content to set on the CharNode.
 * @returns A promise that resolves once the text content has been updated.
 */
async function updateNoteNodeText(
  editor: LexicalEditor,
  noteNode: NoteNode,
  childIndex: number,
  text: string,
) {
  await act(async () => {
    editor.update(() => {
      const noteNodeChild = noteNode.getChildAtIndex(childIndex);
      if ($isCharNode(noteNodeChild)) noteNodeChild.setTextContent(text);
    });
  });
}

function getNoteCaller(noteNode: NoteNode | undefined): string | undefined {
  return noteNode?.getChildAtIndex<ImmutableNoteCallerNode>(0)?.getCaller();
}

function getPreviewText(noteNode: NoteNode | undefined): string | undefined {
  return noteNode?.getChildAtIndex<ImmutableNoteCallerNode>(0)?.getPreviewText();
}
