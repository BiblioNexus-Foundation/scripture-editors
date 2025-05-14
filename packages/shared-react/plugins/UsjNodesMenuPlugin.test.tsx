import { usjReactNodes } from "../nodes/usj";
import { $createImmutableVerseNode, ImmutableVerseNode } from "../nodes/usj/ImmutableVerseNode";
import { $isReactNodeWithMarker } from "../nodes/usj/node-react.utils";
import UsjNodesMenuPlugin from "./UsjNodesMenuPlugin";
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
  $getSelection,
  $setSelection,
  $createRangeSelection,
  $createPoint,
  TextNode,
} from "lexical";
import { $createImmutableChapterNode } from "shared/nodes/usj/ImmutableChapterNode";
import {
  $createImpliedParaNode,
  $isImpliedParaNode,
  ImpliedParaNode,
} from "shared/nodes/usj/ImpliedParaNode";
import { $createParaNode } from "shared/nodes/usj/ParaNode";
import { ScriptureReference } from "shared/utils/get-marker-action.model";

let firstVerseNode: ImmutableVerseNode;
let firstVerseTextNode: TextNode;
let secondVerseNode: ImmutableVerseNode;
let secondVerseTextNode: TextNode;
let thirdVerseNode: ImmutableVerseNode;
let thirdVerseTextNode: TextNode;

describe("UsjNodesMenuPlugin", () => {
  it("should load default initialEditorState (sanity check)", async () => {
    const { editor } = await testEnvironment();

    editor.getEditorState().read(() => {
      expect($getRoot().getTextContent()).toBe(
        "first verse text \n\nsecond verse text \n\nthird verse text ",
      );
      expect(firstVerseNode.getNumber()).toBe("1-2");
      expect(secondVerseNode.getNumber()).toBe("3a");
      expect(thirdVerseNode.getNumber()).toBe("4-5a");
    });
  });

  describe("Verse Renumbering", () => {
    it("should insert verse 3 before 3a and renumber to 4a (with verse ranges and segments)", async () => {
      const { editor } = await testEnvironment();

      await insertVerseNodeAtSelection(editor, "3", firstVerseTextNode);

      editor.getEditorState().read(() => {
        expect(firstVerseNode.getNumber()).toBe("1-2");
        expect(secondVerseNode.getNumber()).toBe("4a");
        expect(thirdVerseNode.getNumber()).toBe("5-6a");
      });
    });

    it("should insert verse 3b before 4-5 and not renumber (with verse ranges and segments)", async () => {
      const { editor } = await testEnvironment();

      await insertVerseNodeAtSelection(editor, "3b", secondVerseTextNode);

      editor.getEditorState().read(() => {
        expect(firstVerseNode.getNumber()).toBe("1-2");
        expect(secondVerseNode.getNumber()).toBe("3a");
        expect(thirdVerseNode.getNumber()).toBe("4-5a");
      });
    });

    it("should insert verse 2 before 2 and renumber to 3 (with normal verse numbers)", async () => {
      function $initialEditorState() {
        $defaultInitialEditorState();
        firstVerseNode.setNumber("1");
        secondVerseNode.setNumber("2");
        thirdVerseNode.setNumber("3");
      }
      const { editor } = await testEnvironment($initialEditorState);
      editor.getEditorState().read(() => {
        expect(firstVerseNode.getNumber()).toBe("1");
        expect(secondVerseNode.getNumber()).toBe("2");
        expect(thirdVerseNode.getNumber()).toBe("3");
      });

      await insertVerseNodeAtSelection(editor, "2", firstVerseTextNode);

      editor.getEditorState().read(() => {
        expect(firstVerseNode.getNumber()).toBe("1");
        expect(secondVerseNode.getNumber()).toBe("3");
        expect(thirdVerseNode.getNumber()).toBe("4");
      });
    });

    it("should insert verse 2 before 2 and renumber to 3 but only in chapter 1 (with normal verse numbers)", async () => {
      let ch2FirstVerseNode: ImmutableVerseNode;
      let ch2SecondVerseNode: ImmutableVerseNode;
      function $initialEditorState() {
        $defaultInitialEditorState();
        firstVerseNode.setNumber("1");
        secondVerseNode.setNumber("2");
        thirdVerseNode.setNumber("3");
        ch2FirstVerseNode = $createImmutableVerseNode("1");
        ch2SecondVerseNode = $createImmutableVerseNode("2");
        $getRoot().append(
          $createImmutableChapterNode("2"),
          $createParaNode().append(ch2FirstVerseNode, $createTextNode("first verse text ")),
          $createParaNode().append(ch2SecondVerseNode, $createTextNode("second verse text ")),
        );
      }
      const { editor } = await testEnvironment($initialEditorState);
      editor.getEditorState().read(() => {
        expect(firstVerseNode.getNumber()).toBe("1");
        expect(secondVerseNode.getNumber()).toBe("2");
        expect(thirdVerseNode.getNumber()).toBe("3");
        expect(ch2FirstVerseNode.getNumber()).toBe("1");
        expect(ch2SecondVerseNode.getNumber()).toBe("2");
      });

      await insertVerseNodeAtSelection(editor, "2", firstVerseTextNode);

      editor.getEditorState().read(() => {
        expect(firstVerseNode.getNumber()).toBe("1");
        expect(secondVerseNode.getNumber()).toBe("3");
        expect(thirdVerseNode.getNumber()).toBe("4");
        expect(ch2FirstVerseNode.getNumber()).toBe("1");
        expect(ch2SecondVerseNode.getNumber()).toBe("2");
      });
    });

    it("should get 'p' marker from implied para to enable menu there", async () => {
      let impliedPara: ImpliedParaNode;
      function $initialEditorState() {
        impliedPara = $createImpliedParaNode();
        $getRoot().append($createImmutableChapterNode("1"), impliedPara);
      }
      const { editor } = await testEnvironment($initialEditorState);

      editor.getEditorState().read(() => {
        if (!$isImpliedParaNode(impliedPara))
          throw new Error("impliedPara is not an implied para node");
        if (!$isReactNodeWithMarker(impliedPara))
          throw new Error("impliedPara is not a React node with marker");
        expect(impliedPara.getMarker()).toBe("p");
      });
    });

    it("should insert a verse when the paragraph is implied", async () => {
      function $initialEditorState() {
        firstVerseNode = $createImmutableVerseNode("1");
        firstVerseTextNode = $createTextNode("first verse text ");
        secondVerseNode = $createImmutableVerseNode("2");
        secondVerseTextNode = $createTextNode("second verse text ");
        $getRoot().append(
          $createImmutableChapterNode("1"),
          $createImpliedParaNode().append(
            firstVerseNode,
            firstVerseTextNode,
            secondVerseNode,
            secondVerseTextNode,
          ),
        );
      }
      const { editor } = await testEnvironment($initialEditorState);

      await insertVerseNodeAtSelection(editor, "2", firstVerseTextNode);

      editor.getEditorState().read(() => {
        expect(firstVerseNode.getNumber()).toBe("1");
        expect(secondVerseNode.getNumber()).toBe("3");
      });
    });
  });
});

