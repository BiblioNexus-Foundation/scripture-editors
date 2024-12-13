import UsfmNodesMenuPlugin from "./UsfmNodesMenuPlugin";
import { getUsfmMarkerAction } from "shared/utils/usfm/getUsfmMarkerAction";
import { ScriptureReference } from "./ScriptureReferencePlugin";

export default function PerfNodesMenuPlugin({
  trigger,
  scriptureReference,
  contextMarker,
}: {
  trigger: string;
  scriptureReference: ScriptureReference;
  contextMarker: string;
}) {
  return (
    <UsfmNodesMenuPlugin
      trigger={trigger}
      scriptureReference={scriptureReference}
      contextMarker={contextMarker}
      getMarkerAction={getUsfmMarkerAction}
    />
  );
}
