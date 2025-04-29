import { useScripturalComposerContext } from "../../context";
import NodesMenu from "shared-react/plugins/NodesMenu";
import { useMarkersMenu } from "./MarkersMenuContext";

export { default as useScripturalMakersForMenu } from "./useScripturalMarkersForMenu";
export { useMarkersMenu, MarkersMenuProvider } from "./MarkersMenuContext";
export {
  MarkersToolbar,
  MarkersToolbarWithProvider,
  useFilteredMarkers,
  type MarkersToolbarProps,
  type CustomMarkerCategories,
  type MarkerFilterOptions,
  type FilteredMarkersResult,
} from "../ToolbarPlugin/MarkersToolbar";

export function ScripturalNodesMenuPlugin({ trigger }: { trigger: string }) {
  const { scriptureReference, selectedMarker } = useScripturalComposerContext();

  return scriptureReference && selectedMarker ? <ScriptureNodesMenu trigger={trigger} /> : null;
}

const ScriptureNodesMenu = ({ trigger }: { trigger: string }) => {
  const { markersMenuItems } = useMarkersMenu();

  if (!markersMenuItems) {
    return null;
  }

  return <NodesMenu trigger={trigger} items={markersMenuItems} />;
};
