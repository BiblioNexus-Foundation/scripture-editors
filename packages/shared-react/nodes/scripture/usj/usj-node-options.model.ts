import { NodeOptions } from "../../../adaptors/editor-adaptor.model";
import { OnClick, immutableNoteCallerNodeName } from "./ImmutableNoteCallerNode";

export interface UsjNodeOptions extends NodeOptions {
  [immutableNoteCallerNodeName]: {
    noteCallers?: string[];
    onClick?: OnClick;
  };
}
