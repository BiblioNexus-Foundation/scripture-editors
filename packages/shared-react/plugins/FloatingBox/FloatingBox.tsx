import { forwardRef, ReactNode } from "react";

export type FloatingBoxCoords = { x: number; y: number } | undefined;

export type FloatingBoxProps = {
  coords: FloatingBoxCoords;
  children?: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const FloatingBox: React.ForwardRefExoticComponent<
  FloatingBoxProps & React.RefAttributes<HTMLDivElement>
> = forwardRef(function FloatingBox(props, ref) {
  const { coords, children, style, ...extraProps } = props;
  const shouldShow = coords !== undefined;

  return (
    <div
      ref={ref}
      className="floating-box"
      aria-hidden={!shouldShow}
      style={{
        ...style,
        position: "absolute",
        zIndex: 1000,
        top: coords?.y,
        left: coords?.x,
        visibility: shouldShow ? "visible" : "hidden",
        opacity: shouldShow ? 1 : 0,
      }}
      {...extraProps}
    >
      {children}
    </div>
  );
});
