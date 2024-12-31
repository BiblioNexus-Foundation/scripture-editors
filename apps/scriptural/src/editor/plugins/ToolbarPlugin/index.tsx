import { useScripturalComposerContext } from "@scriptural/react/context";
import { LexicalEditor, REDO_COMMAND, UNDO_COMMAND } from "lexical";
import { ReactElement, ReactNode, useCallback, useMemo } from "react";
import {
  getMarker,
  getChildrenMarkers,
  getMarkersAlike,
  getScripturalMarkerAction,
} from "@scriptural/react/utils";
import { EditorSettings } from "../../context/ScripturalEditorContext";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export interface ScripturalToolbarSettings {
  enhancedCursorPosition: boolean;
  contextMenuTriggerKey: string;
}

export const SCRIPTURAL_TOOLBAR_SETTINGS = {
  enhancedCursorPosition: "toolbar.enhancedCursorPosition",
  contextMenuTriggerKey: "toolbar.contextMenuTriggerKey",
} as const;

export const DEFAULT_SCRIPTURAL_TOOLBAR_SETTINGS: ScripturalToolbarSettings = {
  enhancedCursorPosition: true,
  contextMenuTriggerKey: "\\",
};

export function getToolbarSettings(settings: EditorSettings) {
  return {
    enhancedCursorPosition:
      settings[SCRIPTURAL_TOOLBAR_SETTINGS.enhancedCursorPosition] ??
      DEFAULT_SCRIPTURAL_TOOLBAR_SETTINGS.enhancedCursorPosition,
    contextMenuTriggerKey:
      settings[SCRIPTURAL_TOOLBAR_SETTINGS.contextMenuTriggerKey] ??
      DEFAULT_SCRIPTURAL_TOOLBAR_SETTINGS.contextMenuTriggerKey,
  };
}

const useToolbarSettings = () => {
  const { getSettings, updateSettings } = useScripturalComposerContext();

  const contextMenuTriggerKey = getSettings(
    SCRIPTURAL_TOOLBAR_SETTINGS.contextMenuTriggerKey,
  ) as ScripturalToolbarSettings["contextMenuTriggerKey"];

  const enhancedCursorPosition = getSettings(
    SCRIPTURAL_TOOLBAR_SETTINGS.enhancedCursorPosition,
  ) as ScripturalToolbarSettings["enhancedCursorPosition"];

  const updateContextMenuTriggerKey = useCallback(
    (key: string) => {
      updateSettings(SCRIPTURAL_TOOLBAR_SETTINGS.contextMenuTriggerKey, key);
    },
    [updateSettings],
  );

  const toggleEnhancedCursorPosition = useCallback(() => {
    updateSettings(SCRIPTURAL_TOOLBAR_SETTINGS.enhancedCursorPosition, !enhancedCursorPosition);
  }, [updateSettings, enhancedCursorPosition]);

  const toggleClass = (element: HTMLElement | null, className: string) =>
    element && element.classList.toggle(className);

  return {
    contextMenuTriggerKey,
    enhancedCursorPosition,
    updateContextMenuTriggerKey,
    toggleEnhancedCursorPosition,
    toggleClass,
  };
};

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

export function ToolbarDefault() {
  return (
    <ToolbarContainer>
      <ToolbarSection>
        <HistoryButtons />
        <hr />
        <SaveButton />
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
      <ToolbarMarkerSections />
    </ToolbarContainer>
  );
}

export function HistoryButtons() {
  return (
    <>
      <ToolbarButton onClick={(_, editor) => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
        <i>undo</i>
      </ToolbarButton>
      <ToolbarButton onClick={(_, editor) => editor.dispatchCommand(REDO_COMMAND, undefined)}>
        <i>redo</i>
      </ToolbarButton>
    </>
  );
}

export function SaveButton() {
  return (
    <button onClick={() => alert("Not implemented for this editor")}>
      <i>download</i>
    </button>
  );
}

export function ViewButton() {
  const { editorRef } = useScripturalComposerContext();
  const { toggleClass } = useToolbarSettings();
  return (
    <button
      onClick={(e) => {
        toggleClass(editorRef.current, "verse-blocks");
        toggleClass(e.currentTarget, "active");
      }}
    >
      <i>view_agenda</i>
    </button>
  );
}

export function FormatButton() {
  const { editorRef } = useScripturalComposerContext();
  const { toggleClass } = useToolbarSettings();
  return (
    <button
      className="active"
      onClick={(e) => {
        toggleClass(editorRef.current, "with-markers");
        toggleClass(e.currentTarget, "active");
      }}
    >
      <i>format_paragraph</i>
    </button>
  );
}

export function EnhancedCursorToggleButton() {
  const { enhancedCursorPosition, toggleEnhancedCursorPosition } = useToolbarSettings();
  return (
    <button
      className={enhancedCursorPosition ? "active" : undefined}
      onClick={toggleEnhancedCursorPosition}
    >
      <i>highlight_text_cursor</i>
    </button>
  );
}

export function ContextMenuTriggerButton() {
  const { updateContextMenuTriggerKey, contextMenuTriggerKey } = useToolbarSettings();

  const handleKeyPress = (event: KeyboardEvent) => {
    updateContextMenuTriggerKey(event.key);
  };

  const handleButtonClick = () => {
    document.addEventListener("keydown", handleKeyPress, { once: true });
  };
  return (
    <button onClick={handleButtonClick}>
      <i>keyboard_command_key</i>: {contextMenuTriggerKey}
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
      ;
    </>
  );
}
