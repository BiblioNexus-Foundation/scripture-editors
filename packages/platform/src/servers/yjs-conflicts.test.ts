import * as Y from "yjs";

interface Operation {
  doc: 1 | 2;
  operation: (doc: Y.Doc) => void;
}

describe("YJS Conflict Tests", () => {
  let env: TestEnvironment;
  let doc1: Y.Doc;
  let doc2: Y.Doc;

  beforeEach(() => {
    env = new TestEnvironment();
    doc1 = env.createDoc();
    doc2 = env.createDoc();
  });

  afterEach(() => {
    doc1.destroy();
    doc2.destroy();
  });

  it("should merge concurrent text edits correctly", async () => {
    const text1 = doc1.getText("test");
    const text2 = doc2.getText("test");

    await env.simulateConflict(doc1, doc2, [
      {
        doc: 1,
        operation: () => text1.insert(0, "Hello"),
      },
      {
        doc: 2,
        operation: () => text2.insert(0, "World"),
      },
    ]);

    expect(text1.toString()).toBe("WorldHello");
    expect(text2.toString()).toBe("WorldHello");
  });

  it("should resolve concurrent array operations correctly", async () => {
    const array1 = doc1.getArray<string>("test");
    const array2 = doc2.getArray<string>("test");

    await env.simulateConflict(doc1, doc2, [
      {
        doc: 1,
        operation: () => array1.push(["item1"]),
      },
      {
        doc: 2,
        operation: () => array2.push(["item2"]),
      },
    ]);

    expect(array1.toArray()).toEqual(["item1", "item2"]);
    expect(array2.toArray()).toEqual(["item1", "item2"]);
  });

  it("should handle concurrent map updates correctly", async () => {
    const map1 = doc1.getMap("test");
    const map2 = doc2.getMap("test");

    await env.simulateConflict(doc1, doc2, [
      {
        doc: 1,
        operation: () => map1.set("key1", "value1"),
      },
      {
        doc: 2,
        operation: () => map2.set("key2", "value2"),
      },
    ]);

    expect(map1.toJSON()).toEqual({
      key1: "value1",
      key2: "value2",
    });
    expect(map2.toJSON()).toEqual({
      key1: "value1",
      key2: "value2",
    });
  });

  it("should handle item modification in one doc and deletion in another correctly", async () => {
    const map1 = doc1.getMap("test");
    const map2 = doc2.getMap("test");
    // Initial set
    map1.set("key", "initial");

    await env.simulateConflict(doc1, doc2, [
      {
        doc: 1,
        operation: () => map1.set("key", "modified"),
      },
      {
        doc: 2,
        operation: () => map2.delete("key"),
      },
    ]);

    expect(map1.toJSON()).toEqual({});
    expect(map2.toJSON()).toEqual({});
  });

  it("should handle text modification in one doc and deletion in another correctly", async () => {
    const text1 = doc1.getText("test");
    const text2 = doc2.getText("test");
    // Initial set
    text1.insert(0, "initial");

    await env.simulateConflict(doc1, doc2, [
      {
        doc: 1,
        operation: () => text1.insert(0, "modified"),
      },
      {
        doc: 2,
        operation: () => text2.delete(0, text2.length),
      },
    ]);

    expect(text1.toString()).toBe("");
    expect(text2.toString()).toBe("");
  });

  it("should handle text modification in an array in one doc and text creation at an earlier index in another correctly", async () => {
    const array1 = doc1.getArray<string>("test");
    const array2 = doc2.getArray<string>("test");
    // Initial set
    array1.push(["initial"]);

    await env.simulateConflict(doc1, doc2, [
      {
        doc: 1,
        operation: () => {
          const currentValue = array1.get(0);
          array1.delete(0, 1);
          array1.insert(0, [`modified ${currentValue}`]);
        },
      },
      {
        doc: 2,
        operation: () => array2.insert(0, ["new"]),
      },
    ]);

    expect(array1.toArray()).toEqual(["new", "modified initial"]);
    expect(array2.toArray()).toEqual(["new", "modified initial"]);
  });
});

class TestProvider {
  private messages: Uint8Array[] = [];
  private readonly subscribers: Set<(update: Uint8Array) => void> = new Set();

  broadcastMessage(data: Uint8Array): void {
    this.messages.push(data);
    this.subscribers.forEach((sub) => sub(data));
  }

  subscribe(callback: (update: Uint8Array) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  clearMessages(): void {
    this.messages = [];
  }
}

class TestEnvironment {
  private readonly provider: TestProvider;

  constructor() {
    this.provider = new TestProvider();
  }

  createDoc(): Y.Doc {
    const doc = new Y.Doc();
    doc.on("update", (update: Uint8Array) => {
      this.provider.broadcastMessage(update);
    });

    this.provider.subscribe((update) => {
      Y.applyUpdate(doc, update);
    });

    return doc;
  }

  async simulateNetworkDelay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  async simulateConflict(doc1: Y.Doc, doc2: Y.Doc, operations: Operation[]): Promise<void> {
    // Clear any existing messages
    this.provider.clearMessages();

    // Perform concurrent operations
    for (const op of operations) {
      if (op.doc === 1) {
        op.operation(doc1);
      } else {
        op.operation(doc2);
      }
    }

    // Sync the documents
    await this.simulateNetworkDelay(0); // Allow for event loop to process
  }
}
