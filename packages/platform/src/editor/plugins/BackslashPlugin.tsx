import { computePosition } from "@floating-ui/dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BackslashMenu, BackslashMenuCoords } from "../components/BackslashMenu/BackslashMenu";
import { useBackslashMenu } from "../components/BackslashMenu/useBackslashMenu";

const DOM_ELEMENT = document.body;

export default function FloatingMenuPlugin() {
  const ref = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<BackslashMenuCoords>(undefined);
  const [editor] = useLexicalComposerContext();
  const [backslashOpen, setBackslashOpen] = useState(false);

  const { isKeyDown, isKeyReleased } = useBackslashMenu();

  const calculatePosition = useCallback(() => {
    const domSelection = getSelection();
    const domRange = domSelection?.rangeCount !== 0 && domSelection?.getRangeAt(0);
    if (!domRange || !ref.current) {
      return setCoords(undefined);
    }
    computePosition(domRange, ref.current, { placement: "bottom-start" })
      .then((pos) => {
        setCoords({ x: pos.x, y: pos.y - 10 });
      })
      .catch(() => {
        setCoords(undefined);
      });
  }, [isKeyDown]);

  const closeMenu = () => {
    setBackslashOpen(false);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "\\") {
        event.preventDefault();
        calculatePosition();
        setBackslashOpen((prev) => !prev);
      }
    };
    return editor.registerRootListener(
      (rootElement: HTMLElement | null, prevRootElement: HTMLElement | null) => {
        if (prevRootElement !== null) {
          prevRootElement.removeEventListener("keydown", onKeyDown);
        }
        if (rootElement !== null) {
          rootElement.addEventListener("keydown", onKeyDown);
        }
      },
    );
  }, [editor]);

  const $handleSelectionChange = useCallback(() => {
    if (editor.isComposing() || editor.getRootElement() !== document.activeElement) {
      setCoords(undefined);
      return;
    }
    const selection = $getSelection();
    if ($isRangeSelection(selection) && !selection.anchor.is(selection.focus) && backslashOpen) {
      calculatePosition();
    } else {
      setCoords(undefined);
    }
  }, [editor, calculatePosition, backslashOpen]);

  const show = coords !== undefined && backslashOpen;

  useEffect(() => {
    if (!show && isKeyReleased) {
      editor.getEditorState().read(() => $handleSelectionChange());
    }
  }, [isKeyReleased, $handleSelectionChange, editor]);

  return createPortal(
    <BackslashMenu ref={ref} editor={editor} coords={coords} closeMenu={closeMenu} />,
    DOM_ELEMENT,
  );
}
