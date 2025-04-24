import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
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
  const [editor] = useLexicalComposerContext();
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
  // First try to find the verse element
  let targetElement = findReferenceElement(editorElement, "v", reference.verse?.toString());

  // If verse not found, try to find the chapter element
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
