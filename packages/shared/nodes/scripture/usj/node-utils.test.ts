import {
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  CreateEditorArgs,
  LexicalEditor,
  createEditor,
} from "lexical";
import { findLastVerse, findThisVerse } from "./node.utils";
import { $createVerseNode } from "./VerseNode";
import { $createParaNode } from "./ParaNode";
import scriptureUsjNodes from ".";

type TestEnv = {
  editor: LexicalEditor;
  container?: HTMLElement;
};

describe("Editor Node Utilities", () => {
  describe("findLastVerse()", () => {
    it("should find the last verse in node", async () => {
      const { editor } = initializeUnitTest();
      await editor.update(() => {
        const root = $getRoot();
        const p1 = $createParaNode();
        const v1 = $createVerseNode("1");
        const v2 = $createVerseNode("2");
        const t1 = $createTextNode("text1");
        const t2 = $createTextNode("text2");
        root.append(p1);
        p1.append(v1, t1, v2, t2);
      });

      await editor.getEditorState().read(() => {
        const root = $getRoot();
        const verseNode = findLastVerse(root.getChildren());

        expect(verseNode).toBeDefined();
        expect(verseNode?.getNumber()).toEqual("2");
      });
    });
  });

  describe("findThisVerse()", () => {
    it("should find the last verse in node", async () => {
      let t2Key: string;
      const { editor } = initializeUnitTest();
      await editor.update(() => {
        const root = $getRoot();
        const p1 = $createParaNode();
        const v1 = $createVerseNode("1");
        const v2 = $createVerseNode("2");
        const t1 = $createTextNode("text1");
        const t2 = $createTextNode("text2");
        root.append(p1);
        p1.append(v1, t1, v2, t2);
        t2Key = t2.getKey();
      });

      await editor.getEditorState().read(() => {
        const t2 = $getNodeByKey(t2Key);
        const verseNode = findThisVerse(t2);

        expect(verseNode).toBeDefined();
        expect(verseNode?.getNumber()).toEqual("2");
      });
    });

    it("should find the verse in a previous parent node", async () => {
      let t3Key: string;
      const { editor } = initializeUnitTest();
      /**
       *          R
       *   p1     p2     p3
       * v1 t1    t2     t3
       */
      await editor.update(() => {
        const root = $getRoot();
        const p1 = $createParaNode();
        const p2 = $createParaNode();
        const p3 = $createParaNode();
        const v1 = $createVerseNode("1");
        const t1 = $createTextNode("text1");
        const t2 = $createTextNode("text2");
        const t3 = $createTextNode("text3");
        root.append(p1, p2, p3);
        p1.append(v1, t1);
        p2.append(t2);
        p3.append(t3);
        t3Key = t3.getKey();
      });

      await editor.getEditorState().read(() => {
        const t3 = $getNodeByKey(t3Key);
        const verseNode = findThisVerse(t3);

        expect(verseNode).toBeDefined();
        expect(verseNode?.getNumber()).toEqual("1");
      });
    });

    it("should find the last verse in the previous parent node", async () => {
      let t2Key: string;
      const { editor } = initializeUnitTest();
      /**
       *         R
       *    p1       p2
       * v1 t1 v2    t2
       */
      await editor.update(() => {
        const root = $getRoot();
        const p1 = $createParaNode();
        const p2 = $createParaNode();
        const v1 = $createVerseNode("1");
        const v2 = $createVerseNode("2");
        const t1 = $createTextNode("text1");
        const t2 = $createTextNode("text2");
        root.append(p1, p2);
        p1.append(v1, t1, v2);
        p2.append(t2);
        t2Key = t2.getKey();
      });

      await editor.getEditorState().read(() => {
        const t2 = $getNodeByKey(t2Key);
        const verseNode = findThisVerse(t2);

        expect(verseNode).toBeDefined();
        expect(verseNode?.getNumber()).toEqual("2");
      });
    });
  });
});

function initializeUnitTest(): TestEnv {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const config: CreateEditorArgs = {
    namespace: "TestEditor",
    onError(error) {
      throw error;
    },
    nodes: scriptureUsjNodes,
  };
  const editor = createEditor(config);
  editor.setRootElement(container);

  const testEnv: TestEnv = {
    container,
    editor,
  };

  return testEnv;
}
