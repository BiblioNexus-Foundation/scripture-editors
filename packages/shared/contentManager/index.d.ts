// TODO: remove this file when `packages\shared\contentManager\index.js` is converted to TS.

import { SerializedEditorState } from "lexical";
import { PerfDocument } from "../plugins/PerfOperations/perfTypes";

export function getLexicalState(perf: PerfDocument): SerializedEditorState;

export function getPerf(usfm: string): Promise<PerfDocument>;
