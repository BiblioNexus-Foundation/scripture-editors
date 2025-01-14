import { $createTextNode, $getNodeByKey, $getRoot } from "lexical";
import { $createTypedMarkNode, TypedMarkNode } from "shared/nodes/features/TypedMarkNode";
import {
  $createImmutableChapterNode,
  ImmutableChapterNode,
} from "shared/nodes/scripture/usj/ImmutableChapterNode";
import { $createParaNode, ParaNode } from "shared/nodes/scripture/usj/ParaNode";
import { $createVerseNode, VerseNode } from "shared/nodes/scripture/usj/VerseNode";
import { createBasicTestEnvironment } from "shared/nodes/test.utils";
import { findLastVerse, findThisVerse } from "./node-react.utils";
import { $createImmutableVerseNode, ImmutableVerseNode } from "./ImmutableVerseNode";

describe("Editor Node Utilities", () => {
  describe("findLastVerse()", () => {
    it("should find the last verse in node", async () => {
      const { editor } = createBasicTestEnvironment();
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
        const verseNode = findLastVerse<VerseNode>(root.getChildren(), VerseNode);

        expect(verseNode).toBeDefined();
        expect(verseNode?.getNumber()).toEqual("2");
      });
    });

    it("should find the last immutable verse in node", async () => {
      const { editor } = createBasicTestEnvironment([ParaNode, ImmutableVerseNode]);
      await editor.update(() => {
        const root = $getRoot();
        const p1 = $createParaNode();
        const v1 = $createImmutableVerseNode("1");
        const v2 = $createImmutableVerseNode("2");
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
      const { editor } = createBasicTestEnvironment([ParaNode, ImmutableVerseNode]);
      /*
       *    root
       *     p1
       * v1 t1 v2 t2
       *          ^^
       */
      await editor.update(() => {
        const root = $getRoot();
        const p1 = $createParaNode();
        const v1 = $createImmutableVerseNode("1");
        const v2 = $createImmutableVerseNode("2");
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

    it("should find the last verse in node when the text is in a mark", async () => {
      let t2Key: string;
      const { editor } = createBasicTestEnvironment([ParaNode, ImmutableVerseNode, TypedMarkNode]);
      /*
       *    root
       *     p1
       * v1 t1 v2 m1(t2)
       *             ^^
       */
      await editor.update(() => {
        const root = $getRoot();
        const p1 = $createParaNode();
        const v1 = $createImmutableVerseNode("1");
        const v2 = $createImmutableVerseNode("2");
        const t1 = $createTextNode("text1");
        const m1 = $createTypedMarkNode({ ["testType1"]: ["testID1"] });
        const t2 = $createTextNode("text2");
        root.append(p1);
        p1.append(v1, t1, v2, m1);
        m1.append(t2);
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
      const { editor } = createBasicTestEnvironment([ParaNode, ImmutableVerseNode]);
      /*
       *         root
       *   p1     p2    p3
       * v1 t1    t2    t3
       *                ^^
       */
      await editor.update(() => {
        const root = $getRoot();
        const p1 = $createParaNode();
        const p2 = $createParaNode();
        const p3 = $createParaNode();
        const v1 = $createImmutableVerseNode("1");
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
      const { editor } = createBasicTestEnvironment([ParaNode, ImmutableVerseNode]);
      /*
       *       root
       *    p1       p2
       * v1 t1 v2    t2
       *             ^^
       */
      await editor.update(() => {
        const root = $getRoot();
        const p1 = $createParaNode();
        const p2 = $createParaNode();
        const v1 = $createImmutableVerseNode("1");
        const v2 = $createImmutableVerseNode("2");
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

    it("should not find a verse if a chapter is encountered first from para", async () => {
      let p2Key: string;
      const { editor } = createBasicTestEnvironment([
        ImmutableChapterNode,
        ImmutableVerseNode,
        ParaNode,
      ]);
      /*
       *   root
       * p1 c1 p2
       * v1    ^^
       */
      await editor.update(() => {
        const root = $getRoot();
        const p1 = $createParaNode();
        const v1 = $createImmutableVerseNode("1");
        const c1 = $createImmutableChapterNode("1");
        const p2 = $createParaNode();
        root.append(p1, c1, p2);
        p1.append(v1);
        p2Key = p2.getKey();
      });

      await editor.getEditorState().read(() => {
        const p2 = $getNodeByKey(p2Key);
        const verseNode = findThisVerse(p2);

        expect(verseNode).toBeUndefined();
      });
    });

    it("should not find a verse if a chapter is encountered first from text", async () => {
      let t1Key: string;
      const { editor } = createBasicTestEnvironment([
        ImmutableChapterNode,
        ImmutableVerseNode,
        ParaNode,
      ]);
      /*
       *   root
       * p1 c1 p2
       * v1    t1
       *       ^^
       */
      await editor.update(() => {
        const root = $getRoot();
        const p1 = $createParaNode();
        const v1 = $createImmutableVerseNode("1");
        const c1 = $createImmutableChapterNode("1");
        const p2 = $createParaNode();
        const t1 = $createTextNode("text1");
        root.append(p1, c1, p2);
        p1.append(v1);
        p2.append(t1);
        t1Key = t1.getKey();
      });

      await editor.getEditorState().read(() => {
        const t1 = $getNodeByKey(t1Key);
        const verseNode = findThisVerse(t1);

        expect(verseNode).toBeUndefined();
      });
    });
  });
});
