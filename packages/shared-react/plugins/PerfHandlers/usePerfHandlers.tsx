import type { LexicalEditor } from "lexical";
import { useEffect } from "react";
import { registerDefaultPerfHandlers } from "shared/plugins/PerfHandlers";

export function usePerfHandlers(editor: LexicalEditor): void {
  useEffect(() => {
    return registerDefaultPerfHandlers(editor);
  }, [editor]);
}
