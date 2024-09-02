import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLayoutEffect } from "react";

export default function EditablePlugin({ isEditable }: { isEditable: boolean }): null {
  const [editor] = useLexicalComposerContext();

  useLayoutEffect(() => {
    editor.setEditable(isEditable);
  }, [editor, isEditable]);

  return null;
}
