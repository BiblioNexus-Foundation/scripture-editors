import { UsjNodeOptions } from "shared-react/nodes/usj/usj-node-options.model";
import { TextDirection } from "shared-react/plugins/usj/text-direction.model";
import { ViewOptions } from "shared-react/views/view-options.utils";

/** Options to configure the editor. */
export type EditorOptions = {
  /** Is the editor readonly or editable. */
  isReadonly?: boolean;
  /** Is the editor enabled for spell checking. */
  hasSpellCheck?: boolean;
  /** Text direction: "ltr" | "rtl" | "auto". */
  textDirection?: TextDirection;
  /** Key to trigger the marker menu. Defaults to '\'. */
  markerMenuTrigger?: string;
  /**
   * View options - EXPERIMENTAL. Defaults to the formatted view mode which is currently the only
   * functional option.
   */
  view?: ViewOptions;
  /** Options for each editor node:
   * @param nodes.ImmutableNoteCallerNode.noteCallers - Possible note callers to use when caller is
   *   '+'. Defaults to Latin lower case letters.
   * @param nodes.ImmutableNoteCallerNode.onClick - Click handler method.
   */
  nodes?: UsjNodeOptions;
  /** EXPERIMENTAL: Is the editor being debugged using the TreeView */
  debug?: boolean;
};
