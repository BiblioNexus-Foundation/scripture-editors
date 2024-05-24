import { LexicalEditor } from "lexical";
import { UpdateListener } from "lexical/LexicalEditor";

export const registerOnChange = (editor: LexicalEditor, onChange: UpdateListener) => {
  const handleChange: UpdateListener = ({
    editorState,
    dirtyElements,
    dirtyLeaves,
    prevEditorState,
    normalizedNodes,
    tags,
  }) => {
    onChange({
      editorState,
      dirtyElements,
      dirtyLeaves,
      prevEditorState,
      normalizedNodes,
      tags,
    });
  };

  return editor.registerUpdateListener(handleChange);
};
