import { useMemo } from "react";

import {
  ContextMenuTriggerButton,
  EnhancedCursorToggleButton,
  FormatButton,
  MarkerInfo,
  RedoButton,
  SaveButton,
  ScriptureReferenceInfo,
  ToolbarContainer,
  ToolbarSection,
  UndoButton,
  ViewButton,
  FindReplacePlugin,
  useFindReplace,
} from "@scriptural/react";

import { ImPilcrow } from "react-icons/im";
import { RiInputCursorMove } from "react-icons/ri";
import {
  MdOutlineUndo,
  MdOutlineRedo,
  MdSave,
  MdViewAgenda,
  MdKeyboardCommandKey,
  MdSearch,
} from "react-icons/md";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ButtonExpandNotes } from "./plugins/ButtonExpandNotes";
import { FindReplaceDialog } from "./components/FindReplaceDialog";

// Search button component accessing FindReplace context
function SearchButton() {
  const { isVisible, setIsVisible } = useFindReplace();

  return (
    <button
      onClick={() => setIsVisible(!isVisible)}
      title="find and replace"
      className="toolbar-button"
    >
      <MdSearch size={18} />
    </button>
  );
}

export function CustomToolbar({ onSave }: { onSave: any }) {
  const [editor] = useLexicalComposerContext();
  const editable = useMemo(() => editor.isEditable(), [editor]);

  return (
    <>
      {/* Use the FindReplacePlugin as a context provider wrapping everything */}
      {editable ? (
        <FindReplacePlugin>
          <ToolbarContainer>
            <ToolbarSection>
              <>
                <UndoButton title="undo">
                  <MdOutlineUndo size={20} />
                </UndoButton>
                <RedoButton title="redo">
                  <MdOutlineRedo size={20} />
                </RedoButton>
                <hr />
                <SaveButton onSave={onSave} title="save">
                  <MdSave size={20} />
                </SaveButton>
                <hr />
              </>
              <ViewButton title="toggle block view">
                <MdViewAgenda size={16} />
              </ViewButton>
              <FormatButton title="toggle markup">
                <ImPilcrow />
              </FormatButton>
              <>
                <EnhancedCursorToggleButton title="toggle enhanced cursor">
                  <RiInputCursorMove size={18} />
                </EnhancedCursorToggleButton>
                <SearchButton />
              </>
              <ButtonExpandNotes defaultState={false} />
              <hr />
            </ToolbarSection>
            <ToolbarSection>
              <ContextMenuTriggerButton title="set context menu trigger key">
                <MdKeyboardCommandKey size={18} />
              </ContextMenuTriggerButton>
              <MarkerInfo />
              <ScriptureReferenceInfo />
            </ToolbarSection>
          </ToolbarContainer>

          {/* The FindReplaceDialog is also a child of FindReplacePlugin */}
          <FindReplaceDialog />
        </FindReplacePlugin>
      ) : (
        <ToolbarContainer>
          <ToolbarSection>
            <ViewButton title="toggle block view">
              <MdViewAgenda size={16} />
            </ViewButton>
            <FormatButton title="toggle markup">
              <ImPilcrow />
            </FormatButton>
            <ButtonExpandNotes defaultState={true} />
            <hr />
          </ToolbarSection>
          <ToolbarSection>
            <MarkerInfo />
            <ScriptureReferenceInfo />
          </ToolbarSection>
        </ToolbarContainer>
      )}
    </>
  );
}
