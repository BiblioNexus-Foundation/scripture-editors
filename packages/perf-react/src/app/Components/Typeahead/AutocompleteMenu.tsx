import { useState, useRef, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_TAB_COMMAND,
  COMMAND_PRIORITY_LOW,
} from "lexical";
import { SuggestionsTextMatch } from "shared/plugins/Typeahead";
import { AutoCompleteItem, useAutocompleteItems } from "./useAutocompleteItems";
import { executeSelectedItem } from "./executeSelectedItem";
import { mergeRegister } from "@lexical/utils";

export default function AutocompleteMenu({
  phrase,
  items,
  filter,
  onItemSelect,
  typeaheadMatch,
  // children: _children,
}: {
  phrase?: string;
  items: AutoCompleteItem[];
  filter: (item: AutoCompleteItem, phrase: string) => boolean;
  onItemSelect: () => void;
  typeaheadMatch: SuggestionsTextMatch | null;
  // children?: ReactNode | ((props: { filteredItems: Item[]; selectedIndex: number }) => ReactNode);
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editor] = useLexicalComposerContext();
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredItems = useAutocompleteItems(phrase, items, filter);

  const isMenuOpen = filteredItems.length > 0;

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleExecuteSelectedItem = () => {
      if (filteredItems[selectedIndex] && typeaheadMatch) {
        executeSelectedItem(editor, filteredItems[selectedIndex], typeaheadMatch, onItemSelect);
        return true;
      }
      return false;
    };

    const unregisterNavigation = mergeRegister(
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        (event) => {
          setSelectedIndex((selectedIndex + 1) % filteredItems.length);
          event.preventDefault();
          event.stopImmediatePropagation();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        (event) => {
          setSelectedIndex((selectedIndex - 1 + filteredItems.length) % filteredItems.length);
          event.preventDefault();
          event.stopImmediatePropagation();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => {
          handleExecuteSelectedItem();
          if (!event) return false;
          event.preventDefault();
          event.stopImmediatePropagation();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_TAB_COMMAND,
        (event) => {
          handleExecuteSelectedItem();
          if (!event) return false;
          event.preventDefault();
          event.stopImmediatePropagation();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );

    return unregisterNavigation;
  }, [
    editor,
    isMenuOpen,
    filteredItems,
    selectedIndex,
    setSelectedIndex,
    onItemSelect,
    typeaheadMatch,
  ]);

  useEffect(() => {
    if (menuRef.current) {
      const menuElement = menuRef.current;
      const selectedElement = menuElement.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        const menuRect = menuElement.getBoundingClientRect();
        const selectedRect = selectedElement.getBoundingClientRect();

        if (selectedRect.bottom > menuRect.bottom) {
          menuElement.scrollTop += selectedRect.bottom - menuRect.bottom;
        } else if (selectedRect.top < menuRect.top) {
          menuElement.scrollTop -= menuRect.top - selectedRect.top;
        }
      }
    }
  }, [selectedIndex]);

  return (
    <div
      className="autocomplete-menu"
      ref={menuRef}
      style={{ maxHeight: "200px", overflowY: "auto" }}
    >
      {filteredItems.map((item, index) => (
        <button
          key={`${item.name}-ac`}
          className={selectedIndex === index ? "active" : undefined}
          onClick={() => {
            item.action(editor);
          }}
          title={item.description}
        >
          <span className="label">{item.label ?? item.name}</span>
          <span className="description">{item.description}</span>
        </button>
      ))}
    </div>
  );
}
