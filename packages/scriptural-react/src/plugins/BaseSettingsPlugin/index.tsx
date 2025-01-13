import { useCallback } from "react";
import { useScripturalComposerContext } from "../../";
import { UsjDocument, UsjNode } from "shared/converters/usj/core/usj";

export interface ScripturalBaseSettings {
  enhancedCursorPosition: boolean;
  contextMenuTriggerKey: string;
  onSave: (usj: UsjDocument | UsjNode | string) => void;
}

export const SCRIPTURAL_BASE_SETTINGS = {
  enhancedCursorPosition: "baseSettings.enhancedCursorPosition",
  contextMenuTriggerKey: "baseSettings.contextMenuTriggerKey",
  onSave: "baseSettings.onSave",
} as const;

export const DEFAULT_SCRIPTURAL_BASE_SETTINGS = {
  [SCRIPTURAL_BASE_SETTINGS.enhancedCursorPosition]: true,
  [SCRIPTURAL_BASE_SETTINGS.contextMenuTriggerKey]: "\\",
  [SCRIPTURAL_BASE_SETTINGS.onSave]: () => undefined,
};

export const useBaseSettings = () => {
  const { getSettings, updateSettings } = useScripturalComposerContext();

  const contextMenuTriggerKey = getSettings(
    SCRIPTURAL_BASE_SETTINGS.contextMenuTriggerKey,
  ) as ScripturalBaseSettings["contextMenuTriggerKey"];

  const enhancedCursorPosition = getSettings(
    SCRIPTURAL_BASE_SETTINGS.enhancedCursorPosition,
  ) as ScripturalBaseSettings["enhancedCursorPosition"];

  const updateContextMenuTriggerKey = useCallback(
    (key: string) => {
      updateSettings(SCRIPTURAL_BASE_SETTINGS.contextMenuTriggerKey, key);
    },
    [updateSettings],
  );

  const onSave = getSettings(SCRIPTURAL_BASE_SETTINGS.onSave) as ScripturalBaseSettings["onSave"];

  const updateOnSave = useCallback(
    (fn: ScripturalBaseSettings["onSave"]) => {
      updateSettings(SCRIPTURAL_BASE_SETTINGS.onSave, fn);
    },
    [updateSettings],
  );

  const toggleEnhancedCursorPosition = useCallback(() => {
    updateSettings(SCRIPTURAL_BASE_SETTINGS.enhancedCursorPosition, !enhancedCursorPosition);
  }, [updateSettings, enhancedCursorPosition]);

  const toggleClass = (element: HTMLElement | null, className: string) =>
    element && element.classList.toggle(className);

  return {
    contextMenuTriggerKey,
    enhancedCursorPosition,
    updateContextMenuTriggerKey,
    toggleEnhancedCursorPosition,
    toggleClass,
    onSave,
    updateOnSave,
  };
};
