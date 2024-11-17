import useUsfmMakersForMenu from "../PerfNodesItems/useUsfmMarkersForMenu";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ScriptureReference } from "../ScriptureReferencePlugin";
import NodesMenu from "../NodesMenu";
import { Marker } from "shared/utils/usfm/usfmTypes";
import { SerializedLexicalNode } from "lexical";

export default function UsfmNodesMenuPlugin({
  trigger,
  scriptureReference,
  contextMarker,
  usfmToLexicalAdapter,
}: {
  trigger: string;
  scriptureReference: ScriptureReference;
  contextMarker: string;
  usfmToLexicalAdapter: (
    usfm: string | undefined,
    reference: ScriptureReference,
    markerData?: Marker,
  ) => SerializedLexicalNode;
}) {
  const [editor] = useLexicalComposerContext();
  const { markersMenuItems } = useUsfmMakersForMenu({
    editor,
    scriptureReference,
    contextMarker,
    usfmToLexicalAdapter,
  });

  return <NodesMenu trigger={trigger} items={markersMenuItems} />;
}
