import UUID from "pure-uuid";
import base64 from "base-64";
import { FlatDocument } from "shared/plugins/PerfOperations/Types/Document";
import { usfm2perf } from "shared/converters/perf/usfmToPerf";
import { transformPerfNodeToSerializedLexicalNode } from "shared/converters/perf/perfToLexical";
import Sequence from "shared/plugins/PerfOperations/Types/Sequence";
import { PerfKind } from "shared/plugins/PerfOperations/types";
import { SerializedElementNode } from "lexical";

export const generateId = () => base64.encode(new UUID(4).toString()).substring(0, 12);

export const createLexicalNodeFromUsfm = (usfm: string, kind: "inline" | "block") => {
  const usfmDocument = String.raw`
  \mt title
  \p
  ${usfm}
  `;

  const perf = usfm2perf(usfmDocument, {
    serverName: "local",
    organizationId: "local",
    languageCode: "any",
    versionId: "any",
  }) as FlatDocument;

  const lexicalSerializedRoot = transformPerfNodeToSerializedLexicalNode({
    source: {
      node: perf.sequences[perf.main_sequence_id] as Sequence,
      kind: PerfKind.Sequence,
    },
    perfSequences: perf.sequences,
  }) as SerializedElementNode<SerializedElementNode>;

  const lexicalSerializedNode =
    kind === "inline"
      ? lexicalSerializedRoot.children[1].children[0]
      : lexicalSerializedRoot.children[1];

  console.log({ perf, lexicalSerializedNode });
};
