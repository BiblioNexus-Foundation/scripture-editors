import { $getSelection, $isRangeSelection } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useState } from "react";
import FloatingBoxAtCursor from "../FloatingBox/FloatingBoxAtCursor";
import { NodeSelectionMenu } from "./NodeSelectionMenu";
import { OptionItem } from "./Menu";

export default function NodesMenu({
  trigger,
  items,
  autoNumbering = true,
}: {
  trigger: string;
  items?: OptionItem[];
  autoNumbering?: boolean;
}) {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const [userInputValue, setUserInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState<OptionItem | null>(null);
  const [isRequestingInput, setIsRequestingInput] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && (isOpen || isRequestingInput)) {
        setIsOpen(false);
        setIsRequestingInput(false);
        setUserInputValue("");
        editor.focus();
      } else if (e.key === trigger && !isOpen && !isRequestingInput) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === "Enter") {
        if (isRequestingInput) {
          e.preventDefault();
          handleInputSubmit();
        }
      }
    },
    [editor, trigger, isOpen, isRequestingInput],
  );

  useEffect(() => {
    return editor.registerRootListener((root) => {
      if (!root) return;
      root.addEventListener("keydown", handleKeyDown);
      return () => {
        root.removeEventListener("keydown", handleKeyDown);
      };
    });
  }, [editor, handleKeyDown]);

  useEffect(() => {
    return editor.registerUpdateListener(({ prevEditorState, editorState }) => {
      const prevSelection = prevEditorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        return selection;
      });
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || prevSelection?.is(selection)) return;
        setIsOpen(false);
        setIsRequestingInput(false);
      });
    });
  }, [editor]);

  const handleOptionSelection = useCallback(
    (option: OptionItem) => {
      const needsUserInput =
        (!autoNumbering && (option.name === "c" || option.name === "v")) ||
        option.name === "f" ||
        option.name === "x";
      console.log({ needsUserInput }, !autoNumbering, option.name);
      if (needsUserInput) {
        setSelectedOption(option);
        setIsRequestingInput(true);
        setIsOpen(false);

        // Prevent any default actions from executing immediately
        setTimeout(() => {
          // Focus on input when it appears
          const inputElement = document.querySelector(".user-input-container input");
          if (inputElement) {
            (inputElement as HTMLInputElement).focus();
          }
        }, 0);
      } else {
        option.action({ editor });
        setIsOpen(false);
      }
    },
    [editor],
  );

  const handleInputSubmit = () => {
    if (selectedOption && userInputValue.trim()) {
      try {
        if (selectedOption.name === "c" || selectedOption.name === "v") {
          const newVerseRChapterNum = parseInt(userInputValue);
          if (isNaN(newVerseRChapterNum)) {
            console.error("Invalid number input");
            return;
          }
          selectedOption.action({ editor, newVerseRChapterNum });
        } else if (selectedOption.name === "f" || selectedOption.name === "x") {
          selectedOption.action({ editor, noteText: userInputValue });
        } else {
          selectedOption.action({ editor });
        }

        console.log("Submitted: ", selectedOption.name, userInputValue);
      } catch (error) {
        console.error("Error processing input:", error);
      }

      setIsRequestingInput(false);
      setUserInputValue("");
      setSelectedOption(null);
      editor.focus();
    }
  };

  return (
    <>
      {items && isOpen && (
        <FloatingBoxAtCursor isOpen={isOpen}>
          {({ placement }) => (
            <NodeSelectionMenu
              options={items}
              onSelectOption={handleOptionSelection}
              onClose={() => setIsOpen(false)}
              inverse={placement === "top-start"}
            />
          )}
        </FloatingBoxAtCursor>
      )}

      {/* User Input Dialog - shown when input is needed */}
      {isRequestingInput && selectedOption && (
        <FloatingBoxAtCursor isOpen={isRequestingInput}>
          {() => (
            <div className="user-input-container">
              <div className="input-header">
                {selectedOption.name === "c"
                  ? "Enter chapter number:"
                  : selectedOption.name === "v"
                    ? "Enter verse number:"
                    : selectedOption.name === "f"
                      ? "Enter footnote text:"
                      : selectedOption.name === "x"
                        ? "Enter cross-reference:"
                        : "Enter text:"}
              </div>
              <input
                type="text"
                value={userInputValue}
                onChange={(e) => setUserInputValue(e.target.value)}
                autoFocus
                className="mb-3 w-full rounded border border-gray-300 p-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleInputSubmit();
                  }
                }}
              />
              <div className="input-actions">
                <button
                  className="cancel-button"
                  onClick={() => {
                    setIsRequestingInput(false);
                    setUserInputValue("");
                    setSelectedOption(null);
                    editor.focus();
                  }}
                >
                  Cancel
                </button>
                <button className="apply-button" onClick={handleInputSubmit}>
                  Insert
                </button>
              </div>
            </div>
          )}
        </FloatingBoxAtCursor>
      )}
    </>
  );
}
