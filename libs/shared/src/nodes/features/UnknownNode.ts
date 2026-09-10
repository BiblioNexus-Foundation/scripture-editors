import { UnknownAttributes } from "../usj/node-constants.js";
import { MarkerObject } from "@eten-tech-foundation/scripture-utilities";
import {
  $applyNodeReplacement,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  BaseSelection,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  ElementNode,
  LexicalNode,
  LexicalUpdateJSON,
  NodeKey,
  SerializedElementNode,
  SerializedLexicalNode,
  Spread,
} from "lexical";

export type SerializedUnknownNode = Spread<
  {
    tag: string;
    marker?: string;
    unknownAttributes?: UnknownAttributes;
  },
  SerializedElementNode
>;

/** List of known properties of `MarkerObject` */
export const UNKNOWN_MARKER_OBJECT_PROPS: (keyof MarkerObject)[] = ["type", "marker", "content"];

export const UNKNOWN_TAG_NAME = "unknown";
export const UNKNOWN_VERSION = 1;

/**
 * `UnknownNode` tags that render inline instead of as a subdued block container: a line-level box
 * in the middle of a sentence would be visibly wrong. These are the two corpus-proven
 * mid-paragraph constructs — both nest INSIDE a `<para>`'s running text in the corpus fixtures
 * ("optional line break (optbreak)" and "cross-reference ref target"), and
 * `packages/utilities/src/converters/usj/converter-test.data.ts:2571,2581` shows both becoming
 * `UnknownNode`s (tags "optbreak" and "ref"):
 *
 * - `\optbreak` — PT9 renders it as a literal `//` token mid-sentence; `createUnknown`
 *   (usj-editor.adaptor.ts) renders that token as the node's own display child in editable
 *   mode, via `unknownDisplayParts` (unknownUsfm.utils.ts).
 * - `\ref` — a cross-reference target with real child text that must display inline; it carries
 *   no USFM bytes of its own, so it gets no display children at all.
 *
 * Everything else (table/figure/sidebar/periph/...) stays block-level.
 */
const INLINE_UNKNOWN_TAGS = new Set(["optbreak", "ref"]);

export class UnknownNode extends ElementNode {
  __tag: string;
  __marker?: string;
  __unknownAttributes?: UnknownAttributes;

  constructor(tag = "", marker?: string, unknownAttributes?: UnknownAttributes, key?: NodeKey) {
    super(key);
    this.__tag = tag;
    this.__marker = marker;
    this.__unknownAttributes = unknownAttributes;
  }

  static override getType(): string {
    return "unknown";
  }

  static override clone(node: UnknownNode): UnknownNode {
    const { __tag, __marker, __unknownAttributes, __key } = node;
    return new UnknownNode(__tag, __marker, __unknownAttributes, __key);
  }

  static override importDOM(): DOMConversionMap | null {
    return {
      [UNKNOWN_TAG_NAME]: (node: HTMLElement) => {
        if (!isUnknownElement(node)) return null;

        return {
          conversion: $convertUnknownElement,
          priority: 1,
        };
      },
    };
  }

  static override importJSON(serializedNode: SerializedUnknownNode): UnknownNode {
    return $createUnknownNode().updateFromJSON(serializedNode);
  }

  override updateFromJSON(serializedNode: LexicalUpdateJSON<SerializedUnknownNode>): this {
    return super
      .updateFromJSON(serializedNode)
      .setTag(serializedNode.tag)
      .setMarker(serializedNode.marker)
      .setUnknownAttributes(serializedNode.unknownAttributes);
  }

  setTag(tag: string): this {
    if (this.__tag === tag) return this;

    const self = this.getWritable();
    self.__tag = tag;
    return self;
  }

  getTag(): string {
    const self = this.getLatest();
    return self.__tag;
  }

  /**
   * Whether this unknown renders inline (optbreak, ref) rather than as a block box (figure,
   * sidebar, periph, ...). Inline unknowns sit within paragraph prose and carry SIGNIFICANT
   * surrounding whitespace — the spaces Paratext 9 preserves byte-for-byte around `//` — so
   * callers must not add or strip spaces next to them.
   */
  isInlineTag(): boolean {
    return INLINE_UNKNOWN_TAGS.has(this.getTag());
  }

  setMarker(marker: string | undefined): this {
    if (this.__marker === marker) return this;

    const self = this.getWritable();
    self.__marker = marker;
    return self;
  }

  getMarker(): string | undefined {
    const self = this.getLatest();
    return self.__marker;
  }

  setUnknownAttributes(unknownAttributes: UnknownAttributes | undefined): this {
    const self = this.getWritable();
    self.__unknownAttributes = unknownAttributes;
    return self;
  }

  getUnknownAttributes(): UnknownAttributes | undefined {
    const self = this.getLatest();
    return self.__unknownAttributes;
  }

