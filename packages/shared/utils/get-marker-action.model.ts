import { LexicalEditor } from "lexical";
import { Marker } from "./usfm/usfmTypes";

export type MarkerAction = {
  action: (currentEditor: {
    editor: LexicalEditor;
    reference: { book: string; chapter: number; verse: number };
  }) => void;
  label: string | undefined;
};

export type GetMarkerAction = (marker: string, markerData?: Marker) => MarkerAction;
