import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { SerializedLexicalNode } from "lexical";
import { Marker } from "shared/utils/usfm/usfmTypes";
import NodesMenu from "./NodesMenu";
import useUsfmMakersForMenu from "./PerfNodesItems/useUsfmMarkersForMenu";
import { ScriptureReference } from "./ScriptureReferencePlugin";

export default function UsfmNodesMenuPlugin({
  trigger,
  scriptureReference,
  contextMarker,
  usfmToLexicalAdapter,
}: {
  trigger: string;
  scriptureReference: ScriptureReference;
  contextMarker: string | undefined;
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
