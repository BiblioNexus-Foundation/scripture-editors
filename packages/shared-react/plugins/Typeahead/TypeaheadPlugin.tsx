import TypeaheadFloatingBox from "./TypeaheadFLoatingBox";
import AutocompleteMenu from "../Autocomplete/AutocompleteMenu";
import { AutoCompleteItem } from "../Autocomplete/useAutocompleteItems";

type TypeaheadPluginProps = {
  /** the string that will trigger the floatingMenu */
  trigger: string;
  items?: AutoCompleteItem[];
};

const filterFunction = (item: AutoCompleteItem, phrase: string): boolean =>
  item.label?.toLowerCase().includes(phrase.toLowerCase()) ||
  item.name.toLowerCase().includes(phrase.toLowerCase());

/**
 * A plugin that renders an autocomplete floating menu when the user triggers it
 * by typing in a trigger character or phrase
 *
 * @param trigger the string that will trigger the typeahead menu when typed into the editor
 * @param items an array of option items to be placed inside the menu
 * @returns
 */
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
