import { CategoryType, Marker, MarkerType } from "./usfmTypes";

export type MarkerOverwrite = Partial<
  Omit<Marker, "children"> & {
    children?: Partial<Record<CategoryType, { add: string[]; remove: string[] }>> | null;
  }
>;

const usfmMarkersOverwrites: Record<string, MarkerOverwrite> = {
  p: {
    children: {
      DivisionMarks: { add: ["v", "c"], remove: [] },
      Paragraphs: { add: ["p"], remove: [] },
    },
  },
  c: {
    type: MarkerType.Character,
    children: null,
  },
  v: {
    children: null,
  },
};

export default usfmMarkersOverwrites;
