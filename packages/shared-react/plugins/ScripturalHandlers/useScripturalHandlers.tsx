import type { LexicalEditor } from "lexical";
import { useEffect } from "react";
import { registerDefaultScripturalHandlers } from "shared/plugins/Scriptural";

export function useScripturalHandlers(editor: LexicalEditor): void {
  return useEffect(() => {
    return registerDefaultScripturalHandlers(editor);
  }, [editor]);
}
