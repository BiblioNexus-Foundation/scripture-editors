export type AnnotationLocation = {
  jsonPath: string;
  offset: number;
};

export type AnnotationRange = {
  start: AnnotationLocation;
  end: AnnotationLocation;
};
