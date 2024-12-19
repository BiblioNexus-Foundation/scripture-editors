import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useScripturalHandlers } from "./useScripturalHandlers";

export function ScripturalHandlersPlugin(): null {
  const [editor] = useLexicalComposerContext();
  useScripturalHandlers(editor);
  return null;
}
