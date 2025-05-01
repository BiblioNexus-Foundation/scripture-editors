import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { render, act } from "@testing-library/react";
import { $createTextNode, $getRoot, LexicalEditor, TextNode } from "lexical";
import scriptureUsjNodes from "shared/nodes/scripture/usj";
import { $createCharNode } from "shared/nodes/scripture/usj/CharNode";
import { $createImmutableChapterNode } from "shared/nodes/scripture/usj/ImmutableChapterNode";
import { $createNoteNode } from "shared/nodes/scripture/usj/NoteNode";
import { $createParaNode, ParaNode } from "shared/nodes/scripture/usj/ParaNode";
import { $expectSelectionToBe, pressKey, updateSelection } from "shared/nodes/test.utils";
import {
  $createImmutableNoteCallerNode,
  ImmutableNoteCallerNode,
} from "../nodes/scripture/usj/ImmutableNoteCallerNode";
import {
  $createImmutableVerseNode,
  ImmutableVerseNode,
} from "../nodes/scripture/usj/ImmutableVerseNode";
import { ArrowNavigationPlugin } from "./ArrowNavigationPlugin";
import TextDirectionPlugin from "./TextDirectionPlugin";

let paraNodeBeforeChapter: ParaNode;
let textNodeBeforeChapter: TextNode;
let paraNodeAfterChapter: ParaNode;
let textNodeAfterChapter: TextNode;
let verseParaNode: ParaNode;
let firstVerseTextNode: TextNode;
let secondVerseTextNodeBeforeNote: TextNode;
let secondVerseTextNodeAfterNote: TextNode;
let note2TextNode: TextNode;
let thirdVerseTextNode: TextNode;

function $defaultInitialEditorState() {
  paraNodeBeforeChapter = $createParaNode("cl");
  textNodeBeforeChapter = $createTextNode("Before Chapter");
  paraNodeAfterChapter = $createParaNode("ms");
  textNodeAfterChapter = $createTextNode("After Chapter");
  verseParaNode = $createParaNode();
  firstVerseTextNode = $createTextNode("verse1 text ");
  secondVerseTextNodeBeforeNote = $createTextNode("verse2 text before note ");
  secondVerseTextNodeAfterNote = $createTextNode("verse2 text after note ");
  note2TextNode = $createTextNode("note2 text");
  thirdVerseTextNode = $createTextNode("verse3 text ");
  $getRoot().append(
    paraNodeBeforeChapter.append(textNodeBeforeChapter),
    $createImmutableChapterNode("1"),
    paraNodeAfterChapter.append(textNodeAfterChapter),
    verseParaNode.append(
      $createImmutableVerseNode("1"),
      firstVerseTextNode,
      $createImmutableVerseNode("2"),
      secondVerseTextNodeBeforeNote,
      $createNoteNode("f", "+").append(
        $createImmutableNoteCallerNode("+", "note1 preview"),
        $createCharNode("ft").append($createTextNode("note1 text")),
      ),
      secondVerseTextNodeAfterNote,
      $createImmutableVerseNode("3"),
      $createNoteNode("f", "+").append(
        $createImmutableNoteCallerNode("+", "note2 preview"),
        $createCharNode("ft").append(note2TextNode),
      ),
      thirdVerseTextNode,
      $createImmutableVerseNode("4"),
    ),
  );
}

