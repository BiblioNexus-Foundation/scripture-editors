import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalEditor } from "lexical";
import React from "react";

export default function ToolbarButton({
  onClick,
  children,
  className,
  title,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "className" | "title"> & {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>, editor: LexicalEditor) => void;
  className?: string;
  title?: string;
}) {
  const [editor] = useLexicalComposerContext();

  return (
    <button
      onClick={(e) => (onClick ? onClick(e, editor) : undefined)}
      className={`scribe-toolbar-button ${className || ""}`}
      title={title}
      aria-label={title}
      {...props}
    >
      {children}
    </button>
  );
}
