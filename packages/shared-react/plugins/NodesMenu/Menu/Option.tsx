import React, { useEffect, useCallback, forwardRef } from "react";
import { useMenuContext } from "./MenuContext";

type OptionProps = {
  index: number;
  children: React.ReactNode;
  onSelect?: (index: number) => void;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const MenuOption = forwardRef<HTMLButtonElement, OptionProps>(
  ({ index, onSelect, children, onMouseEnter, ...props }, ref) => {
    const {
      state: { selectedIndex, activeIndex },
      setActiveIndex,
      setSelectedIndex,
    } = useMenuContext();

    useEffect(() => {
      if (selectedIndex === index) {
        try {
          onSelect?.(index);
        } catch (error) {
          console.error("Error in onSelect callback:", error);
        }
        setSelectedIndex(-1);
      }
    }, [index, selectedIndex]);

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        setSelectedIndex(index);
        props.onClick?.(event);
      },
      [index, setSelectedIndex, props.onClick],
    );

    const handleMouseEnter = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        setActiveIndex(index);
        onMouseEnter?.(event);
      },
      [index, setActiveIndex, onMouseEnter],
    );
    return (
      <button
        ref={ref}
        role="menuitem"
        {...props}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        aria-selected={index !== undefined && activeIndex === index}
        tabIndex={-1}
      >
        {children}
      </button>
    );
  },
);
