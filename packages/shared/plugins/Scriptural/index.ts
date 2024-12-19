import { LexicalEditor } from "lexical";
import { registerToggableNodes } from "./registerFocusableGrafts";

export function registerDefaultScripturalHandlers(editor: LexicalEditor) {
  registerToggableNodes(editor);
}
