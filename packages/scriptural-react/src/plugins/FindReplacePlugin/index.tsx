import React, { useState, useRef, useCallback, useEffect, createContext, useContext } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, LexicalEditor, TextNode } from "lexical";
import { $getSelection, $isRangeSelection } from "lexical";
import { $createRangeSelection, $setSelection } from "lexical";
import { $isTextNode } from "lexical";
import "./FindReplacePlugin.css";

type Result = {
  nodeKey: string;
  text: string;
  index: number;
  offsetSize: number;
};

type FindReplaceContextType = {
  searchText: string;
  setSearchText: (text: string) => void;
  replaceText: string;
  setReplaceText: (text: string) => void;
  results: Result[];
  currentResultIndex: number;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  handlePrev: () => void;
  handleNext: () => void;
  handleReplace: () => void;
  handleReplaceAll: () => void;
  handleClose: () => void;
  isSearching: boolean;
};

const FindReplaceContext = createContext<FindReplaceContextType | null>(null);

export function useFindReplace() {
  const context = useContext(FindReplaceContext);
  if (!context) {
    throw new Error("useFindReplace must be used within a FindReplaceProvider");
  }
  return context;
}

// Simple debounce utility function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// This is the headless component that provides functionality without UI
export function FindReplacePlugin({
  onClose,
  children,
  debounceDelay = 1000,
}: {
  onClose?: () => void;
  children?: React.ReactNode;
  debounceDelay?: number;
}) {
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [editor] = useLexicalComposerContext();

  // Debounce the search text to prevent rapid searches while typing
  const debouncedSearchText = useDebounce(searchText, debounceDelay);

  // Register keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Ctrl+F or Cmd+F if the editor is focused or the find/replace plugin is already visible
      if ((e.key === "f" || e.key === "F") && (e.metaKey || e.ctrlKey)) {
        // Always prevent default browser search
        e.preventDefault();
        e.stopPropagation();

        // Check if we should handle this shortcut (if editor is focused or find/replace is visible)
        const editorElement = document.querySelector("[contenteditable=true]");
        const isEditorFocused =
          editorElement === document.activeElement ||
          editorElement?.contains(document.activeElement as Node);

        if (isEditorFocused || isVisible) {
          setIsVisible(true);
        }
      } else if (e.key === "Escape" && isVisible) {
        e.preventDefault();
        handleClose();
      }
    };

    // Use capturing phase to catch the event before other handlers
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isVisible]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const findAllMatches = useCallback(
    (searchText: string) => {
      if (!searchText) {
        setResults([]);
        setCurrentResultIndex(-1);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const newResults: Result[] = [];
      const searchTextLower = searchText.toLowerCase();

      editor.getEditorState().read(() => {
        const root = $getRoot();
        let textNodeIndex = 0;

        // Helper function to traverse nodes recursively
        const traverse = (node: any) => {
          if ($isTextNode(node)) {
            const text = node.getTextContent();
            const textLower = text.toLowerCase();
            let startIndex = 0;
            let index = textLower.indexOf(searchTextLower, startIndex);

            while (index !== -1) {
              newResults.push({
                nodeKey: node.getKey(),
                text: text.substring(index, index + searchText.length),
                index,
                offsetSize: searchText.length,
              });
              startIndex = index + searchText.length;
              index = textLower.indexOf(searchTextLower, startIndex);
            }
            textNodeIndex++;
          }

          // Check if getChildren exists and returns an iterable
          if (node && typeof node.getChildren === "function") {
            try {
              const children = node.getChildren();
              if (children && Symbol.iterator in Object(children)) {
                for (const child of children) {
                  traverse(child);
                }
              }
            } catch (error) {
              // Skip if getChildren fails or doesn't return an iterable
            }
          }
        };

        traverse(root);
      });

      setResults(newResults);
      setIsSearching(false);

      if (newResults.length > 0) {
        setCurrentResultIndex(0);
        highlightResult(newResults[0], editor);
      }
    },
    [editor],
  );

  // Use the debounced search text to trigger the search
  useEffect(() => {
    findAllMatches(debouncedSearchText);
  }, [debouncedSearchText, findAllMatches]);

  const highlightResult = useCallback((result: Result, editor: LexicalEditor) => {
    editor.update(() => {
      const root = $getRoot();
      const textNodes: TextNode[] = [];

      // Helper function to traverse nodes recursively
      const traverse = (node: any) => {
        if ($isTextNode(node)) {
          textNodes.push(node);
        }

        // Check if getChildren exists and returns an iterable
        if (node && typeof node.getChildren === "function") {
          try {
            const children = node.getChildren();
            if (children && Symbol.iterator in Object(children)) {
              for (const child of children) {
                traverse(child);
              }
            }
          } catch (error) {
            // Skip if getChildren fails or doesn't return an iterable
          }
        }
      };

      traverse(root);

      for (const node of textNodes) {
        if (node.getKey() === result.nodeKey) {
          const selection = $createRangeSelection();
          selection.anchor.set(node.getKey(), result.index, "text");
          selection.focus.set(node.getKey(), result.index + result.offsetSize, "text");
          $setSelection(selection);
          break;
        }
      }
    });
  }, []);

  const handlePrev = useCallback(() => {
    if (results.length === 0) return;

    const newIndex = currentResultIndex > 0 ? currentResultIndex - 1 : results.length - 1;

    setCurrentResultIndex(newIndex);
    highlightResult(results[newIndex], editor);
  }, [currentResultIndex, editor, highlightResult, results]);

  const handleNext = useCallback(() => {
    if (results.length === 0) return;

    const newIndex = currentResultIndex < results.length - 1 ? currentResultIndex + 1 : 0;

    setCurrentResultIndex(newIndex);
    highlightResult(results[newIndex], editor);
  }, [currentResultIndex, editor, highlightResult, results]);

  const handleReplace = useCallback(() => {
    if (results.length === 0 || currentResultIndex === -1) return;

    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        selection.insertText(replaceText);
        // Update results after replacing
        const updatedResults = [...results];
        updatedResults.splice(currentResultIndex, 1);
        setResults(updatedResults);

        // Adjust current result index
        if (updatedResults.length === 0) {
          setCurrentResultIndex(-1);
        } else if (currentResultIndex >= updatedResults.length) {
          setCurrentResultIndex(updatedResults.length - 1);
          highlightResult(updatedResults[updatedResults.length - 1], editor);
        } else {
          highlightResult(updatedResults[currentResultIndex], editor);
        }
      }
    });
  }, [currentResultIndex, editor, highlightResult, replaceText, results]);

  const handleReplaceAll = useCallback(() => {
    if (results.length === 0) return;

    // Store the replace text in a local variable to ensure we use the current value
    const currentReplaceText = replaceText;

    editor.update(() => {
      // Process results in groups by node to minimize DOM operations
      const nodeResultsMap = new Map<string, Result[]>();

      // Group results by node key
      results.forEach((result) => {
        if (!nodeResultsMap.has(result.nodeKey)) {
          nodeResultsMap.set(result.nodeKey, []);
        }
        nodeResultsMap.get(result.nodeKey)!.push(result);
      });

      // Process each text node with its matches
      for (const [nodeKey, nodeResults] of nodeResultsMap.entries()) {
        // Sort results by index in descending order to replace from end to start
        // This prevents index shifting problems
        nodeResults.sort((a, b) => b.index - a.index);

        // Find the text node
        const root = $getRoot();
        let textNode = null;

        // Helper function to find node by key
        const findNodeByKey = (node: any, key: string): any => {
          if (node.getKey && node.getKey() === key) {
            return node;
          }

          if (node && typeof node.getChildren === "function") {
            try {
              const children = node.getChildren();
              if (children && Symbol.iterator in Object(children)) {
                for (const child of children) {
                  const found = findNodeByKey(child, key);
                  if (found) {
                    return found;
                  }
                }
              }
            } catch (error) {
              // Skip if getChildren fails or doesn't return an iterable
            }
          }

          return null;
        };

        textNode = findNodeByKey(root, nodeKey);

        if (textNode && $isTextNode(textNode)) {
          let text = textNode.getTextContent();

          // Replace all occurrences in this text node
          for (const result of nodeResults) {
            const before = text.substring(0, result.index);
            const after = text.substring(result.index + result.offsetSize);
            text = before + currentReplaceText + after;

            // Update indices for remaining replacements in this node
            const shift = currentReplaceText.length - result.offsetSize;
            for (const r of nodeResults) {
              if (r.index < result.index) {
                r.index += shift;
              }
            }
          }

          // Update the text node content
          textNode.setTextContent(text);
        }
      }

      // Clear results after replacing all
      setResults([]);
      setCurrentResultIndex(-1);
    });
  }, [editor, replaceText, results]);

  const contextValue = {
    searchText,
    setSearchText,
    replaceText,
    setReplaceText,
    results,
    currentResultIndex,
    isVisible,
    setIsVisible,
    handlePrev,
    handleNext,
    handleReplace,
    handleReplaceAll,
    handleClose,
    isSearching,
  };

  return <FindReplaceContext.Provider value={contextValue}>{children}</FindReplaceContext.Provider>;
}

