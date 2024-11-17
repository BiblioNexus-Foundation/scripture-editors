import useUsfmMakersForMenu from "../PerfNodesItems/useUsfmMarkersForMenu";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ScriptureReference } from "../ScriptureReferencePlugin";
import TypeaheadPlugin from "../Typeahead/TypeaheadPlugin";
import { usfmToLexicalAdapter } from "shared/utils/usfm/usfmToLexicalPerf";

export default function PerfTypeaheadPlugin({
  trigger,
  scriptureReference,
  contextMarker,
}: {
  trigger: string;
  scriptureReference: ScriptureReference;
  contextMarker: string;
}) {
  const [editor] = useLexicalComposerContext();
  const { markersMenuItems } = useUsfmMakersForMenu({
    editor,
    scriptureReference,
    contextMarker,
    usfmToLexicalAdapter,
  });

  return <TypeaheadPlugin trigger={trigger} items={markersMenuItems} />;
}
