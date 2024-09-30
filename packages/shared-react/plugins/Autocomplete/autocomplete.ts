export type Item = {
  name: string;
  label?: string;
  description?: string;
};
export function autocomplete<T extends Item>(
  phrase: string,
  options: T[],
  filter: (item: T, phrase: string) => boolean,
): T[] {
  const lowerPhrase = phrase.toLowerCase();
  return options
    .filter((item) => filter(item, phrase))
    .sort((a, b) => {
      const textA = a.name.toLowerCase();
      const textB = b.name.toLowerCase();

      // Exact match
      if (textA === lowerPhrase && textB !== lowerPhrase) return -1;
      if (textB === lowerPhrase && textA !== lowerPhrase) return 1;

      // Starts with
      if (textA.startsWith(lowerPhrase) && !textB.startsWith(lowerPhrase)) return -1;
      if (textB.startsWith(lowerPhrase) && !textA.startsWith(lowerPhrase)) return 1;

      // Contains
      const indexA = textA.indexOf(lowerPhrase);
      const indexB = textB.indexOf(lowerPhrase);
      if (indexA !== -1 && indexB === -1) return -1;
      if (indexB !== -1 && indexA === -1) return 1;
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;

      // Alphabetical order for remaining items
      return textA.localeCompare(textB);
    });
}
