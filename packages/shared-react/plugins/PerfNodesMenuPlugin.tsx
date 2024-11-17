import UsfmNodesMenuPlugin from "./UsfmNodesMenuPlugin";
import { usfmToLexicalAdapter } from "shared/utils/usfm/usfmToLexicalPerf";
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
      usfmToLexicalAdapter={usfmToLexicalAdapter}
    />
  );
}
