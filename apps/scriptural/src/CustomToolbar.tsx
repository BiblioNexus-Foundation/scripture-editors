import { useMemo } from "react";

import {
  ContextMenuTriggerButton,
  EnhancedCursorToggleButton,
  FormatButton,
  HistoryButtons,
  MarkerInfo,
  SaveButton,
  ScriptureReferenceInfo,
  ToolbarContainer,
  ToolbarSection,
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
            <HistoryButtons
              undoIconComponent={<MdOutlineUndo size={20} />}
              redoIconComponent={<MdOutlineRedo size={20} />}
            />
            <hr />
            <SaveButton onSave={onSave} saveIconComponent={<MdSave size={20} />} />
            <hr />
          </>
        ) : null}
        <ViewButton viewIconComponent={<MdViewAgenda size={16} />} />
        <FormatButton formatIconComponent={<ImPilcrow />} />
        {editable && (
          <EnhancedCursorToggleButton
            enhancedCursorIconComponent={<RiInputCursorMove size={18} />}
          />
        )}
        <ButtonExpandNotes defaultState={editable ? false : true} />
        <hr />
      </ToolbarSection>
      <ToolbarSection>
        {editable && (
          <ContextMenuTriggerButton
            contextMenuTriggerIconComponent={<MdKeyboardCommandKey size={18} />}
          />
        )}
        <MarkerInfo />
        <ScriptureReferenceInfo />
      </ToolbarSection>
    </ToolbarContainer>
  );
}
