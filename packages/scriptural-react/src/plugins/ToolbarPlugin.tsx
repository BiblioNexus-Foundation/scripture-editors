import { ReactElement, ReactNode, useCallback, useMemo, useRef, useEffect } from "react";
import { LexicalEditor, REDO_COMMAND, UNDO_COMMAND } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { useScripturalComposerContext } from "../context/ScripturalEditorContext";
import { ScripturalBaseSettings, useBaseSettings } from "./BaseSettingsPlugin";
import {
  getMarker,
  getChildrenMarkers,
  getMarkersAlike,
  getScripturalMarkerAction,
} from "../utils";
import { serializedLexicalToUsjNode } from "shared/converters/usj";

export function ToolbarContainer({
  children,
  ...props
}: { children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="toolbar noprint" {...props}>
      {children}
    </div>
  );
}

export default function ToolbarButton({
  onClick,
  children,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>, editor: LexicalEditor) => void;
}) {
  const [editor] = useLexicalComposerContext();

  return (
    <button onClick={(e) => (onClick ? onClick(e, editor) : undefined)} {...props}>
      {children}
    </button>
  );
}

export function ToolbarSection({
  children,
  ...props
}: { children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="toolbar-section" {...props}>
      {children}
    </div>
  );
}

export function ToolbarDefault({ onSave }: { onSave?: ScripturalBaseSettings["onSave"] }) {
  return (
    <ToolbarContainer>
      <ToolbarSection>
        <HistoryButtons />
        <hr />
        <SaveButton onSave={onSave} />
        <hr />
        <ViewButton />
        <FormatButton />
        <EnhancedCursorToggleButton />
        <hr />
      </ToolbarSection>
      <ToolbarSection>
        <ContextMenuTriggerButton />
        <MarkerInfo />
        <ScriptureReferenceInfo />
        <hr />
      </ToolbarSection>
    </ToolbarContainer>
  );
}

export function HistoryButtons({
  undoIconComponent,
  redoIconComponent,
}: {
  undoIconComponent?: ReactNode;
  redoIconComponent?: ReactNode;
}) {
  return (
    <>
      <ToolbarButton onClick={(_, editor) => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
        {undoIconComponent || <i>undo</i>}
      </ToolbarButton>
      <ToolbarButton onClick={(_, editor) => editor.dispatchCommand(REDO_COMMAND, undefined)}>
        {redoIconComponent || <i>redo</i>}
      </ToolbarButton>
    </>
  );
}

export function SaveButton({
  saveIconComponent,
  onSave,
}: {
  saveIconComponent?: ReactNode;
  onSave?: ScripturalBaseSettings["onSave"];
}) {
  const [editor] = useLexicalComposerContext();
  const getCurrentUsj = useCallback(() => {
    const serializedEditorState = editor.getEditorState().toJSON();
    const { result: usj } = serializedLexicalToUsjNode(serializedEditorState.root);
    return usj;
  }, [editor]);

  const handleSave = useCallback(() => {
    const usj = getCurrentUsj();
    if (!usj) return;
    onSave?.(usj);
  }, [onSave, getCurrentUsj]);

  return <button onClick={handleSave}>{saveIconComponent || <i>download</i>}</button>;
}

export function ViewButton({ viewIconComponent }: { viewIconComponent?: ReactNode }) {
  const { editorRef } = useScripturalComposerContext();
  const { toggleClass } = useBaseSettings();
  return (
    <button
      onClick={(e) => {
        toggleClass(editorRef.current, "verse-blocks");
        toggleClass(e.currentTarget, "active");
      }}
    >
      {viewIconComponent || <i>view_agenda</i>}
    </button>
  );
}

export function FormatButton({ formatIconComponent }: { formatIconComponent?: ReactNode }) {
  const { editorRef } = useScripturalComposerContext();
  const { toggleClass } = useBaseSettings();
  return (
    <button
      className="active"
      onClick={(e) => {
        toggleClass(editorRef.current, "with-markers");
        toggleClass(e.currentTarget, "active");
      }}
    >
      {formatIconComponent || <i>format_paragraph</i>}
    </button>
  );
}

export function EnhancedCursorToggleButton({
  enhancedCursorIconComponent,
}: {
  enhancedCursorIconComponent?: ReactNode;
}) {
  const { enhancedCursorPosition, toggleEnhancedCursorPosition } = useBaseSettings();
  return (
    <button
      className={enhancedCursorPosition ? "active" : undefined}
      onClick={toggleEnhancedCursorPosition}
    >
      {enhancedCursorIconComponent || <i>highlight_text_cursor</i>}
    </button>
  );
}

export function ContextMenuTriggerButton({
  contextMenuTriggerIconComponent,
}: {
  contextMenuTriggerIconComponent?: ReactNode;
}) {
  const { updateContextMenuTriggerKey, contextMenuTriggerKey } = useBaseSettings();
  const isListeningRef = useRef(false);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      updateContextMenuTriggerKey(event.key);
      isListeningRef.current = false;
      document.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("click", cancelListening);
    },
    [updateContextMenuTriggerKey],
  );

  const cancelListening = useCallback(() => {
    if (isListeningRef.current) {
      document.removeEventListener("keydown", handleKeyPress);
      isListeningRef.current = false;
    }
  }, [handleKeyPress]);

  const handleButtonClick = useCallback(
    (e: React.MouseEvent) => {
      // Prevent the click event from bubbling up to window
      e.stopPropagation();

      if (isListeningRef.current) {
        cancelListening();
      } else {
        isListeningRef.current = true;
        document.addEventListener("keydown", handleKeyPress);
        // Add click listener on next tick to avoid the current click
        setTimeout(() => {
          window.addEventListener("click", cancelListening, { once: true });
        }, 0);
      }
    },
    [handleKeyPress, cancelListening],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelListening();
    };
  }, [cancelListening]);
  return (
    <button onClick={handleButtonClick}>
      {contextMenuTriggerIconComponent || <i>keyboard_command_key</i>}: {contextMenuTriggerKey}
    </button>
  );
}

