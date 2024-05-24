import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import React from "react";

export default function SaveButton(
  props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
) {
  const [editor] = useLexicalComposerContext();
  return (
    <button
      {...props}
      onClick={(...args) => {
        editor.update(() => null, { tag: "history-push" });
        (props.onClick as React.MouseEventHandler<HTMLButtonElement> | undefined)?.(...args);
      }}
    >
      Save
    </button>
  );
}