describe("ArrowNavigationPlugin", () => {
  describe("LTR Direction", () => {
    describe("ArrowRight", () => {
      it("should skip over ImmutableChapterNode when moving forward", async () => {
        const { editor } = await testEnvironment();
        updateSelection(editor, textNodeBeforeChapter);

        await pressKey(editor, "ArrowRight");

        editor.getEditorState().read(() => {
          $expectSelectionToBe(paraNodeAfterChapter, 0);
        });
      });

      it("should skip over ImmutableVerseNode when moving forward across paras", async () => {
        const { editor } = await testEnvironment();
        updateSelection(editor, verseParaNode, 0);

        await pressKey(editor, "ArrowRight");

        editor.getEditorState().read(() => {
          $expectSelectionToBe(firstVerseTextNode, 0);
        });
      });

      it("should skip over ImmutableVerseNode when moving forward inline", async () => {
        const { editor } = await testEnvironment();
        updateSelection(editor, firstVerseTextNode);

        await pressKey(editor, "ArrowRight");

        editor.getEditorState().read(() => {
          $expectSelectionToBe(secondVerseTextNodeBeforeNote, 0);
        });
      });

      it("should skip over ImmutableVerseNode and following NoteNode when moving forward", async () => {
        const { editor } = await testEnvironment();
        updateSelection(editor, secondVerseTextNodeAfterNote);

        await pressKey(editor, "ArrowRight");

        editor.getEditorState().read(() => {
          $expectSelectionToBe(note2TextNode);
        });
      });

      it("should skip over ImmutableVerseNode at the end of a para when moving forward", async () => {
        const { editor } = await testEnvironment();
        updateSelection(editor, thirdVerseTextNode);

        await pressKey(editor, "ArrowRight");

        editor.getEditorState().read(() => {
          $expectSelectionToBe(verseParaNode, 10);
        });
      });
    });

    describe("ArrowLeft", () => {
      it("should skip over ImmutableChapterNode when moving backward", async () => {
        const { editor } = await testEnvironment();
        updateSelection(editor, textNodeAfterChapter, 0);

        await pressKey(editor, "ArrowLeft");

        editor.getEditorState().read(() => {
          $expectSelectionToBe(paraNodeBeforeChapter, 1);
        });
      });

      it("should skip over ImmutableVerseNode when moving backward across paras", async () => {
        const { editor } = await testEnvironment();
        updateSelection(editor, firstVerseTextNode, 0);

        await pressKey(editor, "ArrowLeft");

        editor.getEditorState().read(() => {
          $expectSelectionToBe(verseParaNode, 0);
        });
      });

      it("should skip over ImmutableVerseNode when moving backward inline", async () => {
        const { editor } = await testEnvironment();
        updateSelection(editor, secondVerseTextNodeBeforeNote, 0);

        await pressKey(editor, "ArrowLeft");

        editor.getEditorState().read(() => {
          $expectSelectionToBe(firstVerseTextNode);
        });
      });

      it("should skip over NoteNode and preceding ImmutableVerseNode when moving backward", async () => {
        const { editor } = await testEnvironment();
        updateSelection(editor, thirdVerseTextNode, 0);

        await pressKey(editor, "ArrowLeft");

        editor.getEditorState().read(() => {
          $expectSelectionToBe(secondVerseTextNodeAfterNote);
        });
      });

      it("should skip over ImmutableVerseNode at the end of a para when moving backward", async () => {
        const { editor } = await testEnvironment();
        updateSelection(editor, verseParaNode, 10);

        await pressKey(editor, "ArrowLeft");

        editor.getEditorState().read(() => {
          $expectSelectionToBe(thirdVerseTextNode);
        });
      });
    });
  });

  describe("RTL Direction (basic tests only)", () => {
    describe("ArrowLeft (Forward)", () => {
      it("should skip over ImmutableChapterNode when moving forward (RTL)", async () => {
        const { editor } = await testEnvironment(undefined, "rtl");
        updateSelection(editor, textNodeBeforeChapter);

        await pressKey(editor, "ArrowLeft");

        editor.getEditorState().read(() => {
          $expectSelectionToBe(paraNodeAfterChapter, 0);
        });
      });

      it("should skip over ImmutableVerseNode when moving forward (RTL)", async () => {
        const { editor } = await testEnvironment(undefined, "rtl");
        updateSelection(editor, firstVerseTextNode);

        await pressKey(editor, "ArrowLeft");

        editor.getEditorState().read(() => {
          $expectSelectionToBe(secondVerseTextNodeBeforeNote, 0);
        });
      });

      it("should skip over ImmutableVerseNode and following NoteNode when moving forward (RTL)", async () => {
        const { editor } = await testEnvironment(undefined, "rtl");
        updateSelection(editor, secondVerseTextNodeAfterNote);

        await pressKey(editor, "ArrowLeft");

        editor.getEditorState().read(() => {
          $expectSelectionToBe(note2TextNode);
        });
      });
    });

    describe("ArrowRight (Backward)", () => {
      it("should skip over ImmutableChapterNode when moving backward (RTL)", async () => {
        const { editor } = await testEnvironment(undefined, "rtl");
        updateSelection(editor, textNodeAfterChapter, 0);

        await pressKey(editor, "ArrowRight");

        editor.getEditorState().read(() => {
          $expectSelectionToBe(paraNodeBeforeChapter, 1);
        });
      });

      it("should skip over ImmutableVerseNode when moving backward (RTL)", async () => {
        const { editor } = await testEnvironment(undefined, "rtl");
        updateSelection(editor, secondVerseTextNodeBeforeNote, 0);

        await pressKey(editor, "ArrowRight");

        editor.getEditorState().read(() => {
          $expectSelectionToBe(firstVerseTextNode);
        });
      });

      it("should skip over NoteNode and preceding ImmutableVerseNode when moving backward (RTL)", async () => {
        const { editor } = await testEnvironment(undefined, "rtl");
        updateSelection(editor, thirdVerseTextNode, 0);

        await pressKey(editor, "ArrowRight");

        editor.getEditorState().read(() => {
          $expectSelectionToBe(secondVerseTextNodeAfterNote);
        });
      });
    });
  });
});

async function testEnvironment(
  $initialEditorState: () => void = $defaultInitialEditorState,
  textDirection: "ltr" | "rtl" = "ltr",
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
        <ArrowNavigationPlugin />
        <TextDirectionPlugin textDirection={textDirection} />
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
