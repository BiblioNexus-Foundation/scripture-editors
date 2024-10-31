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
  ({ index, onSelect, children, onMouseEnter, onClick, ...props }, ref) => {
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
      // No need to add onSelect to the dependency array as it shouldn't change,
      // adding it would cause possible infinite loops (possible redesign opportunity)
    }, [index, selectedIndex, setSelectedIndex]);

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        setSelectedIndex(index);
        onClick?.(event);
      },
      [index, setSelectedIndex, onClick],
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
