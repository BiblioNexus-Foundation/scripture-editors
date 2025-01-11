import { useMemo } from "react";

import {
  ContextMenuTriggerButton,
  EnhancedCursorToggleButton,
  FormatButton,
  HistoryButtons,
  MarkerInfo,
  RedoButton,
  SaveButton,
  ScriptureReferenceInfo,
  ToolbarContainer,
  ToolbarSection,
  UndoButton,
  ViewButton,
} from "@scriptural/react";

import { ImPilcrow } from "react-icons/im";
import { RiInputCursorMove } from "react-icons/ri";
import {
  MdOutlineUndo,
  MdOutlineRedo,
  MdSave,
  MdViewAgenda,
  MdKeyboardCommandKey,
} from "react-icons/md";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ButtonExpandNotes } from "./plugins/ButtonExpandNotes";

export function CustomToolbar({ onSave }: { onSave: any }) {
  const [editor] = useLexicalComposerContext();
  const editable = useMemo(() => editor.isEditable(), [editor]);
  return (
    <ToolbarContainer>
      <ToolbarSection>
        {editable ? (
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
        ) : null}
        <ViewButton title="toggle block view">
          <MdViewAgenda size={16} />
        </ViewButton>
        <FormatButton title="toggle markup">
          <ImPilcrow />
        </FormatButton>
        {editable && (
          <EnhancedCursorToggleButton title="toggle enhanced cursor">
            <RiInputCursorMove size={18} />
          </EnhancedCursorToggleButton>
        )}
        <ButtonExpandNotes defaultState={editable ? false : true} />
        <hr />
      </ToolbarSection>
      <ToolbarSection>
        {editable && (
          <ContextMenuTriggerButton title="set context menu trigger">
            <MdKeyboardCommandKey size={18} />
          </ContextMenuTriggerButton>
        )}
        <MarkerInfo />
        <ScriptureReferenceInfo />
      </ToolbarSection>
    </ToolbarContainer>
  );
}
