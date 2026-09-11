// Polyfill browser globals missing from jsdom that @lexical/rich-text references at runtime.
// objectKlassEquals(event, DragEvent) and objectKlassEquals(event, ClipboardEvent) check
// objectClass.name, so these constructors must exist as named classes. Mirrors
// libs/shared-react/test-setup.ts.

if (typeof globalThis.DragEvent === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).DragEvent = class DragEvent extends Event {};
}

if (typeof globalThis.ClipboardEvent === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).ClipboardEvent = class ClipboardEvent extends Event {};
}

// jsdom implements `getBoundingClientRect` on Element but not on Range, and Lexical measures the
// selection through a Range whenever it scrolls a collapsed caret into view after a commit — so
// any test that focuses the editor root and then places a caret throws asynchronously, outside the
// test's own stack. Return the all-zero rect jsdom returns for an unlaid-out Element, which is
// what every other measurement in this environment already yields.
if (typeof Range !== "undefined" && !Range.prototype.getBoundingClientRect) {
  Range.prototype.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      toJSON: () => ({}),
    }) as DOMRect;
}
