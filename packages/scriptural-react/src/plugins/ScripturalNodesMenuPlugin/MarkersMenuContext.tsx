import { LexicalEditor } from "lexical";
import { createContext, useContext, ReactNode, useMemo } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useScripturalComposerContext } from "../../context";
import { getScripturalMarkerAction } from "shared/utils/scriptureMarkers/getScripturalMarkerActions";
import useScripturalMakersForMenu from "./useScripturalMarkersForMenu";

export type MarkerMenuItem = {
  name: string;
  label: string;
  description: string;
  action: (editor: LexicalEditor) => void;
};

interface MarkersMenuContextType {
  markersMenuItems: MarkerMenuItem[] | undefined;
  isLoading: boolean;
}

const MarkersMenuContext = createContext<MarkersMenuContextType | null>(null);

export function useMarkersMenu() {
  const context = useContext(MarkersMenuContext);
  if (!context) {
    throw new Error("useMarkersMenu must be used within a MarkersMenuProvider");
  }
  return context;
}

export function MarkersMenuProvider({ children }: { children: ReactNode }) {
  const [editor] = useLexicalComposerContext();
  const { scriptureReference, selectedMarker } = useScripturalComposerContext();

  const { markersMenuItems } = useScripturalMakersForMenu({
    editor,
    scriptureReference: scriptureReference || { book: "", chapter: 0, verse: 0 },
    contextMarker: selectedMarker,
    getMarkerAction: getScripturalMarkerAction,
  });

  const isLoading = !markersMenuItems;

  const value = useMemo(
    () => ({
      markersMenuItems,
      isLoading,
    }),
    [markersMenuItems, isLoading],
  );

  return <MarkersMenuContext.Provider value={value}>{children}</MarkersMenuContext.Provider>;
}
