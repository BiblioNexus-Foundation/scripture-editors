import { memo, ReactNode, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { FloatingBox } from "../FloatingBox";
import { TriggerFn } from "shared/plugins/Typeahead";
import { useFloatingPosition } from "./useFloatingPosition";
import { TypeaheadData, useTypeaheadData } from "./useTypeaheadData";

const DOM_ELEMENT = document.body;

const MemoizedFloatingBox = memo(FloatingBox);

export type FloatingMenuCoords = { x: number; y: number } | undefined;

type TypeaheadPluginProps = {
  trigger?: string | TriggerFn;
  children: ReactNode | ((props: { typeaheadData: TypeaheadData | undefined }) => ReactNode);
};

/**
 * TypeaheadPlugin component is responsible for rendering a floating menu
 * when the user's typing matches a trigger function or string
 */
export default function TypeaheadFloatingBox({ trigger, children }: TypeaheadPluginProps) {
  const floatingBoxRef = useRef<HTMLDivElement>(null);
  const typeaheadData = useTypeaheadData(trigger);
  const { coords, updatePosition, cleanup } = useFloatingPosition();

  useEffect(() => {
    if (!typeaheadData || !floatingBoxRef.current) {
      cleanup();
      return;
    }

    const domRange = window.getSelection()?.getRangeAt(0);
    if (domRange) {
      updatePosition(domRange, floatingBoxRef.current);
      return cleanup;
    }
  }, [typeaheadData, updatePosition, cleanup]);

  const renderChildren = useMemo(
    () => (coords ? (typeof children === "function" ? children : () => children) : () => null),
    [children, coords],
  );

  return createPortal(
    <MemoizedFloatingBox
      ref={floatingBoxRef}
      coords={coords}
      style={coords ? undefined : { display: "none" }}
    >
      {renderChildren({ typeaheadData })}
    </MemoizedFloatingBox>,
    DOM_ELEMENT,
  );
}
