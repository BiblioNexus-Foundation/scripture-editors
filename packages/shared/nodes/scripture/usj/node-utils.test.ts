import { MarkerObject } from "@biblionexus-foundation/scripture-utilities";
import {
  extractNonNumberedMarkers,
  extractNumberedMarkers,
  getNextVerse,
  getUnknownAttributes,
  isValidNumberedMarker,
  parseNumberFromMarkerText,
} from "./node.utils";

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

  describe("getNextVerse()", () => {
    it("should increment the verse", () => {
      const nextVerse = getNextVerse(1, undefined);
      expect(nextVerse).toBe("2");
    });

    it("should increment the verse when empty", () => {
      const nextVerse = getNextVerse(1, "");
      expect(nextVerse).toBe("2");
    });

    it("should increment the verse when zero", () => {
      const nextVerse = getNextVerse(0, "0");
      expect(nextVerse).toBe("1");
    });

    it("should increment the end verse range", () => {
      const nextVerse = getNextVerse(1, "1-2");
      expect(nextVerse).toBe("3");
    });

    it("should increment the end verse range with more than two verses", () => {
      const nextVerse = getNextVerse(1, "1-3");
      expect(nextVerse).toBe("4");
    });

    it("should increment an open verse range", () => {
      const nextVerse = getNextVerse(1, "1-");
      expect(nextVerse).toBe("2");
    });

    it("should increment a verse range with segments", () => {
      const nextVerse = getNextVerse(1, "1a-2b");
      expect(nextVerse).toBe("3");
    });

    it("should increment a verse range with spaces", () => {
      const nextVerse = getNextVerse(1, " 1 - 2 ");
      expect(nextVerse).toBe("3");
    });

    it("should increment a verse segment", () => {
      const nextVerse = getNextVerse(1, "1a");
      expect(nextVerse).toBe("1b");
    });

    it("should increment a verse segment from 'z'", () => {
      const nextVerse = getNextVerse(1, "1z");
      expect(nextVerse).toBe("2");
    });

    it("should increment a verse segment from 'Z'", () => {
      const nextVerse = getNextVerse(1, "1Z");
      expect(nextVerse).toBe("2");
    });
  });
});