function $defaultInitialEditorState() {
  firstVerseNode = $createImmutableVerseNode("1-2");
  firstVerseTextNode = $createTextNode("first verse text ");
  secondVerseNode = $createImmutableVerseNode("3a");
  secondVerseTextNode = $createTextNode("second verse text ");
  thirdVerseNode = $createImmutableVerseNode("4-5a");
  thirdVerseTextNode = $createTextNode("third verse text ");
  $getRoot().append(
    $createImmutableChapterNode("1"),
    $createParaNode().append(firstVerseNode, firstVerseTextNode),
    $createParaNode().append(secondVerseNode, secondVerseTextNode),
    $createParaNode().append(thirdVerseNode, thirdVerseTextNode),
  );
}

async function testEnvironment($initialEditorState: () => void = $defaultInitialEditorState) {
  const scriptureReference = { book: "GEN", chapterNum: 1, verseNum: 1 };
  // Can be changed by a test as it is returned by this function.
  // eslint-disable-next-line prefer-const
  let verseToInsert = "3";

  let editor: LexicalEditor;

  function GrabEditor() {
    [editor] = useLexicalComposerContext();
    return null;
  }

  function getMarkerAction(marker: string) {
    return {
      action: (currentEditor: { reference: ScriptureReference; editor: LexicalEditor }) => {
        if (marker !== "v") return;

        currentEditor.editor.update(() => {
          const selection = $getSelection();
          selection?.insertNodes([$createImmutableVerseNode(verseToInsert)]);
        });
      },
      label: undefined,
    };
  }

  function App() {
    return (
      <LexicalComposer
        initialConfig={{
          editorState: $initialEditorState,
          namespace: "TestEditor",
          nodes: usjReactNodes,
          onError: (error) => {
            throw error;
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
        <UsjNodesMenuPlugin
          trigger="\\"
          scrRef={scriptureReference}
          getMarkerAction={getMarkerAction}
        />
      </LexicalComposer>
    );
  }

  await act(async () => {
    render(<App />);
  });

  // `editor` is defined on React render.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return { editor: editor!, verseToInsert };
}

/**
 * Insert a VerseNode at the selection range in the LexicalEditor.
 *
 * @param editor - The LexicalEditor instance where the selection will be set.
 * @param verseToInsert - The verse to insert at the selection.
 * @param startNode - The starting TextNode of the selection.
 * @param startOffset - The offset within the startNode where the selection begins. Defaults to the
 *   end of the startNode's text content.
 * @param endNode - The ending TextNode of the selection. Defaults to the startNode.
 * @param endOffset - The offset within the endNode where the selection ends. Defaults to the
 *   end of the endNode's text content.
 */
async function insertVerseNodeAtSelection(
  editor: LexicalEditor,
  verseToInsert: string,
  startNode: TextNode,
  startOffset?: number,
  endNode?: TextNode,
  endOffset?: number,
) {
  await act(async () => {
    editor.update(() => {
      startOffset ??= startNode.getTextContentSize();
      endOffset ??= endNode ? endNode.getTextContentSize() : startOffset;
      endNode ??= startNode;
      const rangeSelection = $createRangeSelection();
      rangeSelection.anchor = $createPoint(startNode.getKey(), startOffset, "text");
      rangeSelection.focus = $createPoint(endNode.getKey(), endOffset, "text");
      $setSelection(rangeSelection);
      rangeSelection.insertNodes([$createImmutableVerseNode(verseToInsert)]);
    });
  });
}
