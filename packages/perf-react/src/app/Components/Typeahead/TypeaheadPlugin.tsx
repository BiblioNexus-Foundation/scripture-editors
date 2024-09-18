import TypeaheadFloatingBox from "./TypeaheadFLoatingBox";
import AutocompleteMenu from "./AutocompleteMenu";
import { LexicalEditor } from "lexical";
import { useCallback } from "react";

type Item = {
  name: string;
  label?: string;
  description?: string;
  action: (editor: LexicalEditor) => void;
};

type TypeaheadPluginProps = {
  trigger: string;
  items?: Item[];
};

const filterFunction: (item: Item, phrase: string) => boolean = (item, phrase) =>
  item.label?.toLowerCase().includes(phrase.toLowerCase()) ||
  item.name.toLowerCase().includes(phrase.toLowerCase());

export default function TypeaheadPlugin({ trigger, items }: TypeaheadPluginProps) {
  const handleItemSelect = useCallback(() => {
    // Close the typeahead menu or perform any other necessary actions
    // For example, you might want to clear the typeahead query
  }, []);

  return (
    <TypeaheadFloatingBox trigger={trigger}>
      {({ typeaheadData }) => {
        return items ? (
          <AutocompleteMenu
            phrase={typeaheadData?.match.matchingString}
            items={items}
            filter={filterFunction}
            onItemSelect={handleItemSelect}
            typeaheadMatch={typeaheadData?.match ?? null}
          />
        ) : null;
      }}
    </TypeaheadFloatingBox>
  );
}