export function ToolbarInfoElement(props: { info: string }) {
  return <span className="info">{props.info}</span>;
}

export function MarkerInfo() {
  const { selectedMarker } = useScripturalComposerContext();
  return <ToolbarInfoElement info={selectedMarker ? selectedMarker : "•"} />;
}

export function ScriptureReferenceInfo() {
  const { scriptureReference } = useScripturalComposerContext();
  return (
    <ToolbarInfoElement
      info={
        scriptureReference?.book +
        " " +
        (scriptureReference ? `${scriptureReference?.chapter}:${scriptureReference?.verse}` : "")
      }
    />
  );
}

export function ToolbarMarkerSections() {
  const { selectedMarker, scriptureReference } = useScripturalComposerContext();

  const toolbarMarkerSections = useMemo(() => {
    if (!selectedMarker || !scriptureReference) return null;
    const marker = getMarker(selectedMarker);
    const markerChildren = getChildrenMarkers(selectedMarker);
    const markerAlike = getMarkersAlike(selectedMarker);

    if (!markerChildren || !marker) return null;

    return [...markerChildren, ...(markerAlike || [])].reduce<{
      [key: string]: {
        label: string | ReactElement;
        action: (editor: LexicalEditor) => void;
        description: string;
      }[];
    }>((items, marker) => {
      if (["it", "bd", "bd-it"].includes(marker)) {
        const markerData = getMarker(marker);
        if (!markerData) return items;
        const { action } = getScripturalMarkerAction(marker, markerData);
        items["CharacterStyling"] = items["CharacterStyling"] || [];
        items["CharacterStyling"].push({
          label: marker,
          description: markerData?.description ?? "",
          action: (editor: LexicalEditor) => action({ editor, reference: scriptureReference }),
        });
      }
      return items;
    }, {});
  }, [selectedMarker, scriptureReference]);
  return (
    <>
      {toolbarMarkerSections &&
        Object.entries(toolbarMarkerSections).map(([sectionName, items]) => {
          return (
            <div key={"toolbar-" + sectionName} className={"toolbar-section"}>
              {items.map((item) => (
                <ToolbarButton
                  key={`${item.label}-toolbar`}
                  className={`${sectionName}`}
                  onClick={(_, editor) => item.action(editor)}
                  data-marker={item.label}
                  title={item.description}
                >
                  {item.label}
                </ToolbarButton>
              ))}
            </div>
          );
        })}
    </>
  );
}
