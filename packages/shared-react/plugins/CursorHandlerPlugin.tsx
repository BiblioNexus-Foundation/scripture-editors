import { registerCursorHandlers } from "shared/plugins/CursorHandler";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

export function CursorHandlerPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return registerCursorHandlers(editor);
  }, [editor]);
  return null;
}
