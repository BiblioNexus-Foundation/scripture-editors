import type { LexicalEditor } from "lexical";
import { useEffect } from "react";
import { registerDefaultPerfHandlers } from "shared/plugins/PerfHandlers";

export function usePerfHandlers(editor: LexicalEditor): void {
  return useEffect(() => {
    console.log("registering perf handlers");
    return registerDefaultPerfHandlers(editor);
  }, [editor]);
}
