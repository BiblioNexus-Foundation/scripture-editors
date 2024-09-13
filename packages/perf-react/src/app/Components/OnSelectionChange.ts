import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { UpdateListener } from "lexical/LexicalEditor";

export default function OnEditorUpdate({ updateListener }: { updateListener: UpdateListener }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.registerUpdateListener(updateListener);
  }, [updateListener, editor]);
  return null;
}
