import { getScripturalMarkerAction } from "shared/utils/scriptureMarkers/getScripturalMarkerActions";
import { ScriptureReference } from "shared-react/plugins/ScriptureReferencePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useScripturalComposerContext } from "../../context";
import NodesMenu from "shared-react/plugins/NodesMenu";
import useScripturalMakersForMenu from "./useScripturalMarkersForMenu";

export { default as useScripturalMakersForMenu } from "./useScripturalMarkersForMenu";

export function ScripturalNodesMenuPlugin({ trigger }: { trigger: string }) {
  const { scriptureReference, selectedMarker } = useScripturalComposerContext();

  return (
    scriptureReference &&
    selectedMarker && (
      <ScriptureNodesMenu
        trigger={trigger}
        scriptureReference={scriptureReference}
        contextMarker={selectedMarker}
      />
    )
  );
}

const ScriptureNodesMenu = ({
  trigger,
  scriptureReference,
  contextMarker,
}: {
  trigger: string;
  scriptureReference: ScriptureReference;
  contextMarker: string;
}) => {
  const [editor] = useLexicalComposerContext();
  const { markersMenuItems } = useScripturalMakersForMenu({
    editor,
    scriptureReference,
    contextMarker,
    getMarkerAction: getScripturalMarkerAction,
  });

  return <NodesMenu trigger={trigger} items={markersMenuItems} />;
};