  override createDOM(): HTMLElement {
    const dom = document.createElement(UNKNOWN_TAG_NAME);
    // data-tag records the UnknownNode's USJ type so importDOM's $convertUnknownElement can read it
    // back on a DOM round-trip. The inline-vs-block CSS treatment is driven by the class chosen from
    // INLINE_UNKNOWN_TAGS below, not by data-tag; optbreak's `//` token renders as a real child text
    // node (see createUnknown in usj-editor.adaptor.ts), not a CSS-generated label.
    dom.setAttribute("data-tag", this.getTag());
    dom.setAttribute("data-marker", this.getMarker() ?? "");
    dom.classList.add(this.isInlineTag() ? "unknown-inline" : "unknown-block");
    // Read-only whole-block: no inline display:none here (that hid the content in every view).
    // Visibility is CSS-mode-gated in usj-nodes.css (hidden by default, revealed as a subdued
    // block/token in standard view's .marker-editable scope). contentEditable=false stops the
    // browser from placing a native caret inside it, so caret navigation skips over the whole
    // node like any decorator node.
    dom.contentEditable = "false";
    return dom;
  }

  override updateDOM(prevNode: this, dom: HTMLElement): boolean {
    // On a key-reused node whose tag/marker changed, sync the attributes and the inline-vs-block
    // class in place so createDOM's discriminators (data-tag/data-marker, unknown-inline vs
    // unknown-block) don't go stale. tag drives both data-tag and the class; marker drives
    // data-marker (empty string when absent, mirroring createDOM).
    if (prevNode.__tag !== this.__tag) {
      dom.setAttribute("data-tag", this.__tag);
      const inline = this.isInlineTag();
      dom.classList.toggle("unknown-inline", inline);
      dom.classList.toggle("unknown-block", !inline);
    }
    if ((prevNode.__marker ?? "") !== (this.__marker ?? ""))
      dom.setAttribute("data-marker", this.__marker ?? "");
    // Returning false keeps the existing DOM element (updated in place, never recreated — this
    // preserves contentEditable=false and the caret-skip behavior).
    return false;
  }

  override exportDOM(): DOMExportOutput {
    return { element: null };
  }

