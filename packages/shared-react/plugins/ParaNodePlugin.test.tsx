import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { render, act } from "@testing-library/react";
import { $getRoot, $createTextNode, LexicalEditor, TextNode } from "lexical";
import scriptureUsjNodes from "shared/nodes/scripture/usj";
import {
  $createImmutableChapterNode,
  $isImmutableChapterNode,
} from "shared/nodes/scripture/usj/ImmutableChapterNode";
import { $createParaNode, $isParaNode } from "shared/nodes/scripture/usj/ParaNode";
import { pressEnterAtSelection } from "shared/nodes/test.utils";
import { ImmutableNoteCallerNode } from "../nodes/scripture/usj/ImmutableNoteCallerNode";
import { ImmutableVerseNode } from "../nodes/scripture/usj/ImmutableVerseNode";
import ParaNodePlugin from "./ParaNodePlugin";

let firstVerseTextNode: TextNode;

describe("ParaNodePlugin", () => {
  it("should load default initialEditorState (sanity check)", async () => {
    const { editor } = await testEnvironment();

    editor.getEditorState().read(() => {
      const root = $getRoot();
      const children = root.getChildren();
      expect(root.getTextContent()).toBe("first verse text \n\nsecond verse text ");
      expect(children.length).toBe(3);
      if (!$isImmutableChapterNode(children[0])) fail("First item is not an ImmutableChapterNode");
      if (!$isParaNode(children[1])) fail("First child after chapter is not a ParaNode");
      expect(children[1].getChildrenSize()).toBe(1);
    });
  });

  it("should insert ParaNode without leading space", async () => {
    const { editor } = await testEnvironment();

    await pressEnterAtSelection(editor, firstVerseTextNode, 6);

    editor.getEditorState().read(() => {
      const root = $getRoot();
      const children = root.getChildren();
      expect(children.length).toBe(4);
      const firstPara = children[1];
      if (!$isParaNode(firstPara)) fail("First child after chapter is not a ParaNode");
      expect(firstPara.getTextContent()).toBe("first ");
      const secondPara = children[2];
      if (!$isParaNode(secondPara)) fail("Second child after chapter is not a ParaNode");
      expect(secondPara.getTextContent()).toBe("verse text ");
    });
  });

  it("should insert ParaNode with leading space and remove it", async () => {
    const { editor } = await testEnvironment();

    await pressEnterAtSelection(editor, firstVerseTextNode, 5);

    editor.getEditorState().read(() => {
      const root = $getRoot();
      const children = root.getChildren();
      expect(children.length).toBe(4);
      const firstPara = children[1];
      if (!$isParaNode(firstPara)) fail("First child after chapter is not a ParaNode");
      expect(firstPara.getTextContent()).toBe("first");
      const secondPara = children[2];
      if (!$isParaNode(secondPara)) fail("Second child after chapter is not a ParaNode");
      expect(secondPara.getTextContent()).toBe("verse text ");
    });
  });
});

function $defaultInitialEditorState() {
  const secondVerseTextNode = $createTextNode("second verse text ");

  firstVerseTextNode = $createTextNode("first verse text ");

  $getRoot().append(
    $createImmutableChapterNode("1"),
    $createParaNode().append(firstVerseTextNode),
    $createParaNode().append(secondVerseTextNode),
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
        <ParaNodePlugin />
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
