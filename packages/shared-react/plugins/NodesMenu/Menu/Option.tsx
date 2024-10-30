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
  ({ index, onSelect, children, onClick, onMouseEnter, ...props }, ref) => {
    const {
      state: { selectedIndex, activeIndex },
      setActiveIndex,
      setSelectedIndex,
    } = useMenuContext();

    useEffect(() => {
      if (index !== undefined && selectedIndex === index) {
        onSelect?.(index);
        setSelectedIndex(-1);
      }
    }, [index, selectedIndex, onSelect]);

    const handleClick = useCallback(() => {
      if (index !== undefined) {
        setSelectedIndex(index);
      }
    }, [index, setSelectedIndex, onClick]);

    const handleMouseEnter = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (index !== undefined) {
          setActiveIndex(index);
        }
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
