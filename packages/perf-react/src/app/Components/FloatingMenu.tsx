import { forwardRef } from "react";
import { LexicalEditor } from "lexical";
import IconButton from "./IconButton";

export type FloatingMenuCoords = { x: number; y: number } | undefined;

type FloatingMenuProps = {
  editor: LexicalEditor;
  coords: FloatingMenuCoords;
  items: { label: string; action: (editor: LexicalEditor) => void }[];
};

export const FloatingMenu = forwardRef<HTMLDivElement, FloatingMenuProps>(
  function FloatingMenu(props, ref) {
    const { editor, coords, items } = props;
    const shouldShow = coords !== undefined;

    return (
      <div
        ref={ref}
        className="floating-menu"
        aria-hidden={!shouldShow}
        style={{
          position: "absolute",
          top: coords?.y,
          left: coords?.x,
          visibility: shouldShow ? "visible" : "hidden",
          opacity: shouldShow ? 1 : 0,
        }}
      >
        {items.map(({ label, action }) => (
          <IconButton
            key={`${label}-button`}
            icon={label}
            aria-label="Format text"
            active={false}
            onClick={() => action(editor)}
          />
        ))}
      </div>
    );
  },
);
