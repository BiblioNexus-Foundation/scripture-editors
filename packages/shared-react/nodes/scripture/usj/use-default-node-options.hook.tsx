import { useEffect } from "react";
import { immutableNoteCallerNodeName } from "./ImmutableNoteCallerNode";
import { UsjNodeOptions } from "./usj-node-options.model";

/** Possible note callers to use when caller is '+'. Up to 2 characters are used, e.g. a-zz */
export const defaultNoteCallers = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

export default function useDefaultNodeOptions(nodeOptions: UsjNodeOptions) {
  useEffect(() => {
    if (!nodeOptions[immutableNoteCallerNodeName]) nodeOptions[immutableNoteCallerNodeName] = {};
    const optionsNoteCallers = nodeOptions[immutableNoteCallerNodeName].noteCallers;
    if (!optionsNoteCallers || optionsNoteCallers.length <= 0)
      nodeOptions[immutableNoteCallerNodeName].noteCallers = defaultNoteCallers;
  }, [nodeOptions]);
}
