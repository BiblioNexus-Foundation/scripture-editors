import { SerializedVerseRef } from "@sillsdev/scripture";
import { LexicalEditor } from "lexical";
import { Marker } from "./usfm/usfmTypes";

export type ScriptureReference = SerializedVerseRef;

export type MarkerAction = {
  action: (currentEditor: { editor: LexicalEditor; reference: ScriptureReference }) => void;
  label: string | undefined;
};

export type GetMarkerAction = (marker: string, markerData?: Marker) => MarkerAction;
