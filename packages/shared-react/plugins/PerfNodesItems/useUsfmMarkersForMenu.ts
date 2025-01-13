import { LexicalEditor } from "lexical";
import { useMemo } from "react";
import { GetMarkerAction, ScriptureReference } from "shared/utils/get-marker-action.model";
import getMarker from "shared/utils/usfm/getMarker";

// getMarker() takes a marker string and gets its data from a usfm markers map object that is merged with overwrites that fit the PERF editor context.
// getMarkerAction() returns a function to generate a LexicalNode and insert it in the editor, this lexical node is a custom node made for the PERF editor
//NOTE: You can create your own typeahead plugin by creating your own getMarker() and getMarkerAction() functions adapted to your editor needs.
export default function useUsfmMakersForMenu({
  editor,
  scriptureReference,
  contextMarker,
  getMarkerAction,
}: {
  editor: LexicalEditor;
  scriptureReference: ScriptureReference;
  contextMarker: string | undefined;
  getMarkerAction: GetMarkerAction;
}) {
  const markersMenuItems = useMemo(() => {
    if (!contextMarker || !scriptureReference) return;
    const marker = getMarker(contextMarker);
    if (!marker?.children) return;

    return Object.values(marker.children).flatMap((markers) =>
      markers.map((marker) => {
        const markerData = getMarker(marker);
        const { action } = getMarkerAction(marker, markerData);
        return {
          name: marker,
          label: marker,
          description: markerData?.description ?? "",
          action: (editor: LexicalEditor) => {
            action({ editor, reference: scriptureReference });
          },
        };
      }),
    );
  }, [editor, contextMarker, scriptureReference]);

  return { markersMenuItems };
}
