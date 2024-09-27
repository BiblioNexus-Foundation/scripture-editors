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
      TitlesHeadings: {
        add: [
          "mte",
          "ms",
          "ms1",
          "ms2",
          "ms3",
          "s",
          "s1",
          "s2",
          "s3",
          "s4",
          "r",
          "sp",
          "d",
          "sd",
          "sd1",
          "sd2",
          "sd3",
          "sd4",
        ],
        remove: [],
      },
    },
  },
  qm: {
    children: {
      Paragraphs: { add: ["p"], remove: [] },
    },
  },
  c: {
    type: MarkerType.Paragraph,
    children: null,
  },
  v: {
    children: null,
  },
};

export default usfmMarkersOverwrites;
