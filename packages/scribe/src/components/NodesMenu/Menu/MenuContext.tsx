import { createContext } from "react";
import { useMenuCore } from "./useMenuCore";

type MenuContextType = ReturnType<typeof useMenuCore>;

export const MenuContext = createContext<MenuContextType | undefined>(undefined);
