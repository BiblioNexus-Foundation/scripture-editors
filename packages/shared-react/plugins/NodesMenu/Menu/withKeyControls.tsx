import React, { useRef, useCallback, useEffect } from "react";
import { useMenuActions } from "./useMenuActions";

export const withKeyControls = <P extends object, T extends HTMLElement = HTMLDivElement>(
  WrappedComponent: React.ForwardRefExoticComponent<P & React.RefAttributes<T>>,
) => {
  return ({ ...props }: P) => {
    const containerRef = useRef<T>(null);
    const menu = useMenuActions();

    console.log({ WrappedComponent });

    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            menu.moveDown();
            break;
          case "ArrowUp":
            event.preventDefault();
            menu.moveUp();
            break;
          case "Enter":
          case "Tab":
            event.preventDefault();
            menu.select();
            break;
        }
      },
      [menu],
    );

    useEffect(() => {
      const container = containerRef.current;
      console.log("CONTAINER", container);
      if (container) {
        container.addEventListener("keydown", handleKeyDown);
        console.log("REGISTER KEYDOWN LISTENER");
        return () => {
          console.log("UNREGISTER KEYDOWN LISTENER");
          container.removeEventListener("keydown", handleKeyDown);
        };
      }
    }, [handleKeyDown]);

    return <WrappedComponent {...props} ref={containerRef} tabIndex={0} />;
  };
};
