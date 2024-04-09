export interface SubtypeNS {
  "subtype-ns": string;
  subtype: string;
}

export interface Subtype {
  subtype: string;
}

export const handleSubtypeNS = (subtype: string): SubtypeNS | Subtype => {
  const subtypes = subtype.split(":");
  return subtypes.length > 1 ? { "subtype-ns": subtypes[0], subtype: subtypes[1] } : { subtype };
};

export const pushToArray = <T>(array: T[], value: T): T[] => {
  array.push(value);
  return array;
};
