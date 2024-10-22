import React, {
  useEffect,
  useMemo,
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
  useRef,
} from "react";
import { useMenuContext } from "./MenuContext";
import { MenuOption } from "./Option";

type OptionElement = ReactElement<React.ComponentProps<typeof MenuOption>, typeof MenuOption>;

type MenuOptionsProps = {
  children: OptionElement | OptionElement[];
  autoIndex?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export function MenuOptions({ children, autoIndex = true, ...divProps }: MenuOptionsProps) {
  const optionsCount = Children.count(children);
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    updateOptionsCount,
    state: { activeIndex },
  } = useMenuContext();

  useEffect(() => {
    console.log("optionsCount", optionsCount);
    updateOptionsCount(optionsCount);
  }, [optionsCount, updateOptionsCount]);

  const mappedChildren = useMemo(() => {
    if (!autoIndex) return children;

    return Children.map(children, (child, index) => {
      if (isValidElement(child) && child.type === MenuOption && child.props.index === undefined) {
        return cloneElement(child, { index });
      }
      return child;
    });
  }, [children, autoIndex]);

  useEffect(() => {
    if (menuRef.current) {
      const menuElement = menuRef.current;
      const selectedElement = menuElement.children[activeIndex] as HTMLElement;
      if (selectedElement) {
        const menuRect = menuElement.getBoundingClientRect();
        const selectedRect = selectedElement.getBoundingClientRect();

        if (selectedRect.bottom > menuRect.bottom) {
          menuElement.scrollTop += selectedRect.bottom - menuRect.bottom;
        } else if (selectedRect.top < menuRect.top) {
          menuElement.scrollTop -= menuRect.top - selectedRect.top;
        }
      }
    }
  }, [activeIndex]);

  return (
    <div ref={menuRef} role="menu" {...divProps}>
      {mappedChildren}
    </div>
  );
}
