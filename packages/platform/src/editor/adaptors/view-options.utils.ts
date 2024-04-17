import {
  ViewMode,
  formattedViewMode as defaultViewMode,
  formattedViewMode,
  unformattedViewMode,
} from "../toolbar/view-mode.model";

export type ViewOptions = {
  /** USFM markers are visible, editable or hidden */
  markerMode: "visible" | "editable" | "hidden";
  /** does the text have spacing including indenting */
  hasSpacing: boolean;
  /** is the text in a formatted font */
  isFormattedFont: boolean;
};

/**
 * Get view option properties based on the view mode.
 * @param viewMode - View mode of the editor.
 * @returns the view options if the view exists, the default options if the viewMode is undefined,
 *   `undefined` otherwise.
 */
export function getViewOptions(viewMode: string | undefined): ViewOptions | undefined {
  let viewOptions: ViewOptions | undefined;
  switch (viewMode ?? defaultViewMode) {
    case formattedViewMode:
      viewOptions = {
        markerMode: "hidden",
        hasSpacing: true,
        isFormattedFont: true,
      };
      break;
    case unformattedViewMode:
      viewOptions = {
        markerMode: "editable",
        hasSpacing: false,
        isFormattedFont: false,
      };
      break;
    default:
      break;
  }
  return viewOptions;
}

/**
 * Convert view options to view mode if the view exists.
 * @param viewOptions - View options of the editor.
 * @returns the view mode if the view is defined, `undefined` otherwise.
 */
export function viewOptionsToMode(viewOptions: ViewOptions | undefined): ViewMode | undefined {
  if (!viewOptions) return undefined;

  const { markerMode, hasSpacing, isFormattedFont } = viewOptions;
  if (markerMode === "hidden" && hasSpacing && isFormattedFont) return formattedViewMode;
  if (markerMode === "editable" && !hasSpacing && !isFormattedFont) return unformattedViewMode;
  return undefined;
}
