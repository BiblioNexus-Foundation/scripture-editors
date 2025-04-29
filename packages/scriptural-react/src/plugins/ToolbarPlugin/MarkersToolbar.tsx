import { ReactNode } from "react";
import { LexicalEditor } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  useMarkersMenu,
  MarkersMenuProvider,
  MarkerMenuItem,
} from "../ScripturalNodesMenuPlugin/MarkersMenuContext";
import { ToolbarSection } from "./index";

type ToolbarButtonProps = {
  children: ReactNode;
  className?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>, editor: LexicalEditor) => void;
  title?: string;
  "data-marker"?: string;
};

function ToolbarButton({
  children,
  onClick,
  className,
  "data-marker": dataMarker,
  ...props
}: ToolbarButtonProps) {
  const [editor] = useLexicalComposerContext();

  return (
    <button
      className={`toolbar-button ${className || ""}`}
      onClick={(e) => onClick(e, editor)}
      data-marker={dataMarker}
      {...props}
    >
      {children}
    </button>
  );
}

export type CustomMarkerCategories = Record<string, string[]>;

export interface MarkerFilterOptions {
  customMarkers?: CustomMarkerCategories | string[];
}

export interface FilteredMarkersResult {
  categories: Record<string, MarkerMenuItem[]>;
  filteredMarkers: MarkerMenuItem[];
  isLoading: boolean;
}

/**
 * Hook to filter and categorize markers based on custom configuration
 */
export function useFilteredMarkers(options?: MarkerFilterOptions): FilteredMarkersResult {
  const { markersMenuItems, isLoading } = useMarkersMenu();
  const { customMarkers } = options || {};

  if (isLoading || !markersMenuItems || markersMenuItems.length === 0) {
    return { categories: {}, filteredMarkers: [], isLoading };
  }

  // Filter markers based on customMarkers if provided
  let filteredMarkers = markersMenuItems;
  if (customMarkers) {
    if (Array.isArray(customMarkers)) {
      // If customMarkers is an array of marker names
      filteredMarkers = markersMenuItems.filter((item) => customMarkers.includes(item.name));
    }
  }

  // Create categories
  let categories: Record<string, MarkerMenuItem[]>;

  if (customMarkers && !Array.isArray(customMarkers)) {
    // Use user-defined categories
    categories = {};

    // Initialize all categories with empty arrays
    Object.keys(customMarkers).forEach((category) => {
      categories[category] = [];
    });

    // Fill categories with filtered markers
    Object.entries(customMarkers).forEach(([category, markerNames]) => {
      categories[category] = filteredMarkers.filter((item) => markerNames.includes(item.name));
    });
  } else {
    // Use default categorization
    categories = {
      CharacterFormatting: filteredMarkers.filter((item) =>
        ["it", "bd", "bdit", "em", "sc", "no"].includes(item.name),
      ),
      Paragraphs: filteredMarkers.filter((item) =>
        ["p", "m", "pi", "li", "q"].some((prefix) => item.name.startsWith(prefix)),
      ),
      Other: filteredMarkers.filter(
        (item) =>
          !["it", "bd", "bdit", "em", "sc", "no"].includes(item.name) &&
          !["p", "m", "pi", "li", "q"].some((prefix) => item.name.startsWith(prefix)),
      ),
    };
  }

  return { categories, filteredMarkers, isLoading };
}

export interface MarkersToolbarProps extends MarkerFilterOptions {
  className?: string;
}

export function MarkersToolbar({ className = "", customMarkers }: MarkersToolbarProps) {
  const { categories, isLoading } = useFilteredMarkers({ customMarkers });

  if (isLoading || Object.keys(categories).length === 0) {
    return null;
  }

  return (
    <>
      {Object.entries(categories).map(([categoryName, items]) => {
        if (items.length === 0) return null;

        return (
          <ToolbarSection key={`markers-section-${categoryName}`} className={className}>
            {items.map((item) => (
              <ToolbarButton
                key={`marker-${item.name}`}
                className={categoryName}
                onClick={(_, editor) => item.action(editor)}
                data-marker={item.name}
                title={item.description}
              >
                {item.name}
              </ToolbarButton>
            ))}
          </ToolbarSection>
        );
      })}
    </>
  );
}

export function MarkersToolbarWithProvider({ className = "", customMarkers }: MarkersToolbarProps) {
  return (
    <MarkersMenuProvider>
      <MarkersToolbar className={className} customMarkers={customMarkers} />
    </MarkersMenuProvider>
  );
}
