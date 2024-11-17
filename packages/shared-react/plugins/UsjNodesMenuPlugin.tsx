import UsfmNodesMenuPlugin from "./UsfmNodesMenuPlugin";
import { createLexicalUsjNodeFromUsfm } from "shared/utils/usfm/usfmToLexicalUsj";
import { ScriptureReference } from "./ScriptureReferencePlugin";
import { EditorAdaptor } from "shared/adaptors/editor-adaptor.model";
import { useCallback } from "react";

export default function UsjNodesMenuPlugin({
  trigger,
  scriptureReference,
  contextMarker,
  editorAdaptor,
}: {
  trigger: string;
  scriptureReference: ScriptureReference;
  contextMarker: string;
  editorAdaptor: EditorAdaptor;
}) {
  const adapter = useCallback(
    (usfm: string | undefined, reference: ScriptureReference) =>
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
