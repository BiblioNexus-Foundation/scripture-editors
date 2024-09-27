import { useMemo } from "react";
import { autocomplete, Item } from "./autocomplete";
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
    () => (phrase ? autocomplete(phrase, items, filter) : items),
    [phrase, items, filter],
  );
}
