import { LexicalEditor } from "lexical";
import { useMemo } from "react";
import {
  getMarker,
  getChildrenMarkers,
  getMarkersAlike,
} from "shared/utils/scriptureMarkers/scripturalMarkers";
import { getScripturalMarkerAction } from "shared/utils/scriptureMarkers/getScripturalMarkerActions";
import { ScriptureReference } from "shared-react/plugins/ScriptureReferencePlugin";

// getMarker() takes a marker string and gets its data from a usfm markers map object that is merged with overwrites that fit the PERF editor context.
// getMarkerAction() returns a function to generate a LexicalNode and insert it in the editor, this lexical node is a custom node made for the PERF editor
//NOTE: You can create your own typeahead plugin by creating your own getMarker() and getMarkerAction() functions adapted to your editor needs.
export default function useScripturalMakersForMenu({
  editor,
  scriptureReference,
  contextMarker,
  getMarkerAction,
}: {
  editor: LexicalEditor;
  scriptureReference: ScriptureReference;
  contextMarker: string | undefined;
  getMarkerAction: typeof getScripturalMarkerAction;
}) {
  const markersMenuItems = useMemo(() => {
    if (!contextMarker || !scriptureReference) return;
    const marker = getMarker(contextMarker);
    const markerChildren = getChildrenMarkers(contextMarker);
    const markerAlike = getMarkersAlike(contextMarker);

    if (!markerChildren || !marker) return;

    return [...markerChildren, ...(markerAlike || [])]
      .map((marker) => {
        const markerData = getMarker(marker);
        if (!markerData) return;
        const { action } = getMarkerAction(marker, markerData);
        return {
          name: marker,
          label: marker,
          description: markerData?.description ?? "",
          action: (editor: LexicalEditor) => {
            action({ editor, reference: scriptureReference });
          },
        };
      })
      .filter((item) => item !== undefined);
  }, [editor, contextMarker, scriptureReference]);

  return { markersMenuItems };
}
