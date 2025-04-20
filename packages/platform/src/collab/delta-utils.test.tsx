import { $applyUpdate } from "./delta.utils";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { render, act } from "@testing-library/react";
import { $createTextNode, $getRoot, LexicalEditor } from "lexical";
import { DeltaOperation } from "rich-text";
import { usjReactNodes } from "shared-react/nodes/usj";
import { $createImmutableVerseNode } from "shared-react/nodes/usj/ImmutableVerseNode";
import { LoggerBasic } from "shared/adaptors/logger-basic.model";
import { TypedMarkNode } from "shared/nodes/features/TypedMarkNode";
import { $createImmutableChapterNode } from "shared/nodes/usj/ImmutableChapterNode";
import { $createImpliedParaNode } from "shared/nodes/usj/ImpliedParaNode";
import { $createParaNode } from "shared/nodes/usj/ParaNode";

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
    const ops: DeltaOperation[] = [];
    editor.getEditorState().read(() => {
      expect($getRoot().getTextContent()).toBe("");
    });

    await sutApplyUpdate(editor, ops, console);

    expect(consoleDebugSpy).toHaveBeenCalledTimes(0);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
    editor.getEditorState().read(() => {
      expect($getRoot().getTextContent()).toBe("");
    });
  });

  it("should handle an empty operation in ops array", async () => {
    const { editor } = await testEnvironment();
    const ops: DeltaOperation[] = [{}];

    await sutApplyUpdate(editor, ops, console);

    expect(consoleDebugSpy).toHaveBeenCalledTimes(0);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
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
      const ops: DeltaOperation[] = [{ delete: 4 }];

      await sutApplyUpdate(editor, ops, console);

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
      const ops: DeltaOperation[] = [{ retain: 1 }, { delete: 4 }];

      await sutApplyUpdate(editor, ops, console);

      expect(consoleDebugSpy).toHaveBeenNthCalledWith(1, "Retain: 1");
      expect(consoleDebugSpy).toHaveBeenNthCalledWith(2, "Delete: 4");
      expect(consoleDebugSpy).toHaveBeenCalledTimes(3);
      editor.getEditorState().read(() => {
        expect($getRoot().getTextContent()).toBe(", an apostle—not from men nor through man, ");
      });
    });
  });

  describe("Retain Operations", () => {
    it("should correctly log a retain operation with a positive value", async () => {
      const { editor } = await testEnvironment();
      const ops: DeltaOperation[] = [{ retain: 5 }];

      await sutApplyUpdate(editor, ops, console);

      expect(consoleDebugSpy).toHaveBeenNthCalledWith(1, "Retain: 5");
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
    });

    it("should correctly log a retain operation with value 0", async () => {
      const { editor } = await testEnvironment();
      const ops: DeltaOperation[] = [{ retain: 0 }];

      await sutApplyUpdate(editor, ops, console);

      expect(consoleDebugSpy).toHaveBeenNthCalledWith(1, "Retain: 0");
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("Insert Operations", () => {
    it("should correctly log an insert operation with an empty string", async () => {
      const { editor } = await testEnvironment();
      const ops: DeltaOperation[] = [{ insert: "" }];

      await sutApplyUpdate(editor, ops, console);

      expect(consoleDebugSpy).toHaveBeenNthCalledWith(1, "Insert: ");
      expect(consoleDebugSpy).toHaveBeenCalledTimes(2);
      editor.getEditorState().read(() => {
        expect($getRoot().getTextContent()).toBe("");
      });
    });

    it("should insert text into an empty editor", async () => {
      const { editor } = await testEnvironment();
      const ops: DeltaOperation[] = [{ insert: "Hello World" }];

      await sutApplyUpdate(editor, ops, console);

      editor.getEditorState().read(() => {
        expect($getRoot().getTextContent()).toBe("Hello World");
      });
    });

    it("should insert text into an editor with empty para", async () => {
      const { editor } = await testEnvironment(() => {
        $getRoot().append($createParaNode());
      });
      const ops: DeltaOperation[] = [{ insert: "Hello World" }];

      await sutApplyUpdate(editor, ops, console);

      editor.getEditorState().read(() => {
        expect($getRoot().getTextContent()).toBe("Hello World");
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
      const ops: DeltaOperation[] = replaceBrothersWithBrethren.op.ops;
      // retain - (c1(1(embed)  + embed text size) + v1 + v2) + 1(zero-based)
      const textIndex = 139 - 6 + 1;
      editor.getEditorState().read(() => {
        expect(
          $getRoot()
            .getTextContent()
            .slice(textIndex, textIndex + brothers.length),
        ).toBe(brothers);
      });

      await sutApplyUpdate(editor, ops, console);

      const brethren = "brethren";
      editor.getEditorState().read(() => {
        expect(
          $getRoot()
            .getTextContent()
            .slice(textIndex, textIndex + brethren.length),
        ).toBe(brethren);
      });
    });

    it("should correctly log an insert operation with an object (embed)", async () => {
      const { editor } = await testEnvironment();
      const embedObject = { image: "url/to/image.png" };
      const ops: DeltaOperation[] = [{ insert: embedObject }];

      await sutApplyUpdate(editor, ops, console);

      expect(consoleDebugSpy).toHaveBeenNthCalledWith(1, `Insert: [object Object]`);
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
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

async function sutApplyUpdate(editor: LexicalEditor, ops: DeltaOperation[], logger?: LoggerBasic) {
  await act(async () => {
    editor.update(() => {
      $applyUpdate(ops, logger);
    });
  });
}

const replaceBrothersWithBrethren = {
  _id: {
    $oid: "68257f8be096d5ea4cc760cc",
  },
  src: "f95a8c5541d6c3748fcd245837860b5c",
  seq: 12,
  v: 16,
  mv: null,
  d: "5f500fef446b244dd557fee1:GAL:1:target",
  m: {
    ts: 1747287947212,
    uId: "5f7ce00510e59f1100bc58d1",
    source: "Editor",
  },
  op: {
    ops: [
      {
        retain: 139,
      },
      {
        attributes: {
          segment: "verse_1_2",
        },
        insert: "e",
      },
      {
        delete: 1,
      },
      {
        retain: 2,
      },
      {
        attributes: {
          segment: "verse_1_2",
        },
        insert: "ren",
      },
      {
        delete: 3,
      },
    ],
  },
  o: {
    $oid: "68257f88e096d5ea4cc760cb",
  },
};

const initialDoc = {
  _id: "5f500fef446b244dd557fee1:GAL:1:target",
  ops: [
    {
      insert: {
        chapter: {
          number: "1",
          style: "c",
        },
      },
    },
    {
      insert: {
        verse: {
          number: "1",
          style: "v",
        },
      },
    },
    {
      attributes: {
        segment: "verse_1_1",
      },
      insert:
        "Paul, an apostle—not from men nor through man, but through Jesus Christ and God the Father, who raised him from the dead— ",
    },
    {
      insert: {
        verse: {
          number: "2",
          style: "v",
        },
      },
    },
    {
      attributes: {
        segment: "verse_1_2",
      },
      insert: "and all the brothers who are with me, To the churches of Galatia: ",
    },
    {
      insert: {
        verse: {
          number: "3",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_3",
      },
    },
    {
      insert: {
        verse: {
          number: "4",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_4",
      },
    },
    {
      insert: {
        verse: {
          number: "5",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_5",
      },
    },
    {
      insert: {
        verse: {
          number: "6",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_6",
      },
    },
    {
      insert: {
        verse: {
          number: "7",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_7",
      },
    },
    {
      insert: {
        verse: {
          number: "8",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_8",
      },
    },
    {
      insert: {
        verse: {
          number: "9",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_9",
      },
    },
    {
      insert: {
        verse: {
          number: "10",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_10",
      },
    },
    {
      insert: {
        verse: {
          number: "11",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_11",
      },
    },
    {
      insert: {
        verse: {
          number: "12",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_12",
      },
    },
    {
      insert: {
        verse: {
          number: "13",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_13",
      },
    },
    {
      insert: {
        verse: {
          number: "14",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_14",
      },
    },
    {
      insert: {
        verse: {
          number: "15",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_15",
      },
    },
    {
      insert: {
        verse: {
          number: "16",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_16",
      },
    },
    {
      insert: {
        verse: {
          number: "17",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_17",
      },
    },
    {
      insert: {
        verse: {
          number: "18",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_18",
      },
    },
    {
      insert: {
        verse: {
          number: "19",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_19",
      },
    },
    {
      insert: {
        verse: {
          number: "20",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_20",
      },
    },
    {
      insert: {
        verse: {
          number: "21",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_21",
      },
    },
    {
      insert: {
        verse: {
          number: "22",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_22",
      },
    },
    {
      insert: {
        verse: {
          number: "23",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_23",
      },
    },
    {
      insert: {
        verse: {
          number: "24",
          style: "v",
        },
      },
    },
    {
      insert: {
        blank: true,
      },
      attributes: {
        segment: "verse_1_24",
      },
    },
    {
      insert: "\n",
    },
  ],
  _type: "http://sharejs.org/types/rich-text/v1",
  _v: 5,
  _m: {
    ctime: 1723579954838,
    mtime: 1747287819342,
  },
  _o: {
    $oid: "68257f0be096d5ea4cc760be",
  },
};
