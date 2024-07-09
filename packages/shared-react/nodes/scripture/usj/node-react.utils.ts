import { $isElementNode, LexicalNode } from "lexical";
import { GENERATOR_NOTE_CALLER } from "shared/nodes/scripture/usj/NoteNode";
import { LoggerBasic } from "../../../plugins/logger-basic.model";
import { $isImmutableNoteCallerNode, ImmutableNoteCallerNode } from "./ImmutableNoteCallerNode";

/** Caller count is in an object so it can be manipulated by passing the the object. */
export type CallerData = {
  count: number;
};

/**
 * Generate the note caller to use. E.g. for '+' replace with a-z, aa-zz.
 * @param markerCaller - The specified note caller.
 * @param noteCallers - List of possible note callers.
 * @param callerData - Caller count. Passed via object so this function can modify the count.
 * @param logger - Logger to use, if any.
 * @returns the specified caller, if '+' replace with up to 2 characters from the possible note
 *   callers list, '*' if undefined.
 */
export function generateNoteCaller(
  markerCaller: string | undefined,
  noteCallers: string[] | undefined,
  callerData: CallerData,
  logger: LoggerBasic | undefined,
): string {
  let caller = markerCaller;
  if (markerCaller === GENERATOR_NOTE_CALLER && noteCallers && noteCallers.length > 0) {
    if (callerData.count >= noteCallers.length ** 2 + noteCallers.length) {
      callerData.count = 0;
      logger?.warn("Note caller count was reset. Consider adding more possible note callers.");
    }

    const callerIndex = callerData.count % noteCallers.length;
    let callerLeadChar = "";
    if (callerData.count >= noteCallers.length) {
      const callerLeadCharIndex = Math.trunc(callerData.count / noteCallers.length) - 1;
      callerLeadChar = noteCallers[callerLeadCharIndex];
    }
    caller = callerLeadChar + noteCallers[callerIndex];
    callerData.count += 1;
  }
  return caller ?? "*";
}

/**
 * Find all ImmutableNoteCallerNodes in the given nodes tree.
 * @param nodes - Lexical node array to look in.
 * @returns an array of all ImmutableNoteCallerNodes in the tree.
 */
export function $findImmutableNoteCallerNodes(nodes: LexicalNode[]): ImmutableNoteCallerNode[] {
  const immutableNoteCallerNodes: ImmutableNoteCallerNode[] = [];

  function $traverse(node: LexicalNode) {
    if ($isImmutableNoteCallerNode(node)) immutableNoteCallerNodes.push(node);
    if (!$isElementNode(node)) return;

    const children = node.getChildren();
    children.forEach($traverse);
  }

  nodes.forEach($traverse);

  return immutableNoteCallerNodes;
}
