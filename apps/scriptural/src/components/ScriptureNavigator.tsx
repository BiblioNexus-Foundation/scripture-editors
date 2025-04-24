import { useState, useEffect } from "react";
import { ScriptureReferenceHandler, ReferenceChangeEvent } from "@scriptural/react";
import { ScriptureReference } from "@scriptural/react/internal-packages/shared-react/plugins/ScriptureReferencePlugin";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen, ChevronsRight, ChevronsLeft } from "lucide-react";

interface ScriptureNavigatorProps {
  referenceHandler: ScriptureReferenceHandler;
}

// Book codes mapping (abbreviated list - you can expand this)
const BOOK_OPTIONS = [
  { value: "GEN", label: "Genesis" },
  { value: "EXO", label: "Exodus" },
  { value: "LEV", label: "Leviticus" },
  { value: "MAT", label: "Matthew" },
  { value: "MRK", label: "Mark" },
  { value: "LUK", label: "Luke" },
  { value: "JHN", label: "John" },
  { value: "ACT", label: "Acts" },
  { value: "ROM", label: "Romans" },
  { value: "TIT", label: "Titus" },
  { value: "REV", label: "Revelation" },
];

export function ScriptureNavigator({ referenceHandler }: ScriptureNavigatorProps) {
  const [reference, setReference] = useState<ScriptureReference>({
    book: "TIT",
    chapter: 1,
    verse: 1,
  });

  // State to track last update source
  const [lastUpdateSource, setLastUpdateSource] = useState<string>("");

  // Subscribe to reference handler changes
  useEffect(() => {
    const unsubscribe = referenceHandler.subscribe((event: ReferenceChangeEvent) => {
      if (event.reference && event.source !== "navigator") {
        setReference(event.reference);
        setLastUpdateSource(event.source);
      }
    });
    return unsubscribe;
  }, [referenceHandler]);

  // Handle local reference changes and propagate to handler
  const handleReferenceChange = (partialRef: Partial<ScriptureReference>) => {
    const newRef = { ...reference, ...partialRef };
    setReference(newRef);
    setLastUpdateSource("navigator");
    referenceHandler.setReference(newRef, "navigator", {
      changeSource: "user_interface",
    });
  };

  // Common button style for navigation
  const navButtonClass =
    "h-9 px-2 text-xs bg-white/10 hover:bg-white/20 border-white/20 text-white flex items-center justify-center";

  return (
    <div className="flex items-center justify-center">
      {/* Book selector */}
      <div className="flex items-center mr-4">
        <BookOpen className="h-4 w-4 mr-2 text-gray-300" />
        <select
          className="h-9 rounded-md border-0 py-1.5 pl-3 pr-6 text-sm bg-white/10 text-white"
          value={reference.book}
          onChange={(e) => handleReferenceChange({ book: e.target.value })}
        >
          {BOOK_OPTIONS.map((book) => (
            <option key={book.value} value={book.value}>
              {book.label}
            </option>
          ))}
        </select>
      </div>

      {/* Navigation controls with inputs in the middle */}
      <div className="flex items-center space-x-1">
        {/* Chapter navigation */}
        <Button
          variant="outline"
          className={navButtonClass}
          title="Previous chapter"
          onClick={() =>
            handleReferenceChange({
              chapter: Math.max(1, reference.chapter - 1),
              verse: 1,
            })
          }
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Verse navigation (previous) */}
        <Button
          variant="outline"
          className={navButtonClass}
          title="Previous verse"
          onClick={() =>
            handleReferenceChange({
              verse: Math.max(1, reference.verse - 1),
            })
          }
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Reference inputs */}
        <div className="flex items-center px-1">
          <input
            type="number"
            className={`h-9 w-14 rounded-md border-0 py-1.5 pl-2 pr-1 text-sm ${
              lastUpdateSource === "editor_content" ? "bg-blue-500/20" : "bg-white/10"
            } text-white transition-colors duration-500`}
            value={reference.chapter}
            min={1}
            title="Chapter"
            onChange={(e) =>
              handleReferenceChange({
                chapter: parseInt(e.target.value) || 1,
              })
            }
          />
          <span className="text-sm text-white mx-1">:</span>
          <input
            type="number"
            className={`h-9 w-14 rounded-md border-0 py-1.5 pl-2 pr-1 text-sm ${
              lastUpdateSource === "editor_content" ? "bg-blue-500/20" : "bg-white/10"
            } text-white transition-colors duration-500`}
            value={reference.verse}
            min={1}
            title="Verse"
            onChange={(e) =>
              handleReferenceChange({
                verse: parseInt(e.target.value) || 1,
              })
            }
          />
        </div>

        {/* Verse navigation (next) */}
        <Button
          variant="outline"
          className={navButtonClass}
          title="Next verse"
          onClick={() =>
            handleReferenceChange({
              verse: reference.verse + 1,
            })
          }
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Chapter navigation (next) */}
        <Button
          variant="outline"
          className={navButtonClass}
          title="Next chapter"
          onClick={() =>
            handleReferenceChange({
              chapter: reference.chapter + 1,
              verse: 1,
            })
          }
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
