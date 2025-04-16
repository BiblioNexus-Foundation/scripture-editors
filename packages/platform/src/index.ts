export { default as Editorial } from "./Editorial";
export { default as Marginal, type MarginalRef } from "./marginal/Marginal";
export type { LoggerBasic } from "shared/adaptors/logger-basic.model";
export type { AnnotationRange, SelectionRange } from "shared-react/annotation/selection.model";
export type { TextDirection } from "shared-react/plugins/text-direction.model";
export { immutableNoteCallerNodeName } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
export type { UsjNodeOptions } from "shared-react/nodes/scripture/usj/usj-node-options.model";
export {
  type ViewOptions,
  DEFAULT_VIEW_MODE,
  getViewOptions,
  viewOptionsToMode,
} from "./editor/adaptors/view-options.utils";
export type { EditorRef } from "./editor/Editor";
export type { EditorOptions } from "./editor/editor.model";
export type { ViewMode } from "./editor/adaptors/view-mode.model";
export type { Comments } from "./marginal/comments/commenting";
