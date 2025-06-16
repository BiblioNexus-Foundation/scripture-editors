import { replaceBrothersWithBrethren } from "./delta-utils-test.data";
import { $applyUpdate, LF } from "./delta.utils";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { render, act } from "@testing-library/react";
import { $createTextNode, $getRoot, $isTextNode, LexicalEditor } from "lexical";
import Delta, { Op } from "quill-delta";
import { usjReactNodes } from "shared-react/nodes/usj";
import { $createImmutableVerseNode } from "shared-react/nodes/usj/ImmutableVerseNode";
import { $isSomeVerseNode } from "shared-react/nodes/usj/node-react.utils";
import { getDefaultViewOptions, ViewOptions } from "shared-react/views/view-options.utils";
import { TypedMarkNode } from "shared/nodes/features/TypedMarkNode";
import { $isCharNode, $createCharNode } from "shared/nodes/usj/CharNode";
import { $createImmutableChapterNode } from "shared/nodes/usj/ImmutableChapterNode";
import { $createImpliedParaNode, $isImpliedParaNode } from "shared/nodes/usj/ImpliedParaNode";
import { $isMilestoneNode } from "shared/nodes/usj/MilestoneNode";
import { $isSomeChapterNode } from "shared/nodes/usj/node.utils";
import { $createParaNode, $isParaNode } from "shared/nodes/usj/ParaNode";

const defaultViewOptions = getDefaultViewOptions();

