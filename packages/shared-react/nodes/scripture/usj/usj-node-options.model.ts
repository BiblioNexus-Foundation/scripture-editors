import { NodeOptions } from "shared/adaptors/editor-adaptor.model";
import { OnClick, immutableNoteCallerNodeName } from "./ImmutableNoteCallerNode";

export const MarkNodeName = "MarkNode";

export type AddMissingComments = (usjCommentIds: string[]) => void;

/** Options for each editor node. */
export interface UsjNodeOptions extends NodeOptions {
  [immutableNoteCallerNodeName]?: {
    /** Possible note callers to use when caller is '+'. */
    noteCallers?: string[];
    /** Click handler method. */
    onClick?: OnClick;
  };
  [MarkNodeName]?: {
    /** Method to add missing comments. */
    addMissingComments?: AddMissingComments;
  };
}
