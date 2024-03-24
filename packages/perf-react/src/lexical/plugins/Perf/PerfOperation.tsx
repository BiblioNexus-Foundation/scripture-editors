import { SerializedUsfmElementNode } from "shared/nodes/UsfmElementNode";

// Const enum for PerfAction action property
export const enum PerfAction {
  Add = "add",
  Delete = "delete",
  Replace = "replace",
  Move = "move",
}

export const enum PerfKind {
  Sequence = "sequence",
  Block = "block",
  ContentElement = "contentElement",
}

type PerfPath = Array<string | number>;

interface BaseOperation {
  nodeKey: string; // Key of the node
  action: PerfAction; // Action performed on the node
  path: PerfPath; // Array representing the path to the node
  kind: PerfKind; // Type of node (sequence, block, contentElement)
  lexicalState: SerializedUsfmElementNode; // Serialized JSON representation of the node
}

// Interface for the PerfOperation object
export interface AddOperation extends BaseOperation {
  action: PerfAction.Add;
}
export interface DeleteOperation extends Omit<BaseOperation, "lexicalState"> {
  action: PerfAction.Delete;
}
export interface ReplaceOperation extends BaseOperation {
  action: PerfAction.Replace;
}
export interface MoveOperation extends BaseOperation {
  action: PerfAction.Move;
  from: PerfPath; // Array representing the path to the new location of the node
}

export type PerfOperation = AddOperation | DeleteOperation | ReplaceOperation | MoveOperation;
