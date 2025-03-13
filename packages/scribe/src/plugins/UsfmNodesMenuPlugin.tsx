import { GetMarkerAction, ScriptureReference } from "shared/utils/get-marker-action.model";
import useUsfmMakersForMenu from "./PerfNodesItems/useUsfmMarkersForMenu";
import NodesMenu from "./NodesMenu";

export default function UsfmNodesMenuPlugin({
  trigger,
  scriptureReference,
  contextMarker,
  getMarkerAction,
  autoNumbering,
}: {
  trigger: string;
  scriptureReference: ScriptureReference;
  contextMarker: string | undefined;
  getMarkerAction: GetMarkerAction;
  autoNumbering?: boolean;
}) {
  const { markersMenuItems } = useUsfmMakersForMenu({
    scriptureReference,
    contextMarker,
    getMarkerAction,
    autoNumbering,
  });

  return <NodesMenu trigger={trigger} items={markersMenuItems} autoNumbering={autoNumbering} />;
}
