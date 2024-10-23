import React from "react";
import { MenuContext } from "./MenuContext";
import { useMenuCore } from "./useMenuCore";

type MenuRootProps = {
  children: React.ReactNode;
  autoIndex?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export function MenuRoot({ children, ...divProps }: MenuRootProps) {
  const initialOptionsCount = 0;
  const menuContext = useMenuCore(initialOptionsCount);

  return (
    <MenuContext.Provider value={menuContext}>
      <div {...divProps}>{children}</div>
    </MenuContext.Provider>
  );
}