// Legacy UI component for backward compatibility
export function FindReplaceUI() {
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
    <div className="find-replace-container">
      <div className="find-replace-header">
        <span className="find-replace-title">Find & Replace</span>
        <button className="find-replace-close" onClick={handleClose}>
          ×
        </button>
      </div>
      <div className="find-replace-controls">
        <div className="find-replace-row">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Find"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="find-replace-input"
          />
          <span className="find-replace-results">
            {isSearching
              ? "Searching..."
              : results.length > 0
                ? `${currentResultIndex + 1} of ${results.length}`
                : searchText
                  ? "No results"
                  : ""}
          </span>
          <button
            className="find-replace-nav-button"
            onClick={handlePrev}
            disabled={results.length === 0}
          >
            ↑
          </button>
          <button
            className="find-replace-nav-button"
            onClick={handleNext}
            disabled={results.length === 0}
          >
            ↓
          </button>
        </div>
        <div className="find-replace-row">
          <input
            type="text"
            placeholder="Replace"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            className="find-replace-input"
          />
          <button
            className="find-replace-button"
            onClick={handleReplace}
            disabled={results.length === 0 || currentResultIndex === -1}
          >
            Replace
          </button>
          <button
            className="find-replace-button"
            onClick={handleReplaceAll}
            disabled={results.length === 0}
          >
            Replace All
          </button>
        </div>
      </div>
    </div>
  );
}

// For backward compatibility
export function LegacyFindReplacePlugin({
  onClose,
  alwaysVisible = false,
  debounceDelay = 300,
}: {
  onClose?: () => void;
  alwaysVisible?: boolean;
  debounceDelay?: number;
}) {
  const [isVisible, setIsVisible] = useState(alwaysVisible);

  useEffect(() => {
    setIsVisible(alwaysVisible);
  }, [alwaysVisible]);

  return (
    <FindReplacePlugin onClose={onClose} debounceDelay={debounceDelay}>
      {isVisible && <FindReplaceUI />}
    </FindReplacePlugin>
  );
}
