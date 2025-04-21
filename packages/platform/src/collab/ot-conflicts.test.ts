import ShareDB from "sharedb";
import { Connection, Doc } from "sharedb/lib/client";
import * as richText from "rich-text";
import { docCreate, docFetch, docSubmitOp } from "./common/utils/sharedb-utils";

ShareDB.types.register(richText.type);

const createClientConnection = (): Connection => {
  const backend = new ShareDB();
  return backend.connect();
};

describe("ShareDB OT Conflict Resolution", () => {
  let connection: Connection;
  let doc1: Doc;
  let doc2: Doc;

  beforeEach(async () => {
    connection = createClientConnection();
    doc1 = connection.get("examples", "test-doc");
    doc2 = connection.get("examples", "test-doc");
    await docCreate(doc1, [{ insert: "Hello World" }], "rich-text");
  });

  afterEach(() => {
    connection.close();
  });

  it("should handle conflicting edits correctly", async () => {
    await docFetch(doc1);
    await docFetch(doc2);

    await docSubmitOp(doc1, [{ retain: 5 }, { insert: " Alice" }]);
    await docSubmitOp(doc2, [{ retain: 5 }, { insert: " Bob" }]);

    expect(doc1.data.ops).toMatchObject([{ insert: "Hello Bob Alice World" }]);
    expect(doc2.data.ops).toMatchObject([{ insert: "Hello Bob Alice World" }]);
  });
});
