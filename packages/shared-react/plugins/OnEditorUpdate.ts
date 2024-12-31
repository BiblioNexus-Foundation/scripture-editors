import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { LexicalEditor } from "lexical";

//Small plugin for testing update related plugins,
//it is intended to be used temporarily inside the LexicalComposer to test new plugin ideas.
export default function OnEditorUpdate({
  updateListener,
}: {
  updateListener: Parameters<LexicalEditor["registerUpdateListener"]>[0];
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.registerUpdateListener(updateListener);
  }, [updateListener, editor]);
  return null;
}
