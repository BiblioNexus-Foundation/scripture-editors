import { useRef, useEffect } from "react";
import { useFindReplace } from "@scriptural/react";
import { X, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { VscReplace } from "react-icons/vsc";
import { VscReplaceAll } from "react-icons/vsc";

export function FindReplaceDialog() {
  const {
    searchText,
    setSearchText,
    replaceText,
    setReplaceText,
    results,
    currentResultIndex,
    isVisible,
    handlePrev,
    handleNext,
    handleReplace,
    handleReplaceAll,
    handleClose,
    isSearching,
  } = useFindReplace();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus the search input when the component becomes visible
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 w-80 bg-white rounded-md shadow-lg overflow-hidden border border-gray-200 z-50">
      <div className="flex items-center content-center justify-between px-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Find & Replace</h3>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              ref={searchInputRef}
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Find"
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex items-center space-x-1">
              <button
                onClick={handlePrev}
                disabled={results.length === 0 || isSearching}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Previous"
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={handleNext}
                disabled={results.length === 0 || isSearching}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500 flex items-center h-5">
            {isSearching ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1" />
                <span>Searching...</span>
              </>
            ) : results.length > 0 ? (
              `${currentResultIndex + 1} of ${results.length}`
            ) : searchText ? (
              "No results"
            ) : (
              "Type to search"
            )}
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Replace with"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReplace}
              disabled={results.length === 0 || currentResultIndex === -1 || isSearching}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              title="Replace"
            >
              <VscReplace size={14} className="mr-1.5" />
              <span>Replace</span>
            </button>
            <button
              onClick={handleReplaceAll}
              disabled={results.length === 0 || isSearching}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              title="Replace All"
            >
              <VscReplaceAll size={14} className="mr-1.5" />
              <span>Replace All</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
