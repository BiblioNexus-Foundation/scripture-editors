import ToolbarButton from "./ToolbarButton";
import useModal from "../hooks/useModal";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useState, useRef, useEffect } from "react";
import { REDO_COMMAND, UNDO_COMMAND, CUT_COMMAND, COPY_COMMAND } from "lexical";
import "./Toolbar.css";
import { getUsjMarkerAction } from "../adaptors/usj-marker-action.utils";
import { InsertDialog } from "./Input/TextInput";
import { ScriptureReference } from "shared/utils/get-marker-action.model";
import { ViewOptions } from "../adaptors/view-options.utils";
import { pasteSelection, pasteSelectionAsPlainText } from "shared-react/plugins/clipboard.utils";
import { InsertFunction } from "./Input/TextInput";
export const Toolbar = ({
  scrRef,
  viewOptions,
  autoNumbering = false,
  canUndo,
  canRedo,
}: {
  scrRef: ScriptureReference;
  viewOptions?: ViewOptions;
  autoNumbering?: boolean;
  canUndo: boolean;
  canRedo: boolean;
}) => {
  const [modal, showModal] = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(true);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  type InsertOption = {
    title: string;
    marker: string;
    requiresValue: boolean;
    placeholder?: string; // Optional since not all items have it
  };

  const insertOptions: InsertOption[] = [
    {
      title: "Verse",
      marker: "v",
      requiresValue: true,
      placeholder: "Verse Number",
    },
    {
      title: "Chapter",
      marker: "c",
      requiresValue: true,
      placeholder: "Chapter Number",
    },
    {
      title: "Footnote",
      marker: "f",
      requiresValue: true,
    },
    {
      title: "Cross Reference",
      marker: "x",
      requiresValue: true,
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const editorElement = document.querySelector(".editor-input");
    if (editorElement) {
      const container = editorElement.closest("div");
      editorContainerRef.current = container as HTMLDivElement;
    }
  }, []);

  const handleCopy = () => {
    editor.dispatchCommand(COPY_COMMAND, null);
  };

  const handleCut = () => {
    editor.dispatchCommand(CUT_COMMAND, null);
  };

  const handlePaste = () => {
    pasteSelection(editor);
  };

  const handlePasteAsPlainText = () => {
    pasteSelectionAsPlainText(editor);
  };

  const handleUndo = () => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  };

  const handleRedo = () => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  };

  const handleInsertOption = (option: InsertOption) => {
    console.log({ option });
    setIsDropdownOpen(false);

    if (option.requiresValue) {
      showModal(`Insert ${option.title}`, (onClose) => (
        <InsertDialog
          activeEditor={editor}
          onClose={onClose}
          label={option.title}
          placeholder={option.placeholder}
          insertFunction={({ editor, value, noteText }: InsertFunction) => {
            const markerAction = getUsjMarkerAction(option.marker, undefined, viewOptions);
            if (markerAction && markerAction.action) {
              markerAction.action({
                reference: scrRef,
                editor: editor,
                autoNumbering: autoNumbering,
                newVerseRChapterNum: value ? parseInt(value) : undefined,
                noteText: noteText,
              });
            }
          }}
        />
      ));
    } else {
      const markerAction = getUsjMarkerAction(option.marker, undefined, viewOptions);
      if (markerAction && markerAction.action) {
        markerAction.action({
          reference: scrRef,
          editor: editor,
          autoNumbering: autoNumbering,
        });
      }
    }
  };

  return (
    <div className="scribe-toolbar">
      <div className="scribe-toolbar-group">
        <ToolbarButton onClick={handleUndo} title="Undo" disabled={!canUndo}>
          Undo
        </ToolbarButton>
        <ToolbarButton onClick={handleRedo} title="Redo" disabled={!canRedo}>
          Redo
        </ToolbarButton>
      </div>

      <div className="scribe-toolbar-group">
        <ToolbarButton onClick={handleCut} title="Cut">
          Cut
        </ToolbarButton>
        <ToolbarButton onClick={handleCopy} title="Copy">
          Copy
        </ToolbarButton>
        <ToolbarButton onClick={handlePaste} title="Paste">
          Paste
        </ToolbarButton>
        <ToolbarButton onClick={handlePasteAsPlainText} title="Paste as Plain Text">
          Paste as Plain Text
        </ToolbarButton>
      </div>

      <div className="scribe-toolbar-group" ref={dropdownRef}>
        <ToolbarButton
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={isDropdownOpen ? "scribe-active" : ""}
        >
          Insert ▼
        </ToolbarButton>

        {isDropdownOpen && (
          <div className="scribe-dropdown">
            {insertOptions.map((option) => (
              <button
                key={option.title}
                className="scribe-dropdown-item"
                onClick={() => handleInsertOption(option)}
              >
                {option.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="scribe-toolbar-group">
        <ToolbarButton
          onClick={() => {
            const newValue = !isEditable;
            setIsEditable(newValue);
            editor.setEditable(newValue);
          }}
          className={isEditable ? "scribe-status-editable" : "scribe-status-readonly"}
        >
          {isEditable ? "Editable" : "Read Only"}
        </ToolbarButton>
      </div>

      {modal}
    </div>
  );
};

export default Toolbar;
