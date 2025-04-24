import { useEffect } from "react";
import { useScripturalComposerContext } from "../context/ScripturalEditorContext";
import { ScriptureReference } from "shared-react/plugins/ScriptureReferencePlugin";

/**
 * Plugin that scrolls to the current reference in the editor.
 * Looks for elements with data-marker="c" or "v" and data-number matching the reference.
 */
export function ScrollToReferencePlugin({
  smoothScroll = true,
  scrollBehavior = "auto",
  scrollOffset = 100,
}: {
  /** Whether to use smooth scrolling */
  smoothScroll?: boolean;
  /** Scroll behavior - 'auto' or 'smooth' */
  scrollBehavior?: ScrollBehavior;
  /** Offset from the top of the viewport (in pixels) */
  scrollOffset?: number;
}) {
  const { scriptureReference, editorRef } = useScripturalComposerContext();

  useEffect(() => {
    if (!scriptureReference || !editorRef.current) return;

    // Give the DOM a moment to update before trying to scroll
    const timeoutId = setTimeout(() => {
      scrollToReference(
        scriptureReference,
        editorRef.current as HTMLElement,
        scrollBehavior,
        scrollOffset,
      );
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [scriptureReference, editorRef, smoothScroll, scrollBehavior, scrollOffset]);

  return null;
}

/**
 * Scrolls to the element matching the scripture reference
 */
function scrollToReference(
  reference: ScriptureReference,
  editorElement: HTMLElement,
  scrollBehavior: ScrollBehavior = "auto",
  scrollOffset: number = 100,
): void {
  // First try to find the verse within the current chapter context
  let targetElement = findVerseInChapterContext(
    editorElement,
    reference.chapter?.toString() || "1",
    reference.verse?.toString() || "1",
  );

  // If verse not found in chapter context, try to find just the chapter element
  if (!targetElement) {
    targetElement = findReferenceElement(editorElement, "c", reference.chapter?.toString());
  }

  // If found, scroll to the element
  if (targetElement) {
    const parentScroll = getScrollableParent(editorElement);
    if (parentScroll) {
      const targetRect = targetElement.getBoundingClientRect();
      const parentRect = parentScroll.getBoundingClientRect();

      // Calculate scroll position (target position relative to parent + parent's scroll - offset)
      const scrollTop = targetRect.top - parentRect.top + parentScroll.scrollTop - scrollOffset;

      // Scroll to the element
      parentScroll.scrollTo({
        top: scrollTop,
        behavior: scrollBehavior,
      });

      // Briefly highlight the element
      highlightElement(targetElement);
    }
  }
}

/**
 * Finds a verse element within the context of a specific chapter
 */
function findVerseInChapterContext(
  container: HTMLElement,
  chapter: string,
  verse: string,
): HTMLElement | null {
  if (!chapter || !verse) return null;

  // Method 1: Find verses that have chapter context in their attributes
  // Some implementations might include chapter data in verse elements
  const verseWithChapterContext = container.querySelector(
    `[data-marker="v"][data-number="${verse}"][data-chapter="${chapter}"]`,
  );

  if (verseWithChapterContext) {
    return verseWithChapterContext as HTMLElement;
  }

  // Method 2: Find the chapter element first, then look for verses within that chapter
  const chapterElement = findReferenceElement(container, "c", chapter);
  if (chapterElement) {
    // Find the next chapter (if any)
    const nextChapter = Array.from(container.querySelectorAll('[data-marker="c"]')).find((el) => {
      const chapterNum = el.getAttribute("data-number");
      return chapterNum && parseInt(chapterNum) > parseInt(chapter);
    });

    // Get all verse elements
    const allVerseElements = Array.from(container.querySelectorAll('[data-marker="v"]'));

    // Find verse elements that are after the current chapter and before the next chapter (if any)
    for (const verseEl of allVerseElements) {
      // Check if this verse has the right number
      if (verseEl.getAttribute("data-number") === verse) {
        // Check if this verse is positioned after the chapter element
        if (isElementAfter(verseEl, chapterElement)) {
          // If there's a next chapter, make sure this verse is before it
          if (!nextChapter || isElementBefore(verseEl, nextChapter)) {
            return verseEl as HTMLElement;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Checks if element A is positioned after element B in the document
 */
function isElementAfter(a: Element, b: Element): boolean {
  return !!(b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING);
}

/**
 * Checks if element A is positioned before element B in the document
 */
function isElementBefore(a: Element, b: Element): boolean {
  return !!(b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING);
}

/**
 * Finds an element with data-marker and data-number attributes matching the provided values
 */
function findReferenceElement(
  container: HTMLElement,
  marker: "c" | "v",
  number?: string,
): HTMLElement | null {
  if (!number) return null;

  // Look for elements with both data-marker and data-number attributes
  const selector = `[data-marker="${marker}"][data-number="${number}"]`;
  return container.querySelector(selector);
}

/**
 * Gets the first scrollable parent of an element
 */
function getScrollableParent(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;

  while (parent) {
    const hasScrollableContent =
      parent.scrollHeight > parent.clientHeight &&
      (getComputedStyle(parent).overflowY === "auto" ||
        getComputedStyle(parent).overflowY === "scroll");

    if (hasScrollableContent) {
      return parent;
    }
    parent = parent.parentElement;
  }

  // If no scrollable parent is found, use document.scrollingElement
  return (document.scrollingElement as HTMLElement) || document.documentElement;
}

/**
 * Briefly highlights an element to make it visible to the user
 */
function highlightElement(element: HTMLElement): void {
  // Save original background
  const originalBackground = element.style.backgroundColor;
  const originalTransition = element.style.transition;

  // Apply highlight
  element.style.transition = "background-color 1s ease";
  element.style.backgroundColor = "rgba(255, 255, 0, 0.3)";

  // Remove highlight after a delay
  setTimeout(() => {
    element.style.backgroundColor = originalBackground;
    element.style.transition = originalTransition;
  }, 1500);
}
