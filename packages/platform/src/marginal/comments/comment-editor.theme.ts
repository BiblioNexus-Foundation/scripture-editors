/**
 * Adapted from https://github.com/facebook/lexical/blob/93cf85e12033b114ad347dcccf508c846a833731/packages/lexical-playground/src/themes/CommentEditorTheme.ts
 */

import type { EditorThemeClasses } from "lexical";
import baseTheme from "../../editor/editor.theme";
import "./comment-editor.theme.css";

const theme: EditorThemeClasses = {
  ...baseTheme,
  paragraph: "CommentEditorTheme__paragraph",
};

export default theme;
