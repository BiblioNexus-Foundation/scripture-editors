// import { LexicalEditor } from "lexical";
// import { useMemo } from "react";
// import { GetMarkerAction, ScriptureReference } from "shared/utils/get-marker-action.model";
// import getMarker from "shared/utils/usfm/getMarker";

// export default function useModifiedMarkersForMenu({
//   editor,
//   scriptureReference,
//   contextMarker,
//   getMarkerAction,
//   autoNumbering,
// }: {
//   editor: LexicalEditor;
//   scriptureReference: ScriptureReference;
//   contextMarker: string | undefined;
//   getMarkerAction: GetMarkerAction;
//   autoNumbering: boolean;
// }) {
//   const markersMenuItems = useMemo(() => {
//     if (!contextMarker || !scriptureReference) return;
//     const marker = getMarker(contextMarker);
//     if (!marker?.children) return;

//     return Object.values(marker.children).flatMap((markers) =>
//       markers.map((marker) => {
//         const markerData = getMarker(marker);
//         const { action } = getMarkerAction(marker, markerData);

//         // Special handling for chapter and verse markers when autoNumbering is disabled
//         const requiresInput = !autoNumbering && (marker === "c" || marker === "v");

//         // Base menu item
//         const menuItem = {
//           name: marker,
//           label: marker,
//           description: markerData?.description ?? "",
//           action: (editor: LexicalEditor, value: number) => {
//             action({ editor, reference: scriptureReference });
//           },
//           // Add a custom action method to handle user input when manual numbering is used
//           customActionWithValue: (editor: LexicalEditor, value: number) => {
//             // Create a modified reference with the user-provided value
//             const modifiedReference = { ...scriptureReference };

//             if (marker === "c") {
//               modifiedReference.chapterNum = value;
//             } else if (marker === "v") {
//               modifiedReference.verseNum = value;
//               // modifiedReference.verse = value;
//             }

//             // Call the action with the modified reference
//             action({
//               editor,
//               reference: modifiedReference,
//             });
//           },
//         };

//         return menuItem;
//       }),
//     );
//   }, [editor, contextMarker, scriptureReference, autoNumbering]);

//   return { markersMenuItems };
// }
