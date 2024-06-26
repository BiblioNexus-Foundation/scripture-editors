/**
 * Adapted from https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/plugins/ContextMenuPlugin/index.tsx
 */

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalContextMenuPlugin, MenuOption } from "@lexical/react/LexicalContextMenuPlugin";
import { type LexicalNode, COPY_COMMAND, CUT_COMMAND } from "lexical";
import { useCallback, useMemo } from "react";
import * as ReactDOM from "react-dom";
import { pasteSelection, pasteSelectionAsPlainText } from "./clipboard.utils";

function ContextMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: ContextMenuOption;
}) {
  let className = "item";
  if (isSelected) {
    className += " selected";
  }
  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={className}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={"typeahead-item-" + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <span className="text">{option.title}</span>
    </li>
  );
}

function ContextMenu({
  options,
  selectedItemIndex,
  onOptionClick,
  onOptionMouseEnter,
}: {
  selectedItemIndex: number | null;
  onOptionClick: (option: ContextMenuOption, index: number) => void;
  onOptionMouseEnter: (index: number) => void;
  options: Array<ContextMenuOption>;
}) {
  return (
    <div className="typeahead-popover">
      <ul>
        {options.map((option: ContextMenuOption, i: number) => (
          <ContextMenuItem
            index={i}
            isSelected={selectedItemIndex === i}
            onClick={() => onOptionClick(option, i)}
            onMouseEnter={() => onOptionMouseEnter(i)}
            key={option.key}
            option={option}
          />
        ))}
      </ul>
    </div>
  );
}

export class ContextMenuOption extends MenuOption {
  title: string;
  onSelect: (targetNode: LexicalNode | null) => void;
  constructor(
    title: string,
    options: {
      onSelect: (targetNode: LexicalNode | null) => void;
    },
  ) {
    super(title);
    this.title = title;
    this.onSelect = options.onSelect.bind(this);
  }
}

export default function ContextMenuPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();

  const options = useMemo(() => {
    return [
      new ContextMenuOption(`Cut`, {
        onSelect: () => {
          editor.dispatchCommand(CUT_COMMAND, null);
        },
      }),
      new ContextMenuOption(`Copy`, {
        onSelect: () => {
          editor.dispatchCommand(COPY_COMMAND, null);
        },
      }),
      new ContextMenuOption(`Paste`, {
        onSelect: () => {
          pasteSelection(editor);
        },
      }),
      new ContextMenuOption(`Paste as Plain Text`, {
        onSelect: () => {
          pasteSelectionAsPlainText(editor);
        },
      }),
    ];
  }, [editor]);

  const onSelectOption = useCallback(
    (selectedOption: ContextMenuOption, targetNode: LexicalNode | null, closeMenu: () => void) => {
      editor.update(() => {
        selectedOption.onSelect(targetNode);
        closeMenu();
      });
    },
    [editor],
  );

  return (
    <LexicalContextMenuPlugin
      options={options}
      onSelectOption={onSelectOption}
      menuRenderFn={(
        anchorElementRef,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        { selectedIndex, options: _options, selectOptionAndCleanUp, setHighlightedIndex },
        { setMenuRef },
      ) =>
        anchorElementRef.current
          ? ReactDOM.createPortal(
              <div
                className="typeahead-popover auto-embed-menu"
                style={{
                  marginLeft: anchorElementRef.current.style.width,
                  userSelect: "none",
                  width: 200,
                }}
                ref={setMenuRef}
              >
                <ContextMenu
                  options={options}
                  selectedItemIndex={selectedIndex}
                  onOptionClick={(option: ContextMenuOption, index: number) => {
                    setHighlightedIndex(index);
                    selectOptionAndCleanUp(option);
                  }}
                  onOptionMouseEnter={(index: number) => {
                    setHighlightedIndex(index);
                  }}
                />
              </div>,
              anchorElementRef.current,
            )
          : null
      }
    />
  );
}
