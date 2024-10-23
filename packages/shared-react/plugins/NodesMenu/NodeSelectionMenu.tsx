import { useState } from "react";
// import { useAutocompleteItems } from "../Autocomplete/useAutocompleteItems";
import Menu from "./Menu";
import { useFilteredItems } from "./Menu/useFilteredItems";
import { LexicalEditor } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalInput } from "./LexicalInput";

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
  inverse?: boolean;
}

export function NodeSelectionMenu({
  options,
  onSelectOption,
  onClose,
  inverse,
}: NodeSelectionMenuProps) {
  const [editor] = useLexicalComposerContext();
  const [query, setQuery] = useState("");
  const filteredOptions = useFilteredItems({ query, items: options, filterBy: "name" });

  const handleOptionSelection = (option: NodeOption) => {
    option.action(editor);
    onSelectOption && onSelectOption(option);
    onClose && onClose();
  };

  return (
    <Menu.Root className={`autocomplete-menu-container ${inverse ? "inverse" : ""}`}>
      <LexicalInput
        value={query}
        type="text"
        onChange={setQuery}
        onEmpty={onClose}
        onExit={onClose}
        disabled
      />

      <Menu.Options className="autocomplete-menu-options" autoIndex={false}>
        {filteredOptions.map((option, index) => (
          <Menu.Option
            index={index}
            key={option.name}
            onSelect={() => handleOptionSelection(option)}
          >
            <span className="label">{option.label ?? option.name}</span>
            <span className="description">{option.description}</span>
          </Menu.Option>
        ))}
      </Menu.Options>
    </Menu.Root>
  );
}
