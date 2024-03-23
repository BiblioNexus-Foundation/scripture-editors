import { SerializedUsfmElementNode } from "shared/nodes/UsfmElementNode";

// Const enum for PerfAction action property
export const enum PerfAction {
  Add = "add",
  Delete = "delete",
  Replace = "replace",
  Move = "move",
}
type PerfPath = Array<string | number>;
// Interface for the PerfOperation object
interface AddOperation {
  nodeKey: string; // Key of the node
  action: PerfAction.Add;
  path: PerfPath; // Array representing the path to the location of the new node
  kind: string; // Type of node (sequence, block, contentElement)
  lexicalState: SerializedUsfmElementNode; // Serialized JSON representation of the node
}
interface DeleteOperation {
  nodeKey: string; // Key of the node
  action: PerfAction.Delete;
  path: PerfPath; // Array representing the path to the node
  kind: string; // Type of node (sequence, block, contentElement)
}
interface ReplaceOperation {
  nodeKey: string; // Key of the node
  action: PerfAction.Replace;
  path: PerfPath; // Array representing the path to the node
  kind: string; // Type of node (sequence, block, contentElement)
  lexicalState: SerializedUsfmElementNode; // Serialized JSON representation of the new node
}
interface MoveOperation {
  nodeKey: string; // Key of the node
  action: PerfAction.Move;
  path: PerfPath; // Array representing the path to the original location of the node
  to: PerfPath; // Array representing the path to the new location of the node
  kind: string; // Type of node (sequence, block, contentElement)
  lexicalState: SerializedUsfmElementNode; // Serialized JSON representation of the node
}

export type PerfOperation = AddOperation | DeleteOperation | ReplaceOperation | MoveOperation;
