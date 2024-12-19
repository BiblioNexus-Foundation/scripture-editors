import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { GetMarkerAction } from "shared/utils/get-marker-action.model";
import useUsfmMakersForMenu from "./PerfNodesItems/useUsfmMarkersForMenu";
import NodesMenu from "./NodesMenu";
import { ScriptureReference } from "./ScriptureReferencePlugin";

export default function UsfmNodesMenuPlugin({
  trigger,
  scriptureReference,
  contextMarker,
  getMarkerAction,
}: {
  trigger: string;
  scriptureReference: ScriptureReference;
  contextMarker: string | undefined;
  getMarkerAction: GetMarkerAction;
}) {
  const [editor] = useLexicalComposerContext();
  const { markersMenuItems } = useUsfmMakersForMenu({
    editor,
    scriptureReference,
    contextMarker,
    getMarkerAction,
  });

  return <NodesMenu trigger={trigger} items={markersMenuItems} />;
}
