import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { render, act } from "@testing-library/react";
import { $createTextNode, $getRoot, $isTextNode, LexicalEditor, LexicalNode } from "lexical";
import scriptureUsjNodes from "shared/nodes/scripture/usj";
import { $createImmutableChapterNode } from "shared/nodes/scripture/usj/ImmutableChapterNode";
import { $createNoteNode, NoteNode } from "shared/nodes/scripture/usj/NoteNode";
import { $createParaNode, $isParaNode } from "shared/nodes/scripture/usj/ParaNode";
import { $expectSelectionToBe, typeTextBeforeSelection } from "shared/nodes/test.utils";
import { ImmutableNoteCallerNode } from "../nodes/scripture/usj/ImmutableNoteCallerNode";
import {
  ImmutableVerseNode,
  $createImmutableVerseNode,
} from "../nodes/scripture/usj/ImmutableVerseNode";
import { $isSomeVerseNode } from "../nodes/scripture/usj/node-react.utils";
import { TextNodePlugin } from "./TextNodePlugin";
import { $createCharNode, $isCharNode } from "shared/nodes/scripture/usj/CharNode";

let secondVerseNode: ImmutableVerseNode;

describe("TextNodePlugin", () => {
  it("should load default initialEditorState (sanity check)", async () => {
    const { editor } = await testEnvironment();

    editor.getEditorState().read(() => {
      expect($getRoot().getTextContent()).toBe("");
    });
  });

  it("should insert a character between empty verses and add trailing space and retain caret location", async () => {
    const { editor } = await testEnvironment();

    await typeTextBeforeSelection(editor, "a", secondVerseNode);

    editor.getEditorState().read(() => {
      const para = $getRoot().getChildren()[1];
      if (!$isParaNode(para)) fail("Expected a ParaNode");
      expect(para.getChildren()).toHaveLength(3);
      const textNode = para.getChildAtIndex(1);
      if (!$isTextNode(textNode)) fail("Expected a TextNode");
      expect(textNode.getTextContent()).toBe("a ");
      $expectSelectionToBe(textNode, 1);
    });
  });

  it("should remove the character between empty verses and trailing space is removed", async () => {
    let textNode: LexicalNode | null;
    function $initialEditorState() {
      textNode = $createTextNode("a ");
      $getRoot().append(
        $createImmutableChapterNode("1"),
        $createParaNode().append($createImmutableVerseNode("1"), textNode),
      );
    }
    const { editor } = await testEnvironment($initialEditorState);

    // Remove the 'a' and leave the space.
    await act(async () => {
      editor.update(() => {
        if ($isTextNode(textNode) && textNode.isAttached()) textNode.setTextContent(" ");
      });
    });

    editor.getEditorState().read(() => {
      const para = $getRoot().getChildren()[1];
      if (!$isParaNode(para)) fail("Expected a ParaNode");
      expect(para.getChildren()).toHaveLength(1);
      const verseNode = para.getChildAtIndex(0);
      if (!$isSomeVerseNode(verseNode)) fail("Expected some verse node");
    });
  });

  it("should insert a character before a note node and not add trailing space", async () => {
    let noteNode: NoteNode;
    function $initialEditorState() {
      noteNode = $createNoteNode("f", "+");
      $getRoot().append(
        $createImmutableChapterNode("1"),
        $createParaNode().append($createImmutableVerseNode("1"), noteNode),
      );
    }
    const { editor } = await testEnvironment($initialEditorState);

    // `noteNode` is assigned in the previous line.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await typeTextBeforeSelection(editor, "a", noteNode!);

    editor.getEditorState().read(() => {
      const para = $getRoot().getChildren()[1];
      if (!$isParaNode(para)) fail("Expected a ParaNode");
      expect(para.getChildren()).toHaveLength(3);
      const textNode = para.getChildAtIndex(1);
      if (!$isTextNode(textNode)) fail("Expected a TextNode");
      expect(textNode.getTextContent()).toBe("a");
      $expectSelectionToBe(textNode, 1);
    });
  });

  it("should not add a space inside a char node", async () => {
    let charNode: LexicalNode | null;
    function $initialEditorState() {
      charNode = $createCharNode("wj").append($createTextNode("a"));
      $getRoot().append(
        $createImmutableChapterNode("1"),
        $createParaNode().append($createImmutableVerseNode("1"), charNode),
      );
    }
    const { editor } = await testEnvironment($initialEditorState);

    editor.getEditorState().read(() => {
      const para = $getRoot().getChildren()[1];
      if (!$isParaNode(para)) fail("Expected a ParaNode");
      expect(para.getChildren()).toHaveLength(2);
      const charNode = para.getChildAtIndex(1);
      if (!$isCharNode(charNode)) fail("Expected a CharNode");
      expect(charNode.getTextContent()).toBe("a");
    });
  });
});

function $defaultInitialEditorState() {
  secondVerseNode = $createImmutableVerseNode("2");
  $getRoot().append(
    $createImmutableChapterNode("1"),
    $createParaNode().append($createImmutableVerseNode("1"), secondVerseNode),
  );
}

async function testEnvironment($initialEditorState: () => void = $defaultInitialEditorState) {
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
        <TextNodePlugin />
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
