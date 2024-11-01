import {
  usjEmpty,
  usjGen1v1,
  usjGen1v1ImpliedPara,
  usjMarks,
  usjWithUnknownItems,
} from "utilities/src/converters/usj/converter-test.data";
import {
  createUsjDocument,
  getUsjData,
  handleUsjChanges,
  insertMarker,
  loadUsjData,
  observeUsjChanges,
  updateMarker,
} from "./usj-doc-structure";
import { MarkerContent } from "@biblionexus-foundation/scripture-utilities";

describe("Y.Doc structure for USJ", () => {
  const ydoc = createUsjDocument();

  it("should round-trip empty USJ data through Y.Doc", () => {
    loadUsjData(ydoc, usjEmpty);

    const usj = getUsjData(ydoc);

    expect(usj).toEqual(usjEmpty);
  });

  it("should round-trip USJ data through Y.Doc", () => {
    loadUsjData(ydoc, usjGen1v1);

    const usj = getUsjData(ydoc);

    expect(usj).toEqual(usjGen1v1);
  });

  it("should round-trip USJ data with implied para through Y.Doc", () => {
    loadUsjData(ydoc, usjGen1v1ImpliedPara);

    const usj = getUsjData(ydoc);

    expect(usj).toEqual(usjGen1v1ImpliedPara);
  });

  it("should round-trip USJ data with marks through Y.Doc", () => {
    loadUsjData(ydoc, usjMarks);

    const usj = getUsjData(ydoc);

    expect(usj).toEqual(usjMarks);
  });

  it("should round-trip USJ data with unknown items through Y.Doc", () => {
    loadUsjData(ydoc, usjWithUnknownItems);

    const usj = getUsjData(ydoc);

    expect(usj).toEqual(usjWithUnknownItems);
  });

  it("should index content", () => {
    loadUsjData(ydoc, usjGen1v1);
    const content = ydoc.getArray<MarkerContent>("content");
    expect(content.length).toEqual(5);
    const p1 = content.get(2);
    if (typeof p1 !== "string" && p1.content) {
      expect(p1.content.length).toEqual(8);
    } else fail("p1 should be string");
  });

  it("should update and observe changes", () => {
    loadUsjData(ydoc, usjEmpty);
    const content = ydoc.getArray<MarkerContent>("content");
    expect(content.length).toEqual(0);
    let changeCount = 0;
    observeUsjChanges(ydoc, (event, transaction) => {
      const changes = handleUsjChanges(event, transaction);
      expect(changes.length).toEqual(changeCount);
    });

    changeCount++;
    insertMarker(ydoc, 0, { type: "para", marker: "p" });
    updateMarker(ydoc, 0, { content: ["Some text."] });
    changeCount++;
    insertMarker(ydoc, 1, { type: "para", marker: "q1", content: ["A quote."] });

    expect(content.toArray()).toEqual([
      { type: "para", marker: "p", content: ["Some text."] },
      { type: "para", marker: "q1", content: ["A quote."] },
    ]);
  });
});
