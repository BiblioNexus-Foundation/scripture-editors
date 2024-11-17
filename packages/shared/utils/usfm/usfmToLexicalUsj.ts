import { SerializedElementNode } from "lexical";
import { EditorAdaptor } from "../../adaptors/editor-adaptor.model";
import { usfm2Usj } from "./usfmToUsj";
import { Usj } from "@biblionexus-foundation/scripture-utilities";

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
  console.log({ usj });

  const lexicalSerializedRoot = editorAdaptor.serializeEditorState(usj);
  console.log({ lexicalSerializedRoot });

  const lexicalSerializedNode = lexicalSerializedRoot.root.children[4]
    ? lexicalSerializedRoot.root.children[4]
    : (lexicalSerializedRoot.root.children[3] as SerializedElementNode).children[0];

  return lexicalSerializedNode;
};
