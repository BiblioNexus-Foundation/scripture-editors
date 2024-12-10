import { Usj, USJ_VERSION } from "@biblionexus-foundation/scripture-utilities";
import { SerializedElementNode } from "lexical";
import { EditorAdaptor } from "../../adaptors/editor-adaptor.model";
import { usfm2Usj } from "./usfmToUsj";

//For now only markers that are allowed to be under \p marker
export const createLexicalUsjNodeFromUsfm = (
  usfm: string | undefined,
  reference: { book: string; chapter: number; verse: number },
  editorAdaptor: EditorAdaptor,
) => {
  const usfmDocument = String.raw`
  \id ${reference.book.toUpperCase()}
  \c ${reference.chapter}
  \p \v ${reference.verse}
  \p
  ${usfm || ""}
  `;

  const usj = usfm2Usj(usfmDocument) as Usj;
  // TODO: fix this hacky work around since `usfm2Usj` is stuck on v0.2.0.
  usj.version = USJ_VERSION;

  const lexicalSerializedRoot = editorAdaptor.serializeEditorState(usj);
  const lexicalSerializedNode = lexicalSerializedRoot.root.children[4]
    ? lexicalSerializedRoot.root.children[4]
    : (lexicalSerializedRoot.root.children[3] as SerializedElementNode).children[0];

  return lexicalSerializedNode;
};