describe("Delta Utils $applyUpdate", () => {
  let consoleDebugSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console methods before each test and provide mock implementations
    consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console methods after each test to their original implementations
    consoleDebugSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should handle an empty operations array (sanity check)", async () => {
    const { editor } = await testEnvironment();
    const ops: Op[] = [];
    editor.getEditorState().read(() => {
      expect($getRoot().getTextContent()).toBe("");
    });

    await sutApplyUpdate(editor, ops);

    expect(consoleDebugSpy).toHaveBeenCalledTimes(0);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
    editor.getEditorState().read(() => {
      expect($getRoot().getTextContent()).toBe("");
    });
  });

  it("should handle an empty operation in ops array", async () => {
    const { editor } = await testEnvironment();
    const ops: Op[] = [{}];

    await sutApplyUpdate(editor, ops);

    expect(consoleDebugSpy).toHaveBeenCalledTimes(0);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });

  describe("Retain Operations", () => {
    it("should correctly log a retain operation with a positive value", async () => {
      const { editor } = await testEnvironment();
      const ops: Op[] = [{ retain: 5 }];

      await sutApplyUpdate(editor, ops);

      expect(consoleDebugSpy).toHaveBeenNthCalledWith(1, "Retain: 5");
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
    });

    it("should correctly log a retain operation with value 0", async () => {
      const { editor } = await testEnvironment();
      const ops: Op[] = [{ retain: 0 }];

      await sutApplyUpdate(editor, ops);

      expect(consoleDebugSpy).toHaveBeenNthCalledWith(1, "Retain: 0");
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
    });

    it("should handle retain with negative value", async () => {
      const { editor } = await testEnvironment();
      const ops: Op[] = [{ retain: -5 }];

      await sutApplyUpdate(editor, ops);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid retain operation"),
      );
    });

    it("should handle retain value larger than document length", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode("Short text")));
      });
      const ops: Op[] = [{ retain: 1000 }]; // Much larger than document

      await sutApplyUpdate(editor, ops);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      expect(consoleDebugSpy).toHaveBeenCalledWith("Retain: 1000");
    });

    it("should retain with format attributes", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode("Jesus wept.")));
      });
      const ops: Op[] = [{ retain: 4, attributes: { bold: true } }];

      await sutApplyUpdate(editor, ops);

      expect(consoleDebugSpy).toHaveBeenNthCalledWith(1, "Retain: 4");
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getChildrenSize()).toBe(2);

        const t1 = p.getFirstChild();
        if (!$isTextNode(t1)) throw new Error("t1 is not a TextNode");
        expect(t1.getTextContent()).toBe("Jesu");
        expect(t1.hasFormat("bold")).toBe(true);

        const t2 = p.getChildAtIndex(1);
        if (!$isTextNode(t2)) throw new Error("t2 is not a TextNode");
        expect(t2.getTextContent()).toBe("s wept.");
        expect(t2.hasFormat("bold")).toBe(false);
      });
    });

    it("should retain 1st word with format attributes after retain without attributes", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode("Jesus wept.")));
      });
      const ops: Op[] = [{ retain: 5, attributes: { bold: true } }];

      await sutApplyUpdate(editor, ops);

      expect(consoleDebugSpy).toHaveBeenNthCalledWith(1, "Retain: 5");
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getChildrenSize()).toBe(2);

        const t1 = p.getFirstChild();
        if (!$isTextNode(t1)) throw new Error("t1 is not a TextNode");
        expect(t1.getTextContent()).toBe("Jesus");
        expect(t1.hasFormat("bold")).toBe(true);

        const t2 = p.getChildAtIndex(1);
        if (!$isTextNode(t2)) throw new Error("t2 is not a TextNode");
        expect(t2.getTextContent()).toBe(" wept.");
        expect(t2.hasFormat("bold")).toBe(false);
      });
    });

    it("should retain middle word with format attributes after retain without attributes", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode("Jesus wept.")));
      });
      const ops: Op[] = [{ retain: 6 }, { retain: 4, attributes: { bold: true } }];

      await sutApplyUpdate(editor, ops);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getChildrenSize()).toBe(3);

        const t1 = p.getFirstChild();
        if (!$isTextNode(t1)) throw new Error("t1 is not a TextNode");
        expect(t1.getTextContent()).toBe("Jesus ");
        expect(t1.hasFormat("bold")).toBe(false);

        const t2 = p.getChildAtIndex(1);
        if (!$isTextNode(t2)) throw new Error("t2 is not a TextNode");
        expect(t2.getTextContent()).toBe("wept");
        expect(t2.hasFormat("bold")).toBe(true);

        const t3 = p.getChildAtIndex(2);
        if (!$isTextNode(t3)) throw new Error("t2 is not a TextNode");
        expect(t3.getTextContent()).toBe(".");
        expect(t3.hasFormat("bold")).toBe(false);
      });
    });

    it("should retain last word with format attributes after retain without attributes", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode("Jesus wept.")));
      });
      const ops: Op[] = [{ retain: 6 }, { retain: 5, attributes: { bold: true } }];

      await sutApplyUpdate(editor, ops);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getChildrenSize()).toBe(2);

        const t1 = p.getFirstChild();
        if (!$isTextNode(t1)) throw new Error("t1 is not a TextNode");
        expect(t1.getTextContent()).toBe("Jesus ");
        expect(t1.hasFormat("bold")).toBe(false);

        const t2 = p.getChildAtIndex(1);
        if (!$isTextNode(t2)) throw new Error("t2 is not a TextNode");
        expect(t2.getTextContent()).toBe("wept.");
        expect(t2.hasFormat("bold")).toBe(true);
      });
    });

    it("should retain embedded para with attributes", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode());
      });
      const ops: Op[] = [{ retain: 1, attributes: { style: "q1" } }];

      await sutApplyUpdate(editor, ops);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getMarker()).toBe("q1");
      });
    });

    it("should retain embedded chapter with attributes", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createImmutableChapterNode("1"));
      });
      const ops: Op[] = [{ retain: 1, attributes: { number: "2" } }];

      await sutApplyUpdate(editor, ops);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const ch2 = $getRoot().getFirstChild();
        if (!$isSomeChapterNode(ch2)) throw new Error("ch2 is not SomeChapterNode");
        expect(ch2.getNumber()).toBe("2");
      });
    });

    it("should retain embedded verse with attributes", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createImmutableVerseNode("1")));
      });
      const ops: Op[] = [{ retain: 1, attributes: { number: "1-2" } }];

      await sutApplyUpdate(editor, ops);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getChildrenSize()).toBe(1);

        const v1 = p.getFirstChild();
        if (!$isSomeVerseNode(v1)) throw new Error("v1 is not SomeVerseNode");
        expect(v1.getNumber()).toBe("1-2");
      });
    });

    it("should retain embedded char", async () => {
      const wordsOfJesus = "It is finished.";
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode(`Jesus said ${wordsOfJesus}`)));
      });
      const attributes = {
        segment: "verse_1_1",
        char: { style: "wj", cid: "afd886c6-2397-4e4c-8a94-696bf9f2e545" },
      };
      const ops: Op[] = [{ retain: 11 }, { retain: wordsOfJesus.length, attributes }];

      await sutApplyUpdate(editor, ops);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getChildrenSize()).toBe(2);

        const t1 = p.getFirstChild();
        if (!$isTextNode(t1)) throw new Error("t1 is not a TextNode");
        expect(t1.getTextContent()).toBe("Jesus said ");

        const char = p.getChildAtIndex(1);
        if (!$isCharNode(char)) throw new Error("char is not a CharNode");
        expect(char.getTextContent()).toBe(wordsOfJesus);
        expect(char.getMarker()).toBe("wj");
        expect(char.getUnknownAttributes()).toEqual({
          cid: "afd886c6-2397-4e4c-8a94-696bf9f2e545",
        });
      });
    });

    it("should transform text to CharNode and apply top-level formats to inner text", async () => {
      const prefix = "Prefix ";
      const transformText = "TextToTransform";
      const suffix = " Suffix";
      const initialText = `${prefix}${transformText}${suffix}`;
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode(initialText)));
      });
      const cid = "char-id-1";
      const ops: Op[] = [
        { retain: prefix.length },
        {
          retain: transformText.length,
          attributes: { char: { style: "xt", cid }, bold: true },
        },
      ];

      await sutApplyUpdate(editor, ops);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getChildrenSize()).toBe(3); // Prefix text, CharNode, Suffix text

        const prefixTextNode = p.getFirstChild();
        if (!$isTextNode(prefixTextNode)) throw new Error("prefix is not a TextNode");
        expect(prefixTextNode.getTextContent()).toBe(prefix);

        const charNode = p.getChildAtIndex(1);
        if (!$isCharNode(charNode)) throw new Error("charNode is not a CharNode");
        expect(charNode.getMarker()).toBe("xt");
        expect(charNode.getUnknownAttributes()).toEqual({ cid });

        const innerTextNode = charNode.getFirstChild();
        if (!$isTextNode(innerTextNode)) throw new Error("innerTextNode is not a TextNode");
        expect(innerTextNode.getTextContent()).toBe(transformText);
        expect(innerTextNode.hasFormat("bold")).toBe(true); // Verify inner text formatting

        const suffixTextNode = p.getChildAtIndex(2);
        if (!$isTextNode(suffixTextNode)) throw new Error("suffix is not a TextNode");
        expect(suffixTextNode.getTextContent()).toBe(suffix);
      });
    });

    it("should fallback to standard attribute application if char.style is missing", async () => {
      const text = "FormatThisText";
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode(text)));
      });
      const ops: Op[] = [
        {
          retain: text.length,
          // 'char' object is present, but 'style' is missing. 'cid' might be for other purposes.
          // 'bold' is a standard attribute that should still apply.
          attributes: { char: { cid: "some-id" }, bold: true },
        },
      ];

      await sutApplyUpdate(editor, ops);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getChildrenSize()).toBe(1);

        const textNode = p.getFirstChild();
        if (!$isTextNode(textNode)) throw new Error("textNode is not a TextNode");
        expect(textNode.getTextContent()).toBe(text);
        expect(textNode.hasFormat("bold")).toBe(true);
      });
    });

    it("should transform text to CharNode when retain spans multiple TextNodes", async () => {
      const part1 = "FirstPart";
      const part2 = "SecondPart";
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode(part1), $createTextNode(part2)));
      });
      const cid = "speaker-id";
      const ops: Op[] = [
        {
          retain: part1.length + part2.length,
          attributes: { char: { style: "sp", cid } },
        },
      ];
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getChildrenSize()).toBe(1); // Adjacent TextNodes are combined in Lexical.
      });

      await sutApplyUpdate(editor, ops);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getChildrenSize()).toBe(1); // Original TextNodes should be replaced by one CharNode

        const charNode = p.getFirstChild();
        if (!$isCharNode(charNode)) throw new Error("charNode is not a CharNode");
        expect(charNode.getMarker()).toBe("sp");
        expect(charNode.getTextContent()).toBe(part1 + part2);
        expect(charNode.getUnknownAttributes()).toEqual({ cid });
      });
    });

    it("should fallback to standard attribute application when retain targets an existing embed for char transformation", async () => {
      const textBefore = "TextBefore ";
      const { editor } = await testEnvironment(() => {
        $getRoot().append(
          $createParaNode().append(
            $createTextNode(textBefore),
            $createImmutableVerseNode("1"), // This VerseNode has OT length 1
            $createTextNode(" TextAfter"),
          ),
        );
      });
      const ops: Op[] = [
        { retain: textBefore.length },
        {
          retain: 1, // This targets the VerseNode
          attributes: { char: { style: "xt", cid: "verse-char-attr" }, customVerseAttr: "applied" },
        },
      ];

      await sutApplyUpdate(editor, ops);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getChildrenSize()).toBe(3);

        const v1Node = p.getChildAtIndex(1);
        // Check that it's still a VerseNode, not transformed into a CharNode
        if (!$isSomeVerseNode(v1Node)) throw new Error("verseNode is not SomeVerseNode");

        // Check if 'customVerseAttr' was applied
        expect(v1Node.getUnknownAttributes()).toEqual(
          expect.objectContaining({ customVerseAttr: "applied" }),
        );
      });
    });

    // Error handling and boundary conditions

    it("should handle multiple format attributes simultaneously", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode("This is a test text.")));
      });
      const ops: Op[] = [
        { retain: 5 }, // "This "
        {
          retain: 4, // "is a"
          attributes: {
            char: { style: "bd", cid: "test-id" },
            bold: true,
          },
        },
        { retain: 11 },
      ];

      await sutApplyUpdate(editor, ops);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");

        const charNode = p.getChildAtIndex(1);
        if (!$isCharNode(charNode)) throw new Error("charNode is not a CharNode");

        expect(charNode.getMarker()).toBe("bd");
        expect(charNode.getUnknownAttributes()).toEqual(
          expect.objectContaining({ cid: "test-id" }),
        );

        // Check that inner text has bold formatting
        const innerText = charNode.getFirstChild();
        if (!$isTextNode(innerText)) throw new Error("innerText is not a TextNode");
        expect(innerText.hasFormat("bold")).toBe(true);
      });
    });

    it("should handle format removal with false attribute values", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append(
          $createParaNode().append(
            $createCharNode("bd").append($createTextNode("bold text").toggleFormat("highlight")),
            $createTextNode(" normal text"),
          ),
        );
      });
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        const charNode = p.getFirstChild();
        if (!$isCharNode(charNode)) throw new Error("charNode is not a CharNode");
        const t1 = charNode.getFirstChild();
        if (!$isTextNode(t1)) throw new Error("t1 is not a TextNode");
        expect(t1.getTextContent()).toBe("bold text");
        expect(t1.hasFormat("highlight")).toBe(true);
      });
      const ops: Op[] = [
        {
          retain: 1 + 9, // 1 (CharNode) + "bold text" length
          attributes: {
            char: false,
            highlight: false,
          },
        },
        { retain: 11 },
      ];

      await sutApplyUpdate(editor, ops);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getTextContent()).toBe("bold text normal text");

        // TODO: this should no longer be a CharNode, but a TextNode
        const charNode = p.getFirstChild();
        if (!$isCharNode(charNode)) throw new Error("charNode is not a CharNode");

        const t1 = charNode.getFirstChild();
        if (!$isTextNode(t1)) throw new Error("t1 is not a TextNode");
        expect(t1.getTextContent()).toBe("bold text");
        expect(t1.hasFormat("highlight")).toBe(false);
      });
    });

    it("should handle retain at exact text boundaries", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append(
          $createParaNode().append(
            $createTextNode("First"),
            // Adding a format prevents the TextNodes from being combined.
            $createTextNode(" Second").toggleFormat("bold"),
            $createTextNode(" Third"),
          ),
        );
      });
      const ops: Op[] = [
        { retain: 5 }, // Exactly at end of "First"
        { retain: 7, attributes: { char: { style: "it" } } }, // Exactly " Second"
        { retain: 6 }, // Exactly " Third"
      ];

      await sutApplyUpdate(editor, ops);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getChildrenSize()).toBe(3);

        const charNode = p.getChildAtIndex(1);
        if (!$isCharNode(charNode)) throw new Error("charNode is not a CharNode");
        expect(charNode.getMarker()).toBe("it");
        expect(charNode.getTextContent()).toBe(" Second");
      });
    });

    it("should handle retain spanning multiple elements", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append(
          $createParaNode().append(
            $createTextNode("Start "),
            $createCharNode("bd").append($createTextNode("bold")),
            $createTextNode(" end"),
          ),
        );
      });
      const ops: Op[] = [
        { retain: 3 }, // "Sta"
        {
          retain: 3 + 1 + 4 + 2, // "rt bold e" - spans across text, CharNode and its text, and text
          attributes: { char: { style: "it" } },
        },
        { retain: 2 }, // "nd"
      ];

      await sutApplyUpdate(editor, ops);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getTextContent()).toBe("Start bold end");
        expect(p.getChildrenSize()).toBe(5);

        const t1 = p.getFirstChild();
        if (!$isTextNode(t1)) throw new Error("t1 is not a TextNode");
        expect(t1.getTextContent()).toBe("Sta");

        const char1 = p.getChildAtIndex(1);
        if (!$isCharNode(char1)) throw new Error("char1 is not a CharNode");
        expect(char1.getMarker()).toBe("it");

        const t2 = char1.getChildAtIndex(0);
        if (!$isTextNode(t2)) throw new Error("t2 is not a TextNode");
        expect(t2.getTextContent()).toBe("rt ");

        const char2 = p.getChildAtIndex(2);
        if (!$isCharNode(char2)) throw new Error("char2 is not a CharNode");
        expect(char2.getMarker()).toBe("it");

        const t3 = char2.getChildAtIndex(0);
        if (!$isTextNode(t3)) throw new Error("t3 is not a TextNode");
        expect(t3.getTextContent()).toBe("bold");

        const char3 = p.getChildAtIndex(3);
        if (!$isCharNode(char3)) throw new Error("char3 is not a CharNode");
        expect(char3.getMarker()).toBe("it");

        const t4 = char3.getChildAtIndex(0);
        if (!$isTextNode(t4)) throw new Error("t4 is not a TextNode");
        expect(t4.getTextContent()).toBe(" e");

        const t5 = p.getChildAtIndex(4);
        if (!$isTextNode(t5)) throw new Error("t5 is not a TextNode");
        expect(t5.getTextContent()).toBe("nd");
      });
    });

    it("should handle invalid attribute values gracefully", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode("Test text")));
      });
      const ops: Op[] = [
        { retain: 4 },
        {
          retain: 4,
          attributes: {
            char: { style: "invalid-style" },
            invalidAttr: null,
            undefinedAttr: undefined,
          },
        },
        { retain: 1 },
      ];

      await sutApplyUpdate(editor, ops);

      // Should not crash, but may log warnings
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");

        // Should still apply the operation, even with invalid values
        expect(p.getTextContent()).toBe("Test text");
        expect(p.getChildrenSize()).toBe(3);

        const t1 = p.getFirstChild();
        if (!$isTextNode(t1)) throw new Error("t1 is not a TextNode");
        expect(t1.getTextContent()).toBe("Test");

        const charNode = p.getChildAtIndex(1);
        if (!$isCharNode(charNode)) throw new Error("charNode is not a CharNode");
        expect(charNode.getMarker()).toBe("invalid-style");
        // Non-string attributes (null, undefined) should be filtered out gracefully
        // The system should not crash, but these values should not be stored
        expect(charNode.getUnknownAttributes()).toBeUndefined();

        const t2 = charNode.getChildAtIndex(0);
        if (!$isTextNode(t2)) throw new Error("t2 is not a TextNode");
        expect(t2.getTextContent()).toBe(" tex");

        const t3 = p.getChildAtIndex(2);
        if (!$isTextNode(t3)) throw new Error("t3 is not a TextNode");
        expect(t3.getTextContent()).toBe("t");
      });
    });

    it("should handle retain in mixed operations context", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode("Initial text for testing")));
      });
      const ops: Op[] = [
        { retain: 8 }, // "Initial "
        { delete: 4 }, // Delete "text"
        { insert: "content" },
        { retain: 13, attributes: { char: { style: "bd" } } }, // " for testing"
      ];

      await sutApplyUpdate(editor, ops);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getTextContent()).toBe("Initial content for testing");

        // Check if a CharNode was created for the formatted text
        const lastChild = p.getLastChild();
        if ($isCharNode(lastChild)) {
          expect(lastChild.getMarker()).toBe("bd");
          expect(lastChild.getTextContent()).toBe(" for testing");
        }
      });
    });

    it("should handle conflicting attribute updates", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append(
          $createParaNode().append(
            $createCharNode("bd", { color: "red" }).append($createTextNode("formatted text")),
          ),
        );
      });
      const ops: Op[] = [
        {
          retain: 1 + 14, // 1 for CharNode + length of "formatted text"
          attributes: {
            // Keep same style but add new cid and change color
            char: { style: "bd", cid: "new-id", color: "blue" },
          },
        },
      ];

      await sutApplyUpdate(editor, ops);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");

        const charNode = p.getFirstChild();
        if (!$isCharNode(charNode)) throw new Error("charNode is not a CharNode");

        // Should maintain the style and apply new attributes
        expect(charNode.getMarker()).toBe("bd");
        expect(charNode.getUnknownAttributes()).toEqual(
          expect.objectContaining({
            cid: "new-id",
            color: "blue",
          }),
        );
      });
    });

    it("should handle zero-length retain with attributes", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode("Test text")));
      });
      const ops: Op[] = [{ retain: 0, attributes: { char: { style: "bd" } } }, { retain: 9 }];

      await sutApplyUpdate(editor, ops);

      // Zero-length retain should not crash but also should not affect content
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getTextContent()).toBe("Test text");
        expect(p.getChildrenSize()).toBe(1);
      });
    });

    it("should handle complex nested container attributes with deep nesting with cross references", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append(
          $createImmutableChapterNode("3"),
          $createParaNode().append(
            $createImmutableVerseNode("16"),
            $createCharNode("qt").append(
              $createCharNode("w").append($createTextNode("God")),
              $createTextNode(" so "),
              $createCharNode("w").append($createTextNode("loved")),
              $createTextNode(" the world"),
            ),
            $createTextNode(" that he "),
            $createCharNode("w").append($createTextNode("gave")),
            $createTextNode(" his son"),
          ),
        );
      });
      const ops: Op[] = [
        {
          retain: 1, // Chapter node at root level
          attributes: {
            pubnumber: "3a",
            altnumber: "Three",
          },
        },
        {
          retain: 1, // Verse node inside para
          attributes: {
            number: "16",
            altnumber: "sixteen",
          },
        },
        {
          retain: 1, // First CharNode (qt) - speaker attributes
          attributes: {
            who: "Jesus",
            context: "teaching",
          },
        },
        {
          retain: 1, // First nested CharNode (w for "God") - lexical data
          attributes: {
            strong: "G2316",
            lemma: "θεός",
          },
        },
        {
          // Skip "God", " so " text, next w node and text, and " the world" text
          retain: 3 + 4 + 1 + 5 + 10,
        },
        {
          retain: 9, // Text " that he "
        },
        {
          retain: 1, // Last CharNode (w for "gave") - verb analysis
          attributes: {
            strong: "G1325",
            lemma: "δίδωμι",
          },
        },
      ];

      await sutApplyUpdate(editor, ops);

      editor.getEditorState().read(() => {
        const root = $getRoot();
        expect(root.getChildrenSize()).toBe(2); // Chapter and ParaNode at root level

        const ch3 = root.getFirstChild();
        if (!$isSomeChapterNode(ch3)) throw new Error("ch3 is not SomeChapterNode");
        expect(ch3.getNumber()).toBe("3");
        expect(ch3.getPubnumber()).toBe("3a");
        expect(ch3.getAltnumber()).toBe("Three");

        const p = root.getChildAtIndex(1);
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        const children = p.getChildren();
        expect(children.length).toBe(5); // v16, qt CharNode, text, last w node, text

        const v16 = children[0];
        if (!$isSomeVerseNode(v16)) throw new Error("v16 is not SomeVerseNode");
        expect(v16.getNumber()).toBe("16");
        expect(v16.getAltnumber()).toBe("sixteen");

        const qtCharNode = children[1];
        if (!$isCharNode(qtCharNode)) throw new Error("qtCharNode is not CharNode");
        expect(qtCharNode.getMarker()).toBe("qt");
        expect(qtCharNode.getUnknownAttributes()).toEqual({
          who: "Jesus",
          context: "teaching",
        });
        const qtChildren = qtCharNode.getChildren();
        expect(qtChildren.length).toBe(4); // 2 nested w nodes and 2 text nodes

        const godCharNode = qtChildren[0];
        if (!$isCharNode(godCharNode)) throw new Error("godCharNode is not CharNode");
        expect(godCharNode.getMarker()).toBe("w");
        expect(godCharNode.getUnknownAttributes()).toEqual({
          strong: "G2316",
          lemma: "θεός",
        });

        // Check second nested w node (loved)
        const lovedCharNode = qtChildren[2];
        if (!$isCharNode(lovedCharNode)) throw new Error("lovedCharNode is not CharNode");
        expect(lovedCharNode.getMarker()).toBe("w");
        expect(lovedCharNode.getUnknownAttributes()).toBeUndefined();

        // Verify final w node (gave) received verb analysis
        const gaveCharNode = children[3];
        if (!$isCharNode(gaveCharNode)) throw new Error("gaveCharNode is not CharNode");
        expect(gaveCharNode.getMarker()).toBe("w");
        expect(gaveCharNode.getUnknownAttributes()).toEqual({
          strong: "G1325",
          lemma: "δίδωμι",
        });
      });
    });
  });

  describe("Delete Operations", () => {
    it("should correctly log a delete operation with a positive value", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append(
          $createImpliedParaNode().append(
            $createTextNode("Paul, an apostle—not from men nor through man, "),
          ),
        );
      });
      const ops: Op[] = [{ delete: 4 }];

      await sutApplyUpdate(editor, ops);

      expect(consoleDebugSpy).toHaveBeenNthCalledWith(1, "Delete: 4");
      expect(consoleDebugSpy).toHaveBeenCalledTimes(2);
      editor.getEditorState().read(() => {
        expect($getRoot().getTextContent()).toBe(", an apostle—not from men nor through man, ");
      });
    });

    it("should correctly log a delete operation with a positive value inside an embed", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append(
          $createParaNode().append(
            $createTextNode("Paul, an apostle—not from men nor through man, "),
          ),
        );
      });
      const ops: Op[] = [{ delete: 4 }];

      await sutApplyUpdate(editor, ops);

      expect(consoleDebugSpy).toHaveBeenNthCalledWith(1, "Delete: 4");
      expect(consoleDebugSpy).toHaveBeenCalledTimes(2);
      editor.getEditorState().read(() => {
        expect($getRoot().getTextContent()).toBe(", an apostle—not from men nor through man, ");
      });
    });
  });

  describe("Insert Operations", () => {
    it("should correctly log an insert operation with an empty string", async () => {
      const { editor } = await testEnvironment();
      const ops: Op[] = [{ insert: "" }];

      await sutApplyUpdate(editor, ops);

      expect(consoleDebugSpy).toHaveBeenNthCalledWith(1, "Insert: ''");
      expect(consoleDebugSpy).toHaveBeenCalledTimes(3);
      editor.getEditorState().read(() => {
        expect($getRoot().getTextContent()).toBe("");
      });
    });

    it("should insert text into an empty editor", async () => {
      const { editor } = await testEnvironment();
      const ops: Op[] = [{ insert: "Jesus wept." }];

      await sutApplyUpdate(editor, ops);

      editor.getEditorState().read(() => {
        expect($getRoot().getTextContent()).toBe("Jesus wept.");
      });
    });

    it("should insert text into an editor with empty para", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode());
      });
      const ops: Op[] = [{ insert: "Jesus wept." }];

      await sutApplyUpdate(editor, ops);

      editor.getEditorState().read(() => {
        expect($getRoot().getTextContent()).toBe("Jesus wept.");
      });
    });

    it("should replace 'brothers' with 'brethren'", async () => {
      const brothers = "brothers";
      const { editor } = await testEnvironment(() => {
        $getRoot().append(
          $createImmutableChapterNode("1"),
          $createImpliedParaNode().append(
            $createImmutableVerseNode("1"),
            $createTextNode(
              // length: 122
              "Paul, an apostle—not from men nor through man, but through Jesus Christ and God the Father, who raised him from the dead— ",
            ),
            $createImmutableVerseNode("2"),
            $createTextNode(
              // lengths: 12, 8, 46
              `and all the ${brothers} who are with me, To the churches of Galatia: `,
            ),
          ),
        );
      });
      const ops: Op[] = replaceBrothersWithBrethren.op.ops;
      // retain - 2("br") - (c1(1(embed)) + v1 + v2)
      const textIndex = 139 - 2 - 3;
      editor.getEditorState().read(() => {
        expect(
          $getRoot()
            .getTextContent()
            .slice(textIndex, textIndex + brothers.length),
        ).toBe(brothers);
      });

      await sutApplyUpdate(editor, ops);

      const brethren = "brethren";
      editor.getEditorState().read(() => {
        const textContent = $getRoot().getTextContent();
        expect(textContent.slice(textIndex, textIndex + brethren.length)).toBe(brethren);
        expect(textContent.slice(textIndex + brethren.length).startsWith(" who are with me")).toBe(
          true,
        );
      });
    });

    it("should insert a chapter embed into an empty editor", async () => {
      const { editor } = await testEnvironment();
      const ch1Embed = { chapter: { number: "1", style: "c" } };
      const ops: Op[] = [{ insert: ch1Embed }];

      await sutApplyUpdate(editor, ops);

      editor.getEditorState().read(() => {
        const ch1 = $getRoot().getFirstChild();
        if (!$isSomeChapterNode(ch1)) throw new Error("c1 is not SomeChapterNode");
        expect(ch1.getNumber()).toBe("1");
      });
    });

    it("should insert a chapter embed at the beginning of a document with existing content", async () => {
      const initialText = "Initial text.";
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode(initialText)));
      });
      const ch1Embed = { chapter: { number: "1", style: "c" } };
      // No retain, so insert happens at the current index 0 before the ParaNode.
      const ops: Op[] = [{ insert: ch1Embed }];

      await sutApplyUpdate(editor, ops);

      editor.getEditorState().read(() => {
        const root = $getRoot();
        expect(root.getChildrenSize()).toBe(2);

        const ch1 = root.getFirstChild();
        if (!$isSomeChapterNode(ch1)) throw new Error("First child is not SomeChapterNode");
        expect(ch1.getNumber()).toBe("1");

        const existingPara = root.getChildAtIndex(1);
        if (!$isParaNode(existingPara)) throw new Error("Second child is not a ParaNode");
        expect(existingPara.getTextContent()).toBe(initialText);
      });
    });

    it("should insert a chapter embed after an existing ParaNode at the root level", async () => {
      const initialText = "Some initial content in a para.";
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode(initialText)));
      });
      const ch2Embed = { chapter: { number: "2", style: "c" } };
      // Retain past the initial text in the ParaNode (length + 1 for the para itself)
      const ops: Op[] = [{ retain: 1 + initialText.length }, { insert: ch2Embed }];

      await sutApplyUpdate(editor, ops);

      editor.getEditorState().read(() => {
        const root = $getRoot();
        expect(root.getChildrenSize()).toBe(2); // ParaNode and chapter node

        const existingPara = root.getFirstChild();
        if (!$isParaNode(existingPara)) throw new Error("First child should be a ParaNode");
        expect(existingPara.getTextContent()).toBe(initialText);
        expect(existingPara.getChildrenSize()).toBe(1); // Only the TextNode

        const ch2 = root.getChildAtIndex(1);
        if (!$isSomeChapterNode(ch2)) throw new Error("Second child should be SomeChapterNode");
        expect(ch2.getNumber()).toBe("2");
      });
    });

    it("should insert a verse embed at the end of a document with existing content", async () => {
      const initialText = "Initial text.";
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode(initialText)));
      });
      const embedVerse = { verse: { number: "1", style: "v" } };
      // Retain past the initial text in the ParaNode
      const ops: Op[] = [{ retain: initialText.length }, { insert: embedVerse }];

      await sutApplyUpdate(editor, ops);

      editor.getEditorState().read(() => {
        const root = $getRoot();
        expect(root.getChildrenSize()).toBe(1); // Root should still have one ParaNode

        const paraNode = root.getFirstChild();
        if (!$isParaNode(paraNode)) throw new Error("First child is not a ParaNode");
        expect(paraNode.getChildrenSize()).toBe(2); // TextNode and VerseNode

        const textNode = paraNode.getFirstChild();
        if (!$isTextNode(textNode)) throw new Error("First child of para is not a TextNode");
        expect(textNode.getTextContent()).toBe(initialText);

        const v1Node = paraNode.getChildAtIndex(1);
        if (!$isSomeVerseNode(v1Node)) throw new Error("Second child of para is not SomeVerseNode");
        expect(v1Node.getNumber()).toBe("1");
      });
    });

    it("should insert a verse embed inside text", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode("Jesus wept.")));
      });
      const embedVerse = { verse: { number: "1", style: "v" } };
      const ops: Op[] = [{ retain: 6 }, { insert: embedVerse }];

      await sutApplyUpdate(editor, ops);

      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getChildrenSize()).toBe(3);

        const t1 = p.getFirstChild();
        if (!$isTextNode(t1)) throw new Error("t1 is not a TextNode");
        expect(t1.getTextContent()).toBe("Jesus ");

        const v1 = p.getChildAtIndex(1);
        if (!$isSomeVerseNode(v1)) throw new Error("v1 is not SomeVerseNode");
        expect(v1.getNumber()).toBe("1");

        const t2 = p.getChildAtIndex(2);
        if (!$isTextNode(t2)) throw new Error("t2 is not a TextNode");
        expect(t2.getTextContent()).toBe("wept.");
      });
    });

    it("should insert an embed when the targetIndex is out of bounds", async () => {
      const initialText = "Short text."; // Length 11
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode(initialText)));
      });
      const embedVerse = { verse: { number: "10", style: "v" } };
      // Retain past the end of the text and the ParaNode itself.
      // initialText.length (11) + 1 (for ParaNode) = 12. Retain 20.
      const ops: Op[] = [{ retain: 20 }, { insert: embedVerse }];

      await sutApplyUpdate(editor, ops);

      editor.getEditorState().read(() => {
        const root = $getRoot();
        expect(root.getChildrenSize()).toBe(2); // Root should have ParaNode and ImpliedParaNode

        const paraNode = root.getFirstChild();
        if (!$isParaNode(paraNode)) throw new Error("First child is not a ParaNode");
        expect(paraNode.getChildrenSize()).toBe(1); // Initial TextNode

        const impliedParaNode = root.getChildAtIndex(1);
        if (!$isImpliedParaNode(impliedParaNode))
          throw new Error("Second child is not an ImpliedParaNode");
        expect(impliedParaNode.getChildrenSize()).toBe(1);

        const v10Node = impliedParaNode.getFirstChild();
        if (!$isSomeVerseNode(v10Node))
          throw new Error("First child of implied para is not SomeVerseNode");
        expect(v10Node.getNumber()).toBe("10");
      });
    });

    it("should insert an embed between two existing embed nodes", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append(
          $createParaNode().append($createImmutableVerseNode("1"), $createImmutableVerseNode("3")),
        );
      });
      const v2Embed = { verse: { number: "2", style: "v" } };
      // Retain past the first VerseNode (1)
      const ops: Op[] = [{ retain: 1 }, { insert: v2Embed }];

      await sutApplyUpdate(editor, ops);

      editor.getEditorState().read(() => {
        const root = $getRoot();
        expect(root.getChildrenSize()).toBe(1); // Root should still have one ParaNode

        const paraNode = root.getFirstChild();
        if (!$isParaNode(paraNode)) throw new Error("First child is not a ParaNode");
        expect(paraNode.getChildrenSize()).toBe(3); // Verse1, VerseToInsert, Verse3

        const v1 = paraNode.getChildAtIndex(0);
        if (!$isSomeVerseNode(v1)) throw new Error("Child 0 of para is not SomeVerseNode");
        expect(v1.getNumber()).toBe("1");

        const v2 = paraNode.getChildAtIndex(1);
        if (!$isSomeVerseNode(v2)) throw new Error("Child 1 of para is not SomeVerseNode");
        expect(v2.getNumber()).toBe("2");

        const v3 = paraNode.getChildAtIndex(2);
        if (!$isSomeVerseNode(v3)) throw new Error("Child 2 of para is not SomeVerseNode");
        expect(v3.getNumber()).toBe("3");
      });
    });

    it("should insert para with attributes", async () => {
      const { editor } = await testEnvironment();
      const ops: Op[] = [{ insert: { para: { style: "q1" } } }];

      await sutApplyUpdate(editor, ops);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getMarker()).toBe("q1");
      });
    });

    it("should insert a char embed in empty para", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode());
      });
      const wordsOfJesus = "It is finished.";
      const insertCharOp = {
        insert: wordsOfJesus,
        attributes: {
          segment: "verse_1_1",
          char: { style: "wj", cid: "afd886c6-2397-4e4c-8a94-696bf9f2e545" },
        },
      };
      const ops: Op[] = [insertCharOp];

      await sutApplyUpdate(editor, ops);

      editor.getEditorState().read(() => {
        const root = $getRoot();
        expect(root.getChildrenSize()).toBe(1);

        const p = root.getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getChildrenSize()).toBe(1);

        const char = p.getFirstChild();
        if (!$isCharNode(char)) throw new Error("char is not a CharNode");
        expect(char.getTextContent()).toBe(wordsOfJesus);
        expect(char.getMarker()).toBe("wj");
        expect(char.getUnknownAttributes()).toEqual({
          cid: "afd886c6-2397-4e4c-8a94-696bf9f2e545",
        });
      });
    });

    it("should insert a char embed inside text and apply attributes after", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode("Jesus said to them")));
      });
      const wordsOfJesus = "It is finished. ";
      const insertCharOp = {
        insert: wordsOfJesus,
        attributes: {
          segment: "verse_1_1",
          char: { style: "wj", cid: "afd886c6-2397-4e4c-8a94-696bf9f2e545" },
        },
      };
      const attributes = { italic: true };
      const ops: Op[] = [{ retain: 11 }, insertCharOp, { retain: 3 }, { retain: 4, attributes }];

      await sutApplyUpdate(editor, ops);

      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getChildrenSize()).toBe(4);

        const t1 = p.getFirstChild();
        if (!$isTextNode(t1)) throw new Error("t1 is not a TextNode");
        expect(t1.getTextContent()).toBe("Jesus said ");

        const char = p.getChildAtIndex(1);
        if (!$isCharNode(char)) throw new Error("char is not a CharNode");
        expect(char.getTextContent()).toBe(wordsOfJesus);
        expect(char.getMarker()).toBe("wj");

        const t2 = p.getChildAtIndex(2);
        if (!$isTextNode(t2)) throw new Error("t2 is not a TextNode");
        expect(t2.getTextContent()).toBe("to ");
        expect(t2.hasFormat("italic")).toBe(false);

        const t3 = p.getChildAtIndex(3);
        if (!$isTextNode(t3)) throw new Error("t3 is not a TextNode");
        expect(t3.getTextContent()).toBe("them");
        expect(t3.hasFormat("italic")).toBe(true);
      });
    });

    it("should insert milestone embeds in empty para", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode());
      });
      const msStartEmbed = { ms: { style: "qt-s", status: "start", who: "Jesus" } };
      const ops: Op[] = [{ insert: msStartEmbed }];

      await sutApplyUpdate(editor, ops);

      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getChildrenSize()).toBe(1);

        const startMilestone = p.getFirstChild();
        if (!$isMilestoneNode(startMilestone))
          throw new Error("startMilestone is not a MilestoneNode");
        expect(startMilestone.getMarker()).toBe("qt-s");
        expect(startMilestone.getUnknownAttributes()).toEqual({ status: "start", who: "Jesus" });
      });
    });

    it("should insert milestone embeds before and in text", async () => {
      const text = "“So you say,” answered Jesus.";
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode().append($createTextNode(text)));
      });
      const msStartEmbed = { ms: { style: "qt-s", status: "start", who: "Jesus" } };
      const msEndEmbed = { ms: { style: "qt-e", status: "end" } };
      const ops: Op[] = [{ insert: msStartEmbed }, { retain: 13 }, { insert: msEndEmbed }];

      await sutApplyUpdate(editor, ops);

      editor.getEditorState().read(() => {
        const p = $getRoot().getFirstChild();
        if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
        expect(p.getTextContent()).toBe(text);
        expect(p.getChildrenSize()).toBe(4);

        const msStart = p.getFirstChild();
        if (!$isMilestoneNode(msStart)) throw new Error("msStart is not a MilestoneNode");
        expect(msStart.getMarker()).toBe(msStartEmbed.ms.style);

        const t1 = p.getChildAtIndex(1);
        if (!$isTextNode(t1)) throw new Error("t1 is not a TextNode");
        expect(t1.getTextContent()).toBe("“So you say,”");

        const msEnd = p.getChildAtIndex(2);
        if (!$isMilestoneNode(msEnd)) throw new Error("msEnd is not a MilestoneNode");
        expect(msEnd.getMarker()).toBe(msEndEmbed.ms.style);

        const t2 = p.getChildAtIndex(3);
        if (!$isTextNode(t2)) throw new Error("t2 is not a TextNode");
        expect(t2.getTextContent()).toBe(" answered Jesus.");
      });
    });

    it("should sequentially insert multiple items into an empty document", async () => {
      const { editor } = await testEnvironment();
      const ch1Embed = { chapter: { number: "1", style: "c" } };
      const v1Embed = { verse: { number: "1", style: "v" } };
      const v1Text = "v1 text ";
      const v1TextInsertOp = {
        attributes: {
          segment: "verse_1_1",
        },
        insert: v1Text,
      };
      const v2Embed = { verse: { number: "2", style: "v" } };
      const v2Text = "v2 text ";
      const v2TextInsertOp = {
        attributes: {
          segment: "verse_1_2",
        },
        insert: v2Text,
      };
      const milestoneEmbed = { ms: { style: "ts-s", sid: "TS1" } };
      const ops: Op[] = [
        // OT index: 0
        { insert: ch1Embed }, // 1
        { insert: v1Embed }, // 2
        v1TextInsertOp, // 10
        {
          insert: LF, // 11
        },
        { insert: v2Embed }, // 12
        v2TextInsertOp, // 20
        { insert: milestoneEmbed }, // 21
        {
          insert: LF, // 22
          attributes: {
            para: {
              style: "q1",
            },
          },
        },
      ];

      await sutApplyUpdate(editor, ops);

      editor.getEditorState().read(() => {
        const root = $getRoot();
        expect(root.getChildrenSize()).toBe(3); // ch1, existing implied-para, ParaNode

        const ch1Node = root.getChildAtIndex(0);
        if (!$isSomeChapterNode(ch1Node)) throw new Error("Child 0 is not SomeChapterNode");
        expect(ch1Node.getNumber()).toBe("1");

        const impliedParaNode = root.getChildAtIndex(1);
        if (!$isImpliedParaNode(impliedParaNode))
          throw new Error("Child 1 is not a ImpliedParaNode");
        expect(impliedParaNode.getChildrenSize()).toBe(2);

        const v1Node = impliedParaNode.getChildAtIndex(0);
        if (!$isSomeVerseNode(v1Node))
          throw new Error("Child of impliedParaNode is not SomeVerseNode");
        expect(v1Node.getNumber()).toBe("1");

        const v1TextNode = impliedParaNode.getChildAtIndex(1);
        if (!$isTextNode(v1TextNode)) throw new Error("Child of impliedParaNode is not a TextNode");
        expect(v1TextNode.getTextContent()).toBe(v1Text);

        const paraNode = root.getChildAtIndex(2);
        if (!$isParaNode(paraNode)) throw new Error("Child 1 is not a ParaNode");
        expect(paraNode.getChildrenSize()).toBe(3);
        expect(paraNode.getMarker()).toBe("q1");

        const v2Node = paraNode.getChildAtIndex(0);
        if (!$isSomeVerseNode(v2Node)) throw new Error("Child of paraNode is not SomeVerseNode");
        expect(v2Node.getNumber()).toBe("2");

        const v2TextNode = paraNode.getChildAtIndex(1);
        if (!$isTextNode(v2TextNode)) throw new Error("Child of paraNode is not a TextNode");
        expect(v2TextNode.getTextContent()).toBe(v2Text);

        const milestoneNode = paraNode.getChildAtIndex(2);
        if (!$isMilestoneNode(milestoneNode))
          throw new Error("Child of paraNode is not a MilestoneNode");
        expect(milestoneNode.getMarker()).toBe("ts-s");
        expect(milestoneNode.getSid()).toBe("TS1");
      });
    });

    describe("Line Break Handling", () => {
      it("should insert a simple line break in empty editor", async () => {
        const { editor } = await testEnvironment();
        const ops: Op[] = [{ insert: LF }];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          const root = $getRoot();
          expect(root.getChildrenSize()).toBe(1);

          const impliedPara = root.getFirstChild();
          if (!$isImpliedParaNode(impliedPara))
            throw new Error("impliedPara is not an ImpliedParaNode");
          expect(impliedPara.getChildrenSize()).toBe(0); // Empty implied para
        });
      });

      it("should insert line break with para attributes", async () => {
        const { editor } = await testEnvironment();
        const ops: Op[] = [{ insert: LF, attributes: { para: { style: "q1" } } }];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          const root = $getRoot();
          expect(root.getChildrenSize()).toBe(1);

          const paraNode = root.getFirstChild();
          if (!$isParaNode(paraNode)) throw new Error("paraNode is not a ParaNode");
          expect(paraNode.getMarker()).toBe("q1");
          expect(paraNode.getChildrenSize()).toBe(0); // Empty para
        });
      });

      it("should handle line break insertion in regular ParaNode", async () => {
        const firstLine = "First line";
        const text = " text";
        const { editor } = await testEnvironment(() => {
          $getRoot().append($createParaNode().append($createTextNode(`${firstLine}${text}`)));
        });
        const ops: Op[] = [{ retain: firstLine.length }, { insert: LF }];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          const root = $getRoot();
          expect(root.getChildrenSize()).toBe(2);

          const p1 = root.getFirstChild();
          if (!$isImpliedParaNode(p1)) throw new Error("p1 is not a ImpliedParaNode");
          expect(p1.getTextContent()).toBe(firstLine);

          const p2 = root.getChildAtIndex(1);
          if (!$isParaNode(p2)) throw new Error("p2 is not a ParaNode");
          expect(p2.getTextContent()).toBe(text);
        });
      });

      it("should split regular ParaNode when LF has different para attributes", async () => {
        const original = "Original ";
        const paragraphText = "paragraph text";
        const { editor } = await testEnvironment(() => {
          $getRoot().append(
            $createParaNode().append($createTextNode(`${original}${paragraphText}`)),
          );
        });
        const ops: Op[] = [
          { retain: original.length }, // After original
          { insert: LF, attributes: { para: { style: "q2" } } },
        ];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          const root = $getRoot();
          // Line breaks split regular ParaNodes when para attributes differ
          expect(root.getChildrenSize()).toBe(2);

          const firstPara = root.getFirstChild();
          if (!$isParaNode(firstPara)) throw new Error("firstPara is not a ParaNode");
          expect(firstPara.getTextContent()).toBe(original);
          expect(firstPara.getMarker()).toBe("q2"); // LF attributes go to FIRST paragraph

          const secondPara = root.getChildAtIndex(1);
          if (!$isParaNode(secondPara)) throw new Error("secondPara is not a ParaNode");
          expect(secondPara.getTextContent()).toBe(paragraphText);
          expect(secondPara.getMarker()).toBe("p"); // Original attributes stay on SECOND paragraph
        });
      });

      it("should insert new ParaNode before existing ParaNode when LF has different para attributes at beginning", async () => {
        const { editor } = await testEnvironment(() => {
          $getRoot().append($createParaNode().append($createTextNode("Content here")));
        });
        const ops: Op[] = [{ insert: LF, attributes: { para: { style: "q1" } } }];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          const root = $getRoot();
          // Line breaks at beginning of document create new paragraphs when para attributes are present
          expect(root.getChildrenSize()).toBe(2);

          const firstPara = root.getFirstChild();
          if (!$isParaNode(firstPara)) throw new Error("firstPara is not a ParaNode");
          expect(firstPara.getTextContent()).toBe(""); // Empty paragraph from LF
          expect(firstPara.getMarker()).toBe("q1"); // LF attributes go to first paragraph

          const secondPara = root.getChildAtIndex(1);
          if (!$isParaNode(secondPara)) throw new Error("secondPara is not a ParaNode");
          expect(secondPara.getTextContent()).toBe("Content here");
          expect(secondPara.getMarker()).toBe("p"); // Original attributes stay on second paragraph
        });
      });

      it("should create new ParaNode after existing ParaNode when LF has different para attributes at end", async () => {
        const t1 = "Full content";
        const { editor } = await testEnvironment(() => {
          $getRoot().append($createParaNode().append($createTextNode(t1)));
        });
        const ops: Op[] = [
          { retain: t1.length + 1 }, // +1 for the end of ParaNode (symbolically closed by LF)
          { insert: LF, attributes: { para: { style: "b" } } },
        ];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          const root = $getRoot();
          // Line breaks at end of regular ParaNode create new paragraphs when para attributes differ
          expect(root.getChildrenSize()).toBe(2);

          const firstPara = root.getFirstChild();
          if (!$isParaNode(firstPara)) throw new Error("firstPara is not a ParaNode");
          expect(firstPara.getTextContent()).toBe(t1);
          expect(firstPara.getMarker()).toBe("p"); // Original marker preserved

          const secondPara = root.getChildAtIndex(1);
          if (!$isParaNode(secondPara)) throw new Error("secondPara is not a ParaNode");
          expect(secondPara.getTextContent()).toBe(""); // Empty new paragraph
          expect(secondPara.getMarker()).toBe("b"); // New marker from attributes
        });
      });

      it("should create multiple ParaNodes with consecutive line breaks having different para attributes", async () => {
        const base = "Base";
        const text = " text";
        const { editor } = await testEnvironment(() => {
          $getRoot().append($createParaNode().append($createTextNode(`${base}${text}`)));
        });
        const ops: Op[] = [
          { retain: base.length }, // After base
          { insert: LF, attributes: { para: { style: "q1" } } },
          { insert: LF, attributes: { para: { style: "q2" } } },
          { insert: LF }, // No attributes - should create ImpliedParaNode
          // TODO: revise inserting ImpliedParaNode after a ParaNode - while this is technically possible here I don't think USFM allows it.
        ];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          const root = $getRoot();
          // Multiple line breaks in regular ParaNode create multiple new paragraphs
          expect(root.getChildrenSize()).toBe(4);

          const firstPara = root.getFirstChild();
          if (!$isParaNode(firstPara)) throw new Error("firstPara is not a ParaNode");
          expect(firstPara.getTextContent()).toBe(base);
          expect(firstPara.getMarker()).toBe("q1"); // First LF attributes go to first paragraph

          const secondPara = root.getChildAtIndex(1);
          if (!$isParaNode(secondPara)) throw new Error("secondPara is not a ParaNode");
          expect(secondPara.getTextContent()).toBe("");
          expect(secondPara.getMarker()).toBe("q2"); // Second LF attributes go to new first paragraph

          const thirdPara = root.getChildAtIndex(2);
          if (!$isImpliedParaNode(thirdPara))
            throw new Error("thirdPara is not an ImpliedParaNode");
          expect(thirdPara.getTextContent()).toBe("");

          const forthPara = root.getChildAtIndex(3);
          if (!$isParaNode(forthPara)) throw new Error("forthPara is not a ParaNode");
          expect(forthPara.getTextContent()).toBe(text);
          expect(forthPara.getMarker()).toBe("p"); // Original attributes end up on final paragraph
        });
      });

      it("should split ParaNode between embeds when LF has different para attributes", async () => {
        const v1Text = "First verse text";
        const v2Text = "Second verse text";
        const { editor } = await testEnvironment(() => {
          $getRoot().append(
            $createParaNode().append(
              $createImmutableVerseNode("1"),
              $createTextNode(v1Text),
              $createImmutableVerseNode("2"),
              $createTextNode(v2Text),
            ),
          );
        });
        const ops: Op[] = [
          { retain: 1 + v1Text.length }, // After v1 and v1Text
          { insert: LF, attributes: { para: { style: "q1" } } },
        ];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          const root = $getRoot();
          // Line break between embeds in regular ParaNode splits the paragraph when para attributes differ
          expect(root.getChildrenSize()).toBe(2);

          const firstPara = root.getFirstChild();
          if (!$isParaNode(firstPara)) throw new Error("firstPara is not a ParaNode");
          expect(firstPara.getChildrenSize()).toBe(2); // v1 + v1Text
          expect(firstPara.getTextContent()).toBe(v1Text);
          expect(firstPara.getMarker()).toBe("q1"); // LF attributes go to first paragraph

          const secondPara = root.getChildAtIndex(1);
          if (!$isParaNode(secondPara)) throw new Error("secondPara is not a ParaNode");
          expect(secondPara.getChildrenSize()).toBe(2); // v2 + v2Text
          expect(secondPara.getTextContent()).toBe(v2Text);
          expect(secondPara.getMarker()).toBe("p"); // Original attributes stay on second paragraph
        });
      });

      it("should split ParaNode with text formatting preservation when LF has different para attributes", async () => {
        const boldText = "Bold text ";
        const regularText = "regular text";
        const { editor } = await testEnvironment(() => {
          $getRoot().append(
            $createParaNode().append(
              $createTextNode(boldText).setFormat("bold"),
              $createTextNode(regularText),
            ),
          );
        });
        const ops: Op[] = [
          { retain: boldText.length }, // After boldText
          { insert: LF, attributes: { para: { style: "q1" } } },
        ];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          const root = $getRoot();
          // Line break in regular ParaNode splits the paragraph when para attributes differ
          expect(root.getChildrenSize()).toBe(2);

          const firstPara = root.getFirstChild();
          if (!$isParaNode(firstPara)) throw new Error("firstPara is not a ParaNode");
          expect(firstPara.getTextContent()).toBe(boldText);
          expect(firstPara.getMarker()).toBe("q1"); // LF attributes go to first paragraph
          expect(firstPara.getChildrenSize()).toBe(1); // Only the bold text
          // Check that bold formatting is preserved
          const firstText = firstPara.getFirstChild();
          if (!$isTextNode(firstText)) throw new Error("firstText is not a TextNode");
          expect(firstText.hasFormat("bold")).toBe(true);

          const secondPara = root.getChildAtIndex(1);
          if (!$isParaNode(secondPara)) throw new Error("secondPara is not a ParaNode");
          expect(secondPara.getTextContent()).toBe(regularText);
          expect(secondPara.getMarker()).toBe("p"); // Original attributes stay on second paragraph
          expect(secondPara.getChildrenSize()).toBe(1); // Only the regular text
          // Check that regular formatting is preserved
          const secondText = secondPara.getFirstChild();
          if (!$isTextNode(secondText)) throw new Error("secondText is not a TextNode");
          expect(secondText.hasFormat("bold")).toBe(false);
        });
      });

      it("should split ParaNode in complex document structure when LF has different para attributes", async () => {
        const inTheBeginning = "In the beginning ";
        const godCreated = "God created the heavens and the earth.";
        const { editor } = await testEnvironment(() => {
          $getRoot().append(
            $createImmutableChapterNode("1"),
            $createParaNode().append(
              $createImmutableVerseNode("1"),
              $createTextNode(`${inTheBeginning}${godCreated}`),
            ),
          );
        });
        const ops: Op[] = [
          { retain: 1 + 1 + inTheBeginning.length }, // After ch1 + v1 + inTheBeginning
          { insert: LF, attributes: { para: { style: "q1" } } },
        ];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          const root = $getRoot();
          // Line break in regular ParaNode splits it when para attributes differ, even in complex structure
          expect(root.getChildrenSize()).toBe(3); // ch1 + 2 paras

          const ch1 = root.getFirstChild();
          if (!$isSomeChapterNode(ch1)) throw new Error("ch1 is not SomeChapterNode");
          expect(ch1.getNumber()).toBe("1");

          const firstPara = root.getChildAtIndex(1);
          if (!$isParaNode(firstPara)) throw new Error("firstPara is not a ParaNode");
          expect(firstPara.getTextContent()).toBe(inTheBeginning);
          expect(firstPara.getMarker()).toBe("q1"); // LF attributes go to first paragraph
          expect(firstPara.getChildrenSize()).toBe(2); // v1 + inTheBeginning text

          const secondPara = root.getChildAtIndex(2);
          if (!$isParaNode(secondPara)) throw new Error("secondPara is not a ParaNode");
          expect(secondPara.getTextContent()).toBe(godCreated);
          expect(secondPara.getMarker()).toBe("p"); // Original attributes stay on second paragraph
          expect(secondPara.getChildrenSize()).toBe(1); // Only the godCreated text
        });
      });

      it("should split ParaNode gracefully even with invalid para style", async () => {
        const test = "Test";
        const content = " content";
        const { editor } = await testEnvironment(() => {
          $getRoot().append($createParaNode().append($createTextNode(`${test}${content}`)));
        });
        const ops: Op[] = [
          { retain: test.length },
          { insert: LF, attributes: { para: { style: "invalid-marker-xyz" } } },
        ];

        await sutApplyUpdate(editor, ops);

        // Should not error even with invalid style
        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          const root = $getRoot();
          // Line break in regular ParaNode splits it even with invalid style
          expect(root.getChildrenSize()).toBe(2);

          const firstPara = root.getFirstChild();
          if (!$isParaNode(firstPara)) throw new Error("firstPara is not a ParaNode");
          expect(firstPara.getTextContent()).toBe(test);
          expect(firstPara.getMarker()).toBe("invalid-marker-xyz"); // LF attributes (even invalid) go to first paragraph

          const secondPara = root.getChildAtIndex(1);
          if (!$isParaNode(secondPara)) throw new Error("secondPara is not a ParaNode");
          expect(secondPara.getTextContent()).toBe(content);
          expect(secondPara.getMarker()).toBe("p"); // Original attributes stay on second paragraph
        });
      });

      it("should split ParaNode with mixed attributes when para attributes differ", async () => {
        const mixed = "Mixed";
        const attributesTest = " attributes test";
        const { editor } = await testEnvironment(() => {
          $getRoot().append($createParaNode().append($createTextNode(`${mixed}${attributesTest}`)));
        });
        const ops: Op[] = [
          { retain: mixed.length },
          {
            insert: LF,
            attributes: {
              para: { style: "q1" },
              segment: "verse_1_1",
              customAttr: "value",
            },
          },
        ];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          const root = $getRoot();
          // Line break in regular ParaNode splits it when para attributes differ, even with mixed attributes
          expect(root.getChildrenSize()).toBe(2);

          const firstPara = root.getFirstChild();
          if (!$isParaNode(firstPara)) throw new Error("firstPara is not a ParaNode");
          expect(firstPara.getTextContent()).toBe(mixed);
          expect(firstPara.getMarker()).toBe("q1"); // LF attributes go to first paragraph

          const secondPara = root.getChildAtIndex(1);
          if (!$isParaNode(secondPara)) throw new Error("secondPara is not a ParaNode");
          expect(secondPara.getTextContent()).toBe(attributesTest);
          expect(secondPara.getMarker()).toBe("p"); // Original attributes stay on second paragraph
          // Note: non-para attributes should be ignored for line breaks???
        });
      });

      it("should replace ImpliedParaNode with ParaNode when LF has para attributes", async () => {
        const impliedParaContent = "Implied para content";
        const { editor } = await testEnvironment(() => {
          $getRoot().append($createImpliedParaNode().append($createTextNode(impliedParaContent)));
        });
        const ops: Op[] = [
          { retain: impliedParaContent.length }, // After impliedParaContent" (at the ImpliedParaNode's closing marker)
          { insert: LF, attributes: { para: { style: "q1" } } },
        ];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          const root = $getRoot();
          expect(root.getChildrenSize()).toBe(1);

          const para = root.getFirstChild();
          if (!$isParaNode(para)) throw new Error("para is not a ParaNode");
          expect(para.getMarker()).toBe("q1"); // ImpliedParaNode was replaced with ParaNode
          expect(para.getTextContent()).toBe(impliedParaContent);
        });
      });

      it("should do nothing when LF without attributes is inserted in ImpliedParaNode", async () => {
        const impliedParaContent = "Implied para content";
        const { editor } = await testEnvironment(() => {
          $getRoot().append($createImpliedParaNode().append($createTextNode(impliedParaContent)));
        });
        const ops: Op[] = [
          { retain: impliedParaContent.length }, // After impliedParaContent (at the ImpliedParaNode's closing marker)
          { insert: LF }, // No para attributes
        ];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          const root = $getRoot();
          expect(root.getChildrenSize()).toBe(1);

          const impliedPara = root.getFirstChild();
          if (!$isImpliedParaNode(impliedPara))
            throw new Error("impliedPara is not an ImpliedParaNode");
          expect(impliedPara.getTextContent()).toBe(impliedParaContent);
          expect(impliedPara.getChildrenSize()).toBe(1); // Still has only the text node
        });
      });

      it("should replace empty ImpliedParaNode with ParaNode when LF has para attributes", async () => {
        const { editor } = await testEnvironment(() => {
          $getRoot().append($createImpliedParaNode()); // Empty ImpliedParaNode
        });
        const ops: Op[] = [{ insert: LF, attributes: { para: { style: "p" } } }];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          const root = $getRoot();
          expect(root.getChildrenSize()).toBe(1);

          const para = root.getFirstChild();
          if (!$isParaNode(para)) throw new Error("para is not a ParaNode");
          expect(para.getMarker()).toBe("p");
          expect(para.getChildrenSize()).toBe(0); // Empty
        });
      });
    });

    describe("Error Handling", () => {
      it("should handle invalid embed structure gracefully", async () => {
        const { editor } = await testEnvironment();
        const invalidEmbed = { invalidType: { data: "test" } };
        const ops: Op[] = [{ insert: invalidEmbed }];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining("Cannot create LexicalNode for embed object"),
        );
      });

      it("should handle missing required attributes in chapter embeds", async () => {
        const { editor } = await testEnvironment();
        const incompleteChapter = { chapter: {} }; // Missing number
        const ops: Op[] = [{ insert: incompleteChapter }];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining("Cannot create LexicalNode for embed object"),
        );
      });

      it("should handle missing required attributes in verse embeds", async () => {
        const { editor } = await testEnvironment();
        const incompleteVerse = { verse: { style: "v" } }; // Missing number
        const ops: Op[] = [{ insert: incompleteVerse }];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining("Cannot create LexicalNode for embed object"),
        );
      });

      it("should handle invalid para style gracefully", async () => {
        const { editor } = await testEnvironment();
        const invalidPara = { para: { style: "invalid-style-123" } };
        const ops: Op[] = [{ insert: invalidPara }];

        await sutApplyUpdate(editor, ops);

        // Should not error but may log a warning
        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          const p = $getRoot().getFirstChild();
          if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
          expect(p.getMarker()).toBe("invalid-style-123"); // Should still create with invalid style
        });
      });

      it("should handle malformed char embed attributes", async () => {
        const { editor } = await testEnvironment(() => {
          $getRoot().append($createParaNode().append($createTextNode("Test text")));
        });
        const malformedCharOp = {
          insert: "char text",
          attributes: {
            char: { style: "wj" }, // Missing cid
          },
        };
        const ops: Op[] = [malformedCharOp];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          const p = $getRoot().getFirstChild();
          if (!$isParaNode(p)) throw new Error("p is not a ParaNode");
          expect(p.getChildrenSize()).toBe(2); // Should have 2 children: CharNode and TextNode

          const firstChild = p.getFirstChild();
          if (!$isCharNode(firstChild)) throw new Error("firstChild is not a CharNode");
          expect(firstChild.getMarker()).toBe("wj");
          expect(firstChild.getTextContent()).toBe("char text");

          const secondChild = p.getChildAtIndex(1);
          if (!$isTextNode(secondChild)) throw new Error("secondChild is not a TextNode");
          expect(secondChild.getTextContent()).toBe("Test text");
        });
      });

      it("should handle null or undefined insert values", async () => {
        const { editor } = await testEnvironment();
        const ops: Op[] = [{ insert: null } as unknown as Op, { insert: undefined }];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      });

      it("should handle empty embed objects", async () => {
        const { editor } = await testEnvironment();
        const ops: Op[] = [
          { insert: {} },
          { insert: { chapter: null } },
          { insert: { verse: undefined } },
        ];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(6);
      });

      it("should handle extremely large text insertions", async () => {
        const { editor } = await testEnvironment();
        const largeText = "a".repeat(100000); // 100k characters
        const ops: Op[] = [{ insert: largeText }];

        await sutApplyUpdate(editor, ops);

        // Should handle large text without errors
        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          expect($getRoot().getTextContent()).toBe(largeText);
        });
      });

      it("should handle special characters and Unicode in inserts", async () => {
        const { editor } = await testEnvironment();
        const specialText = "Text with émojis 🙏 and UTF-8 characters ñ\u200B\u2028\u2029";
        const ops: Op[] = [{ insert: specialText }];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          expect($getRoot().getTextContent()).toBe(specialText);
        });
      });

      it("should handle milestone with missing required style", async () => {
        const { editor } = await testEnvironment(() => {
          $getRoot().append($createParaNode());
        });
        const incompleteMilestone = { ms: { status: "start" } }; // Missing style
        const ops: Op[] = [{ insert: incompleteMilestone }];

        await sutApplyUpdate(editor, ops);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining("Cannot create LexicalNode for embed object"),
        );
      });

      it("should handle deeply nested malformed objects", async () => {
        const { editor } = await testEnvironment();
        const deeplyMalformed = {
          chapter: {
            number: "1",
            style: "c",
            nested: {
              invalid: {
                structure: "test",
                someProperty: "value",
              },
            },
          },
        };

        const ops: Op[] = [{ insert: deeplyMalformed }];

        await sutApplyUpdate(editor, ops);

        // Should handle without crashing even with deeply nested objects
        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        editor.getEditorState().read(() => {
          const ch = $getRoot().getFirstChild();
          if (!$isSomeChapterNode(ch)) throw new Error("ch is not SomeChapterNode");
          expect(ch.getNumber()).toBe("1");
        });
      });

      it("should handle concurrent error operations", async () => {
        const { editor } = await testEnvironment();
        const ops: Op[] = [
          { insert: { invalidType1: {} } },
          { insert: "valid text" },
          { insert: { invalidType2: { bad: "data" } } },
          { insert: { chapter: { number: "1", style: "c" } } }, // Valid
          { insert: null } as unknown as Op,
        ];

        await sutApplyUpdate(editor, ops);

        // Should have 5 errors but still process valid operations
        expect(consoleErrorSpy).toHaveBeenCalledTimes(5);
        editor.getEditorState().read(() => {
          const root = $getRoot();
          expect(root.getTextContent()).toContain("valid text");
          expect(root.getChildrenSize()).toBe(1);

          const impliedParaNode = root.getFirstChild();
          if (!$isImpliedParaNode(impliedParaNode))
            throw new Error("First child is not an ImpliedParaNode");
          expect(impliedParaNode.getChildrenSize()).toBe(2); // TextNode and SomeChapterNode

          const t1 = impliedParaNode.getFirstChild();
          if (!$isTextNode(t1)) throw new Error("First child of impliedParaNode is not a TextNode");
          expect(t1.getTextContent()).toBe("valid text");

          const ch1 = impliedParaNode.getChildAtIndex(1);
          if (!$isSomeChapterNode(ch1)) throw new Error("Second child is not SomeChapterNode");
          expect(ch1.getNumber()).toBe("1");
        });
      });
    });

    xit("Delta playground of the following test", async () => {
      const delta = new Delta()
        .insert({ chapter: { number: "1", style: "c" } })
        .insert({ para: { style: "p" } })
        .insert({ chapter: { number: "2", style: "c" } })
        .insert({ para: { style: "q1" } })
        .insert({ ms: { style: "ts-s", sid: "TS1" } });

      delta.eachLine((line, attributes, i) => console.debug(line, attributes, i));

      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      expect(consoleDebugSpy).toHaveBeenNthCalledWith(
        1,
        {
          ops: [
            { insert: { chapter: { number: "1", style: "c" } } },
            { insert: { para: { style: "p" } } },
            { insert: { chapter: { number: "2", style: "c" } } },
            { insert: { para: { style: "q1" } } },
            { insert: { ms: { style: "ts-s", sid: "TS1" } } },
          ],
        },
        {},
        0,
      );
    });
  });
});

async function testEnvironment($initialEditorState?: () => void) {
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
          nodes: [TypedMarkNode, ...usjReactNodes],
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

/** SUT (Software Under Test) to apply an OT update. */
async function sutApplyUpdate(
  editor: LexicalEditor,
  ops: Op[],
  viewOptions: ViewOptions = defaultViewOptions,
) {
  await act(async () => {
    editor.update(() => {
      $applyUpdate(ops, viewOptions, console);
    });
  });
}
