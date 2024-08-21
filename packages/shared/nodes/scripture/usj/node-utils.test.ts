import { MarkerObject } from "@biblionexus-foundation/scripture-utilities";
import { $createTextNode, $getNodeByKey, $getRoot } from "lexical";
import {
  extractNonNumberedMarkers,
  extractNumberedMarkers,
  findLastVerse,
  findThisVerse,
  getUnknownAttributes,
  isValidNumberedMarker,
  parseNumberFromMarkerText,
} from "./node.utils";
import { $createImmutableVerseNode } from "./ImmutableVerseNode";
import { $createVerseNode, VerseNode } from "./VerseNode";
import { $createParaNode } from "./ParaNode";
import { createBasicTestEnvironment } from "../../test.utils";

describe("Editor Node Utilities", () => {
  describe("isValidNumberedMarker()", () => {
    it("should not throw", async () => {
      expect(() => isValidNumberedMarker(undefined as unknown as string, [""])).not.toThrow();
    });

    it("should identify a valid numbered marker", async () => {
      expect(isValidNumberedMarker("pi1", ["pi"])).toBe(true);
    });

    it("should not identify an invalid numbered marker", async () => {
      expect(isValidNumberedMarker("pi1", ["pa"])).toBe(false);
    });

    it("should not identify a non-numbered marker", async () => {
      expect(isValidNumberedMarker("pi", ["pi"])).toBe(false);
    });
  });

  describe("extractNumberedMarkers()", () => {
    it("should not throw", async () => {
      expect(() => extractNumberedMarkers([undefined as unknown as string])).not.toThrow();
    });

    it("should extract numbered markers", async () => {
      expect(extractNumberedMarkers(["p", "pi#"])).toEqual(["pi"]);
    });
  });

  describe("extractNonNumberedMarkers()", () => {
    it("should not throw", async () => {
      expect(() => extractNonNumberedMarkers([undefined as unknown as string])).not.toThrow();
    });

    it("should extract non-numbered markers", async () => {
      expect(extractNonNumberedMarkers(["p", "pi#"])).toEqual(["p"]);
    });
  });

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
      const { editor } = createBasicTestEnvironment();
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
      const { editor } = createBasicTestEnvironment();
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

    it("should find the verse in a previous parent node", async () => {
      let t3Key: string;
      const { editor } = createBasicTestEnvironment();
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
      const { editor } = createBasicTestEnvironment();
      /**
       *         R
       *    p1       p2
       * v1 t1 v2    t2
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
  });

  describe("getUnknownAttributes()", () => {
    it("should return all unknown properties", () => {
      const unknownAttributes = getUnknownAttributes({
        type: "",
        marker: "",
        unknown: "unknown",
      } as MarkerObject);

      expect(unknownAttributes).toBeDefined();
      expect(unknownAttributes).toEqual({ unknown: "unknown" });
    });

    it("should return undefined when all properties are known", () => {
      const unknownAttributes = getUnknownAttributes({ type: "", marker: "" });

      expect(unknownAttributes).toBeUndefined();
    });
  });

  describe("parseNumberFromMarkerText()", () => {
    it("should return the default if not found", () => {
      const marker = "";
      const text = "";
      const defaultNumber = "0";

      const number = parseNumberFromMarkerText(marker, text, defaultNumber);

      expect(number).toEqual("0");
    });

    it("should return the number if found", () => {
      const marker = "c";
      const text = "\\c 1 ";
      const defaultNumber = "0";

      const number = parseNumberFromMarkerText(marker, text, defaultNumber);

      expect(number).toEqual("1");
    });
  });
});
