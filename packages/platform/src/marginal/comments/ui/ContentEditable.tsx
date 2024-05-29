/**
 * Adapted from https://github.com/facebook/lexical/blob/93cf85e12033b114ad347dcccf508c846a833731/packages/lexical-playground/src/ui/ContentEditable.tsx
 */

import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import "./ContentEditable.css";

export default function LexicalContentEditable({ className }: { className?: string }): JSX.Element {
  return <ContentEditable className={className || "ContentEditable__root"} />;
}
