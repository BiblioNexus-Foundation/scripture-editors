// TODO: remove this file when `packages\shared\contentManager\index.js` is converted to TS.

import { SerializedEditorState } from "lexical";
import { PerfDocument } from "../plugins/PerfOperations/perfTypes";
import { Epitelete } from "epitelete";

export function getLexicalState(perf: PerfDocument): SerializedEditorState | SerializedLexicalNode;

export function getBookHandler({
  usfm,
  serverName,
  organizationId,
  languageCode,
  versionId,
  bookCode,
}: {
  usfm: string;
  serverName: string;
  organizationId: string;
  languageCode: string;
  versionId: string;
  bookCode: string;
}): BookStore;

export class BookStore extends Epitelete {
  read(bookCode: string): Promise<PerfDocument>;
  write(bookCode: string, perfDocument: PerfDocument): Promise<PerfDocument>;
  sideload(bookCode: string, perfDocument: PerfDocument): Promise<PerfDocument>;
  readUsfm(bookCode): Promise<string>;
}
