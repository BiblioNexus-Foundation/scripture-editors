import * as Y from "yjs";

describe("YJS Conflict Tests with clientID", () => {
  let doc1: Y.Doc;
  let doc2: Y.Doc;

  beforeEach(() => {
    doc1 = new Y.Doc();
    doc1.clientID = 1;
    doc2 = new Y.Doc();
    doc2.clientID = 2;
    synchronizeDocs(doc1, doc2);
  });

  afterEach(() => {
    doc1.destroy();
    doc2.destroy();
  });

  it("should merge concurrent text edits correctly", () => {
    const text1 = doc1.getText("test");
    const text2 = doc2.getText("test");
    text1.insert(0, "Hello");
    text2.insert(0, "World");

    synchronizeDocs(doc1, doc2);

    expect(text1.toString()).toBe("HelloWorld");
    expect(text2.toString()).toBe("HelloWorld");
  });

  it("should resolve concurrent array operations correctly", () => {
    const array1 = doc1.getArray<string>("test");
    const array2 = doc2.getArray<string>("test");
    array1.push(["item1"]);
    array2.push(["item2"]);

    synchronizeDocs(doc1, doc2);

    expect(array1.toArray()).toEqual(["item1", "item2"]);
    expect(array2.toArray()).toEqual(["item1", "item2"]);
  });

  it("should handle concurrent map updates correctly", () => {
    const map1 = doc1.getMap("test");
    const map2 = doc2.getMap("test");
    map1.set("key1", "value1");
    map2.set("key2", "value2");

    synchronizeDocs(doc1, doc2);

    expect(map1.toJSON()).toEqual({
      key1: "value1",
      key2: "value2",
    });
    expect(map2.toJSON()).toEqual({
      key1: "value1",
      key2: "value2",
    });
  });

  it("should handle item modification in one doc and deletion in another correctly", () => {
    const map1 = doc1.getMap("test");
    const map2 = doc2.getMap("test");
    // Initial set
    map1.set("key", "initial");
    synchronizeDocs(doc1, doc2);
    map1.set("key", "modified");
    map2.delete("key");

    synchronizeDocs(doc1, doc2);

    expect(map1.toJSON()).toEqual({ key: "modified" });
    expect(map2.toJSON()).toEqual({ key: "modified" });
  });

  it("should handle text modification in one doc and deletion in another correctly", () => {
    const text1 = doc1.getText("test");
    const text2 = doc2.getText("test");
    // Initial set
    text1.insert(0, "---ABCD---");
    synchronizeDocs(doc1, doc2);
    text1.insert(7, "EFG");
    text2.delete(0, text2.length);

    synchronizeDocs(doc1, doc2);

    expect(text1.toString()).toBe("EFG");
    expect(text2.toString()).toBe("EFG");
  });

  it("should handle text modification in an array in one doc and text creation at an earlier index in another correctly", () => {
    const array1 = doc1.getArray<string>("test");
    const array2 = doc2.getArray<string>("test");
    // Initial set
    array1.push(["", "initial"]);
    synchronizeDocs(doc1, doc2);
    const currentValue = array1.get(1);
    array1.delete(1, 1);
    array1.insert(1, [`modified ${currentValue}`]);
    array2.insert(0, ["new"]);

    synchronizeDocs(doc1, doc2);

    expect(array1.toArray()).toEqual(["new", "", "modified initial"]);
    expect(array2.toArray()).toEqual(["new", "", "modified initial"]);
  });
});

function synchronizeDocs(doc1: Y.Doc, doc2: Y.Doc): void {
  const state1 = Y.encodeStateAsUpdate(doc1);
  const state2 = Y.encodeStateAsUpdate(doc2);
  Y.applyUpdate(doc1, state2);
  Y.applyUpdate(doc2, state1);
}
