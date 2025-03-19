export type UsjLocation = {
  /* JsonPath indexes of the location in the USJ, e.g. JsonPath "$.content[1].content[2]" has indexes `[1, 2]` */
  jsonPathIndexes: number[];
  /* Offset of the location in the text */
  offset: number;
};

export type SelectionRange = {
  start: UsjLocation;
  end?: UsjLocation;
};

export type AnnotationRange = {
  start: UsjLocation;
  end: UsjLocation;
};
