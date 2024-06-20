import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalEditor } from "lexical";
import React from "react";

export default function Button({
  onClick,
  children,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>, editor: LexicalEditor) => void;
}) {
  const [editor] = useLexicalComposerContext();

  return (
    <button
      onClick={(e) => (onClick ? onClick(e, editor) : undefined)}
      {...props}
      className="rounded bg-white px-2 py-1 text-sm font-bold text-cyan-500 hover:bg-cyan-500 hover:text-white"
    >
      {children}
    </button>
  );
}
