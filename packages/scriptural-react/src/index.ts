// Re-export everything from context and plugins
export * from "./context";
export * from "./plugins";
export * from "./utils";
export { default as ScripturalEditorComposer } from "./ScripturalEditorComposer";
export { ScrollToReferencePlugin } from "./plugins/ScrollToReferencePlugin";
export { FindReplacePlugin, useFindReplace, FindReplaceUI } from "./plugins/FindReplacePlugin";
export { useMarkersMenu, MarkersMenuProvider } from "./plugins/ScripturalNodesMenuPlugin";
export { MarkersToolbar, MarkersToolbarWithProvider } from "./plugins/ToolbarPlugin/MarkersToolbar";
export { DEFAULT_SCRIPTURAL_BASE_SETTINGS } from "./plugins/BaseSettingsPlugin";

// Export any additional utilities or helpers specific to this package
export const VERSION = "0.0.1";
