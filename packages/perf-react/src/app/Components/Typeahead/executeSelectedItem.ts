import { LexicalEditor, $getSelection, $isRangeSelection, $isTextNode } from "lexical";
import { SuggestionsTextMatch } from "shared/plugins/Typeahead";
import { AutoCompleteItem } from "./useAutocompleteItems";

export function executeSelectedItem(
  editor: LexicalEditor,
  selectedItem: AutoCompleteItem,
  typeaheadMatch: SuggestionsTextMatch,
  onItemSelect: () => void,
) {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const { replaceableString } = typeaheadMatch;
      const start = selection.anchor.offset - replaceableString.length;
      const end = selection.anchor.offset;
      const anchorNode = selection.anchor.getNode();
      if (!$isTextNode(anchorNode)) return;
      selection.setTextNodeRange(anchorNode, start, anchorNode, end);
      selection.removeText();
    }
    selectedItem.action(editor);
  });
  onItemSelect();
}