  override exportJSON(): SerializedUnknownNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      tag: this.getTag(),
      marker: this.getMarker(),
      unknownAttributes: this.getUnknownAttributes(),
      version: UNKNOWN_VERSION,
    };
  }

  // Mutation

  override canBeEmpty(): true {
    return true;
  }

  override isInline(): true {
    return true;
  }

  override extractWithChild(): false {
    return false;
  }

  // A CHILD-BEARING `UnknownNode` of any kind stays IN the copy. This affects ONLY the
  // `application/x-lexical-editor` (lexical-JSON) flavor: `$appendNodesToHTML` (`@lexical/html`)
  // computes this same `excludeFromCopy('html')` value, but `exportDOM()` above always returns
  // `{element: null}` and `$appendNodesToHTML` returns early on a null `element` BEFORE ever
  // consulting the exclusion value it just computed, so `text/html` output is byte-identical for
  // every kind whatever this predicate answers (confirmed by reading `LexicalHtml.dev.js`).
  // `'clone'` is never passed by any Lexical-shipped code path in the installed version (confirmed
  // by reading `LexicalClipboard.dev.js`), so an unconditional `destination !== "clone"` would
  // exclude every `UnknownNode` from the lexical-JSON flavor outright.
  //
  // Excluding a node does not drop it silently: `$appendNodesToJSON` HOISTS the excluded node's own
  // children into its parent's list in its place. Every kind's marker and attribute bytes are
  // content-free `ImmutableTypedTextNode` display decorators (`unknownDisplayParts` builds them
  // identically for all of them), so hoisting strands decorators that still `decorate()` their own
  // literal text as loose siblings with no owning wrapper: the pasted document RENDERS the
  // construct's full USFM bytes while its USJ has lost the node and every attribute on it — a
  // convincing display over missing data, which a save then persists with no error.
  //
  // The `getChildrenSize() > 0` guard excludes a node with no children of its OWN — of any kind,
  // and for whatever reason it has none — because that is exactly when `text/plain` also emits
  // nothing for it, and the two carriers must agree. Three shapes reach it, and only the first is
  // a husk: an optbreak whose `//` display child was deleted (`markerEditTier1.utils.ts`'s
  // husk-removal check recognizes it by that same zero-child shape); a content-less construct in
  // an editable-marker view, where the marker/attribute display bytes `createUnknown`
  // (`usj-editor.adaptor.ts`) prepends are themselves children, so only a kind with no display
  // bytes at all can be childless; and, in a HIDDEN-marker view, ANY content-less construct — a
  // caption-less `figure`, an empty `ref`, every optbreak — because `createUnknown` builds no
  // display children there at all. The last is prose-copy semantics rather than a husk: a
  // hidden-marker view copies what it shows, and it shows no bytes for a construct with no
  // content.
  //
  // The guard does NOT, on its own, cover a DIFFERENT carrier-agreement gap: a selection whose
  // ending boundary resolves to an ELEMENT-type point ON this node at offset 0 (touching the
  // wrapper without covering any of its content) still marks a CHILD-BEARING node "selected" under
  // Lexical's default `isSelected` (key-membership in `selection.getNodes()`, unaffected by this
  // node's own child count), so `$appendNodesToJSON` would serialize a CHILDLESS placeholder for a
  // node that has children, disagreeing with `text/plain` (`$selectionToUsfmText`, which walks that
  // same `getNodes()` list and correctly emits nothing for this boundary). The `isSelected`
  // override below closes that second gap at its actual source, since `excludeFromCopy` has no
  // visibility into which of a node's children a given selection will include.
  override excludeFromCopy(destination: "clone" | "html"): boolean {
    return this.getChildrenSize() > 0 ? false : destination !== "clone";
  }

  // An `UnknownNode` is only meaningfully "selected" (and so only copy-included, per the
  // `excludeFromCopy` guard above) when the selection actually covers CONTENT of one of its own
  // children — mirrors `$selectionToUsfmText`'s copy walker so both clipboard carriers agree at
  // the same selection boundary, the same way Lexical's own base `isSelected`
  // (`LexicalNode.prototype.isSelected`) already special-cases an inline DECORATOR node sitting as
  // a parent's last child at an exactly-there boundary point, for the identical reason. Without
  // this, a selection ending exactly at this node's own start counts the WRAPPER as selected via
  // the default `ElementNode.isSelected` (key-membership in `selection.getNodes()`) while none of
  // its content is covered — producing an entry in the `application/x-lexical-editor` copy with
  // nothing corresponding to it in `text/plain`.
  //
  // Membership alone is not the whole test, because a boundary reaches the children two different
  // ways depending on what the first child IS. A construct whose display bytes lead (a `figure`'s
  // `\fig ` glyph) starts with a DECORATOR, so an element-type boundary point on the wrapper stays
  // one and no child is in `getNodes()` at all. A construct with no display bytes (a `ref`, whose
  // container USFM never carried) starts with a real `TextNode`, and Lexical normalizes that same
  // boundary point into a TEXT point at that child's offset 0 — so the child IS in `getNodes()`
  // while contributing zero characters, exactly as the copy walker computes it. Hence the
  // zero-width check: a boundary point that touches a child at its very start or very end covers
  // none of it.
  override isSelected(selection?: BaseSelection | null): boolean {
    const targetSelection = selection ?? $getSelection();
    if (!targetSelection) return false;
    const selectedNodes = targetSelection.getNodes();
    return this.getChildren().some(
      (child) =>
        selectedNodes.some((node) => node.is(child)) &&
        $selectionCoversContent(child, targetSelection),
    );
  }
}

/**
 * Whether `selection` covers at least one character of `child`, as opposed to merely touching it at
 * a boundary. Only a range selection's own endpoint can be zero-width against a text node — a child
 * reached any other way is genuinely inside the range — so every other shape answers `true`.
 */
function $selectionCoversContent(child: LexicalNode, selection: BaseSelection): boolean {
  if (!$isRangeSelection(selection) || !$isTextNode(child)) return true;
  const { anchor, focus } = selection;
  const [start, end] = anchor.isBefore(focus) ? [anchor, focus] : [focus, anchor];
  if (end.type === "text" && end.key === child.getKey() && end.offset === 0) return false;
  return !(
    start.type === "text" &&
    start.key === child.getKey() &&
    start.offset === child.getTextContentSize()
  );
}

function $convertUnknownElement(element: HTMLElement): DOMConversionOutput {
  const tag = element.getAttribute("data-tag") ?? "";
  const marker = element.getAttribute("data-marker") ?? "";
  const node = $createUnknownNode(tag, marker);
  return { node };
}

export function $createUnknownNode(
  tag?: string,
  marker?: string,
  unknownAttributes?: UnknownAttributes,
): UnknownNode {
  return $applyNodeReplacement(new UnknownNode(tag, marker, unknownAttributes));
}

function isUnknownElement(node: HTMLElement | null | undefined): boolean {
  // `tagName` is upper-cased for HTML-namespace elements, so compare case-insensitively.
  return node?.tagName.toLowerCase() === UNKNOWN_TAG_NAME;
}

export function $isUnknownNode(node: LexicalNode | null | undefined): node is UnknownNode {
  return node instanceof UnknownNode;
}

export function isSerializedUnknownNode(
  node: SerializedLexicalNode | null | undefined,
): node is SerializedUnknownNode {
  return node?.type === UnknownNode.getType();
}
