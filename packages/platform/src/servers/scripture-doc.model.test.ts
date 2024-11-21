import * as Y from "yjs";
import { MarkerObject } from "@biblionexus-foundation/scripture-utilities";
import {
  usjEmpty,
  usjGen1v1,
  usjGen1v1ImpliedPara,
  usjMarks,
  usjWithUnknownItems,
} from "utilities/src/converters/usj/converter-test.data";
import { ScriptureDocument } from "./scripture-doc.model";

describe("Y.Doc structure for USX and USJ", () => {
  const sDoc = new ScriptureDocument();

  it("should round-trip empty USJ data through Y.Doc", () => {
    sDoc.initFromUsj(usjEmpty);

    const usj = sDoc.toUsj();

    expect(usj).toEqual(usjEmpty);
  });

  it("should round-trip USJ data through Y.Doc", () => {
    sDoc.initFromUsj(usjGen1v1);

    const usj = sDoc.toUsj();

    expect(usj).toEqual(usjGen1v1);
  });

  it("should round-trip USJ data with implied para through Y.Doc", () => {
    sDoc.initFromUsj(usjGen1v1ImpliedPara);

    const usj = sDoc.toUsj();

    expect(usj).toEqual(usjGen1v1ImpliedPara);
  });

  it("should round-trip USJ data with marks through Y.Doc", () => {
    sDoc.initFromUsj(usjMarks);

    const usj = sDoc.toUsj();

    expect(usj).toEqual(usjMarks);
  });

  it("should round-trip USJ data with unknown items through Y.Doc", () => {
    sDoc.initFromUsj(usjWithUnknownItems);
    const optbreak = sDoc.getElementAt([3]);
    expect(optbreak?.nodeName).toBe("optbreak");
    expect(optbreak?.getAttribute("style")).toBeUndefined();

    const usj = sDoc.toUsj();

    expect(usj).toEqual(usjWithUnknownItems);
  });

  it("should index content", () => {
    sDoc.initFromUsj(usjGen1v1);
    const content = sDoc.doc.getXmlElement("content");
    expect(content.length).toBe(5);

    const p1 = content.get(2);

    expect(p1 instanceof Y.XmlElement).toBe(true);
    if (p1 instanceof Y.XmlElement) {
      expect(p1.length).toBe(8);
    }

    const p1Other = sDoc.getElementAt([2]);

    expect(p1Other).toBe(p1);
  });

  it("should update verse number", () => {
    sDoc.initFromUsj(usjGen1v1);
    expect(((usjGen1v1.content[2] as MarkerObject).content?.[2] as MarkerObject).number).toBe("2");

    const p1v2 = sDoc.getElementAt([2, 2]);
    p1v2?.setAttribute("number", "3");

    const usj = sDoc.toUsj();
    expect(((usj.content[2] as MarkerObject).content?.[2] as MarkerObject).number).toBe("3");
  });

  it("should insert verse text", () => {
    sDoc.initFromUsj(usjGen1v1);
    expect((usjGen1v1.content[2] as MarkerObject).content?.[1] as string).toBe("the first verse ");

    const p1v1Text = sDoc.getTextAt([2, 1]);
    if (p1v1Text) p1v1Text.insert(16, "New text");

    expect(p1v1Text).toBeDefined();
    const usj = sDoc.toUsj();
    expect((usj.content[2] as MarkerObject).content?.[1] as string).toBe(
      "the first verse New text",
    );
  });

  it("should insert and observe changes", () => {
    sDoc.initFromUsj(usjEmpty);
    const content = sDoc.doc.getXmlElement("content");
    expect(content.length).toBe(0);
    let changeCount = 0;
    sDoc.observe((event) => {
      expect(event.length).toBe(1);
      changeCount++;
    });

    sDoc.insertAtElement([0], [{ type: "para", marker: "p", content: ["Some text."] }]);
    sDoc.insertAtElement(
      [1],
      [
        { type: "para", marker: "q1", content: ["A quote."] },
        { type: "para", marker: "q2", content: ["Another quote."] },
      ],
    );

    expect(sDoc.toUsj().content).toEqual([
      { type: "para", marker: "p", content: ["Some text."] },
      { type: "para", marker: "q1", content: ["A quote."] },
      { type: "para", marker: "q2", content: ["Another quote."] },
    ]);
    expect(changeCount).toBe(2);
  });
});
