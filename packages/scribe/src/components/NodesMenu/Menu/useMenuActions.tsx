import { useMemo } from "react";
import { useMenuContext } from "./useMenuContext";

export function useMenuActions() {
  const { moveUp, moveDown, select } = useMenuContext();

  return useMemo(
    () => ({
      moveUp,
      moveDown,
      select,
    }),
    [moveUp, moveDown, select],
  );
}
