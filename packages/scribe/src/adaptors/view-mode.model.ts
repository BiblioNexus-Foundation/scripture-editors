export type ViewNameKey = keyof typeof viewModeToViewNames;
export type ViewMode = ViewNameKey;

export const FORMATTED_VIEW_MODE = "formatted";
export const UNFORMATTED_VIEW_MODE = "unformatted";
export const viewModeToViewNames = {
  [FORMATTED_VIEW_MODE]: "Formatted",
  [UNFORMATTED_VIEW_MODE]: "Unformatted",
};
