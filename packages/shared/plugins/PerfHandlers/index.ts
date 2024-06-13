import { LexicalEditor } from "lexical";
import { registerCursorHandlers } from "./registerCursorHandlers";
import { registerFocusableGrafts } from "./registerFocusableGrafts";

export function registerDefaultPerfHandlers(editor: LexicalEditor) {
  registerFocusableGrafts(editor);
  registerCursorHandlers(editor);
}
