/**
 * Adapted from https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/plugins/ContextMenuPlugin/index.tsx
 */

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalContextMenuPlugin, MenuOption } from "@lexical/react/LexicalContextMenuPlugin";
import { type LexicalNode, COPY_COMMAND, CUT_COMMAND } from "lexical";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as ReactDOM from "react-dom";
import { isImmutableChapterElement } from "shared/nodes/usj/ImmutableChapterNode";
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
  if (option.isDisabled) {
    className += " disabled";
  }
  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={className}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      aria-disabled={option.isDisabled}
      id={"typeahead-item-" + index}
      onMouseEnter={onMouseEnter}
      onClick={option.isDisabled ? undefined : onClick}
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
  isDisabled: boolean;

  constructor(
    title: string,
    options: {
      onSelect: (targetNode: LexicalNode | null) => void;
      isDisabled?: boolean;
    },
  ) {
    super(title);
    this.title = title;
    this.onSelect = options.onSelect.bind(this);
    this.isDisabled = options.isDisabled || false;
  }
}

/**
 * Checks if the given HTML element is an editor input.
 * @param element - The HTML element to check.
 * @param editorInputClassName - The class name that identifies an editor input. Defaults to "editor-input".
 * @returns `true` if the element is the editor input, `false` otherwise.
 */
function isEditorInput(
  element: HTMLElement | null | undefined,
  editorInputClassName = "editor-input",
): boolean {
  if (!element) return false;

  return element.classList.contains(editorInputClassName);
}

export default function ContextMenuPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isReadonly, setIsReadonly] = useState(() => !editor.isEditable());
  const targetRef = useRef<HTMLElement>();
  const editorInputClassNameRef = useRef<string>();
  const closeMenuFnRef = useRef<() => void>();

  const options = useMemo(() => {
    return [
      new ContextMenuOption(`Cut`, {
        onSelect: () => {
          editor.dispatchCommand(CUT_COMMAND, null);
        },
        isDisabled: isReadonly,
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
        isDisabled: isReadonly,
      }),
      new ContextMenuOption(`Paste as Plain Text`, {
        onSelect: () => {
          pasteSelectionAsPlainText(editor);
        },
        isDisabled: isReadonly,
      }),
    ];
  }, [editor, isReadonly]);

  const onSelectOption = useCallback(
    (selectedOption: ContextMenuOption, targetNode: LexicalNode | null, closeMenu: () => void) => {
      editor.update(() => {
        selectedOption?.onSelect(targetNode);
        closeMenu();
      });
    },
    [editor],
  );

  useEffect(() => {
    editorInputClassNameRef.current = editor.getRootElement()?.className ?? "";
  }, [editor]);

  useEffect(() => {
    const handleScroll = () => {
      closeMenuFnRef.current?.();
    };

    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  useEffect(
    () =>
      editor.registerEditableListener((editable) => {
        setIsReadonly(!editable);
      }),
    [editor],
  );

  return (
    <LexicalContextMenuPlugin
      options={options}
      onSelectOption={onSelectOption}
      onWillOpen={(event: MouseEvent) => {
        targetRef.current = event.target as HTMLElement;
      }}
      menuRenderFn={(
        anchorElementRef,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        { selectedIndex, options: _options, selectOptionAndCleanUp, setHighlightedIndex },
        { setMenuRef },
      ) => {
        // Store the closeMenu function.
        closeMenuFnRef.current = () =>
          selectOptionAndCleanUp(undefined as unknown as ContextMenuOption);

        return anchorElementRef.current &&
          !isEditorInput(targetRef.current, editorInputClassNameRef.current) &&
          !isImmutableChapterElement(targetRef.current)
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
                    if (!option.isDisabled) {
                      setHighlightedIndex(index);
                      selectOptionAndCleanUp(option);
                    }
                  }}
                  onOptionMouseEnter={(index: number) => {
                    setHighlightedIndex(index);
                  }}
                />
              </div>,
              anchorElementRef.current,
            )
          : null;
      }}
    />
  );
}
