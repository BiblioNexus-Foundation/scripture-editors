import { Canon } from "@sillsdev/scripture";
import { useCallback, useMemo } from "react";
import { EditorAdaptor } from "shared/adaptors/editor-adaptor.model";
import { ScriptureReference } from "shared/adaptors/scr-ref.model";
import { createLexicalUsjNodeFromUsfm } from "shared/utils/usfm/usfmToLexicalUsj";
import { ScriptureReference as Reference } from "./ScriptureReferencePlugin";
import UsfmNodesMenuPlugin from "./UsfmNodesMenuPlugin";

export default function UsjNodesMenuPlugin({
  trigger,
  scrRef,
  contextMarker,
  editorAdaptor,
}: {
  trigger: string;
  scrRef: ScriptureReference;
  contextMarker: string;
  editorAdaptor: EditorAdaptor;
}) {
  const { bookNum, chapterNum, verseNum } = scrRef;
  const scriptureReference = useMemo(
    () => ({
      book: Canon.bookNumberToId(bookNum ?? 0),
      chapter: chapterNum ?? 0,
      verse: verseNum ?? 0,
    }),
    [bookNum, chapterNum, verseNum],
  );
  const adapter = useCallback(
    (usfm: string | undefined, reference: Reference) =>
      createLexicalUsjNodeFromUsfm(usfm, reference, editorAdaptor),
    [editorAdaptor],
  );

  return (
    <UsfmNodesMenuPlugin
      trigger={trigger}
      scriptureReference={scriptureReference}
      contextMarker={contextMarker}
      usfmToLexicalAdapter={adapter}
    />
  );
}
