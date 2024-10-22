import React, { useState } from "react";
// import { useAutocompleteItems } from "../Autocomplete/useAutocompleteItems";
import Menu from "./Menu";
import { useFilteredItems } from "./Menu/useFilteredItems";
import { LexicalEditor } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export type NodeOption = {
  name: string;
  label: string;
  description: string;
  action: (editor: LexicalEditor) => void;
};

interface NodeSelectionMenuProps {
  options: Array<NodeOption>;
  onSelectOption?: (option: NodeOption) => void;
  onClose?: () => void; // New prop added
}

export function NodeSelectionMenu({ options, onSelectOption, onClose }: NodeSelectionMenuProps) {
  const [editor] = useLexicalComposerContext();
  const [query, setQuery] = useState("");
  const filteredOptions = useFilteredItems({ query, items: options, filterBy: "name" });

  const handlePhraseChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setQuery(event.target.value);
  };

  const handleOptionSelect = (option: NodeOption) => {
    console.log("handleOptionSelect", option);
    option.action(editor);
    onSelectOption && onSelectOption(option);
    onClose && onClose();
  };

  return (
    <Menu.Root className="autocomplete-menu-container">
      <Menu.Input value={query} type="text" onChange={handlePhraseChange} autoFocus />

      <Menu.Options className="autocomplete-menu-options" autoIndex={false}>
        {filteredOptions.map((option, index) => (
          <Menu.Option index={index} key={option.name} onSelect={() => handleOptionSelect(option)}>
            <span className="label">{option.label ?? option.name}</span>
            <span className="description">{option.description}</span>
          </Menu.Option>
        ))}
      </Menu.Options>
    </Menu.Root>
  );
}
