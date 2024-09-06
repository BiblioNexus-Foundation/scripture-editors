import { MarkerObject } from "@biblionexus-foundation/scripture-utilities";
import {
  extractNonNumberedMarkers,
  extractNumberedMarkers,
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
});
