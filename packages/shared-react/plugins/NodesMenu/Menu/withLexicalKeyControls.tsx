import React from "react";
import { useMenuActions } from "./useMenuActions";
import { useLexicalMenuNavigation } from "./useLexicalMenuNavigation";

export function withLexicalKeyControls<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function LexicalKeyControlledContainer(
    props: React.ComponentProps<typeof WrappedComponent>,
  ) {
    const menu = useMenuActions();
    useLexicalMenuNavigation(menu);

    return <WrappedComponent {...props} />;
  };
}
