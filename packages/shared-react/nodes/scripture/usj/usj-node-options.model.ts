import { NodeOptions } from "../../../adaptors/editor-adaptor.model";
import { OnClick, immutableNoteCallerNodeName } from "./ImmutableNoteCallerNode";

/** Options for each editor node. */
export interface UsjNodeOptions extends NodeOptions {
  [immutableNoteCallerNodeName]: {
    /** Possible note callers to use when caller is '+'. */
    noteCallers?: string[];
    /** Click handler function. */
    onClick?: OnClick;
  };
}
