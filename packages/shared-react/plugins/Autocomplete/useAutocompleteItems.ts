import { useMemo } from "react";
import { filterAndRankOptions, Item } from "./filterAndRankOptions";
import { LexicalEditor } from "lexical";

export type AutoCompleteItem = Item & {
  action: (editor: LexicalEditor) => void;
};

export function useAutocompleteItems(
  phrase: string | undefined,
  items: AutoCompleteItem[],
  filter: (item: AutoCompleteItem, phrase: string) => boolean,
) {
  return useMemo(
    () => (phrase ? filterAndRankOptions(phrase, items, filter) : items),
    [phrase, items, filter],
  );
}
