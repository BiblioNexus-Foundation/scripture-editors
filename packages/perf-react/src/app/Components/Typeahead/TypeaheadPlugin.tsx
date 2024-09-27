import TypeaheadFloatingBox from "./TypeaheadFLoatingBox";
import AutocompleteMenu from "./AutocompleteMenu";
import { AutoCompleteItem } from "./useAutocompleteItems";

type TypeaheadPluginProps = {
  trigger: string;
  items?: AutoCompleteItem[];
};

const filterFunction = (item: AutoCompleteItem, phrase: string): boolean =>
  item.label?.toLowerCase().includes(phrase.toLowerCase()) ||
  item.name.toLowerCase().includes(phrase.toLowerCase());

export default function TypeaheadPlugin({ trigger, items }: TypeaheadPluginProps) {
  return (
    <TypeaheadFloatingBox trigger={trigger}>
      {({ typeaheadData }) => {
        return items ? (
          <AutocompleteMenu
            phrase={typeaheadData?.match.matchingString}
            items={items}
            filter={filterFunction}
            typeaheadMatch={typeaheadData?.match ?? null}
          />
        ) : null;
      }}
    </TypeaheadFloatingBox>
  );
}
