/**
 * Copy→paste fidelity for every opaque construct the editor carries as an `UnknownNode` — figure,
 * sidebar, periph, ref — across the three clipboard payload shapes a real Ctrl+C/Ctrl+V produces,
 * plus the table kinds, which are their own dedicated `ImmutableTable*` nodes rather than
 * `UnknownNode`.
 *
 * The shape under test is the one `optbreakClipboardFidelity.test.tsx` established: a payload
 * carrying `application/x-lexical-editor` takes Lexical's own same-namespace fast path, which
 * rebuilds nodes from the JSON generator's output rather than re-tokenizing the plain text. That
 * generator computes exclusion from `UnknownNode.excludeFromCopy`, and an excluded node is not
 * dropped — its children are HOISTED into the parent in its place. For a construct whose children
 * are the content-free display decorators `unknownDisplayParts` builds (`\fig `, `|src="…"`,
 * `\fig*`), that hoisting produced a convincing lie: the pasted document RENDERED the construct's
 * full literal USFM bytes as loose siblings while its exported USJ silently dropped the node and
 * every one of its attributes. A save at that point persisted the loss with no error and a screen
 * that still showed the bytes.
 *
 * These pins mount the full `Editor` rather than `MarkerEditPlugin` alone: the plugins around the
 * engine take part in what a paste actually produces (see `figurePasteFidelity.test.tsx`), so a
 * narrower harness can report a paste clean that a user's does not.
 *
 * Where a kind cannot round-trip, the LOSS is asserted rather than the fidelity, so the sweep never
 * hides one — each such pin says in its own name what is lost and why.
 */

import { copyEvent, pasteEvent } from "./markerEdit.test-helpers";
import { mountStandardViewEditor } from "../settledGetUsj.test-helpers";
import { corpusFixtures } from "../adaptors/corpus/corpus-data";
import { MarkerObject, Usj, usxStringToUsj } from "@eten-tech-foundation/scripture-utilities";
import { act } from "@testing-library/react";
import {
  $createPoint,
  $createRangeSelection,
  $getRoot,
  $setSelection,
  COPY_COMMAND,
  PASTE_COMMAND,
  RootNode,
} from "lexical";
import {
  $isChapterNode,
  $isImmutableChapterNode,
  $isParaNode,
  $isUnknownNode,
  ParaNode,
  UnknownNode,
} from "shared";

// jsdom implements neither `ClipboardEvent` nor `DragEvent`; Lexical's own rich-paste fallback —
// the path a lexical-flavor payload takes once the Standard-view handler declines — duck-types
// against both (`objectKlassEquals`). Same stub as the sibling clipboard suites.
const globalStubs: { DragEvent?: unknown; ClipboardEvent?: unknown } = globalThis;
if (typeof globalStubs.DragEvent === "undefined")
  globalStubs.DragEvent = class DragEvent extends Event {};
if (typeof globalStubs.ClipboardEvent === "undefined")
  globalStubs.ClipboardEvent = class ClipboardEvent extends Event {};

const PLAIN = "text/plain";
const HTML = "text/html";
const LEXICAL = "application/x-lexical-editor";

interface Payload {
  [mimeType: string]: string;
}

function corpusUsj(name: string): Usj {
  const fixture = corpusFixtures.find((entry) => entry.name === name);
  if (!fixture) throw new Error(`no corpus fixture named ${name}`);
  return usxStringToUsj(fixture.usx);
}

/** The index of the first top-level node after the document's header — everything past the LAST
 * chapter marker, or past the book node for header-only front matter (`periph`) that has no
 * chapter at all. This is what Standard view actually copies out of: a user selects inside an open
 * chapter, never the header itself. */
function $contentStartIndex(root: RootNode): number {
  const children = root.getChildren();
  let headerEnd = 0;
  children.forEach((child, index) => {
    if ($isChapterNode(child) || $isImmutableChapterNode(child)) headerEnd = index + 1;
  });
  // No chapter: the book node alone is the header.
  return headerEnd === 0 ? 1 : headerEnd;
}

/** The fixture's header, byte-identical, plus one EMPTY `\p` paragraph as the paste host — the
 * same shape `clipboardCorpusRoundTrip.test.tsx` seeds its target editor with, so the paste only
 * has to reproduce the content (it can neither carry nor rebuild `\c`/`\id`; paste normalization
 * strips them). */
function headerSkeletonUsj(usj: Usj): Usj {
  let headerEnd = 0;
  usj.content.forEach((item, index) => {
    if (typeof item !== "string" && (item.type === "chapter" || item.type === "book"))
      headerEnd = index + 1;
  });
  const emptyHost: MarkerObject = { type: "para", marker: "p", content: [] } as MarkerObject;
  return { ...usj, content: [...usj.content.slice(0, headerEnd), emptyHost] };
}

async function settle(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

/** Copies the fixture's content (header excluded) out of a real Standard-view editor and hands
 * back all three carriers the copy wrote, so each paste shape below replays the editor's OWN bytes
 * rather than a hand-written approximation of them. */
async function copyContentPayload(usj: Usj): Promise<Payload> {
  const { lexical } = await mountStandardViewEditor(usj);
  await act(async () =>
    lexical.update(() => {
      const root = $getRoot();
      root.select($contentStartIndex(root), root.getChildrenSize());
    }),
  );
  const { event, getData } = copyEvent();
  await act(async () => lexical.dispatchCommand(COPY_COMMAND, event));
  return { [PLAIN]: getData(PLAIN), [HTML]: getData(HTML), [LEXICAL]: getData(LEXICAL) };
}

/** Pastes `payload` into a fresh header-only editor and returns the USJ a host would save. */
async function pasteIntoFreshHost(usj: Usj, payload: Payload): Promise<Usj | undefined> {
  const { ref, lexical } = await mountStandardViewEditor(headerSkeletonUsj(usj));
  await act(async () =>
    lexical.update(() => {
      $getRoot().getLastChild()?.selectEnd();
      lexical.dispatchCommand(PASTE_COMMAND, pasteEvent(payload).event);
    }),
  );
  await settle();
  // A pasted literal that pends (a marker completed under the caret) settles only once the caret
  // DEPARTS the paragraph it landed in; the lexical-flavor path inserts an already-structural tree
  // and has nothing pending, so this step is a harmless no-op there.
  await act(async () =>
    lexical.update(() => {
      $getRoot().getLastChild()?.selectEnd();
    }),
  );
  await settle();
  return ref.current?.getUsj();
}

/** The three real-world clipboard shapes: a plain-text source, the async Ctrl+V read (which drops
 * the private flavor), and the synchronous/native copy that keeps it. */
async function pastedUsjFor(usj: Usj, shape: "plain" | "plain+html" | "full"): Promise<Usj> {
  const payload = await copyContentPayload(usj);
  const shaped: Payload =
    shape === "plain"
      ? { [PLAIN]: payload[PLAIN] }
      : shape === "plain+html"
        ? { [PLAIN]: payload[PLAIN], [HTML]: payload[HTML] }
        : payload;
  if (shape === "full" && !payload[LEXICAL])
    throw new Error("copy wrote no application/x-lexical-editor payload");
  const pasted = await pasteIntoFreshHost(usj, shaped);
  if (!pasted) throw new Error("editor produced no USJ");
  return pasted;
}

/** Every object of `type` anywhere in `usj`, at any depth. */
function objectsOfType(usj: Usj, type: string): MarkerObject[] {
  const found: MarkerObject[] = [];
  const walk = (items: MarkerObject["content"]) =>
    items?.forEach((item) => {
      if (typeof item === "string") return;
      if (item.type === type) found.push(item);
      walk(item.content);
    });
  walk(usj.content);
  return found;
}

/** The document's first paragraph PAST the header — the one a user would be selecting in. */
function $firstContentPara(): ParaNode {
  const root = $getRoot();
  const para = root.getChildren().slice($contentStartIndex(root)).find($isParaNode);
  if (!para) throw new Error("no content paragraph past the header");
  return para;
}

/** The first `UnknownNode` of `tag` in that paragraph. */
function $constructOfTag(tag: string): UnknownNode {
  const construct = $firstContentPara()
    .getChildren()
    .filter($isUnknownNode)
    .find((node) => node.getTag() === tag);
  if (!construct) throw new Error(`no ${tag} UnknownNode in the first content paragraph`);
  return construct;
}

/** Copies a selection running from the paragraph's content start to an ELEMENT-type point ON the
 * `tag` construct at `offset`, and hands back what both carriers wrote. `offset` 0 TOUCHES the
 * wrapper without covering any of its children; `offset` 1 covers the first one. */
async function copyToConstructBoundary(usj: Usj, tag: string, offset: number): Promise<Payload> {
  const { lexical } = await mountStandardViewEditor(usj);
  await act(async () =>
    lexical.update(() => {
      const para = $firstContentPara();
      const construct = $constructOfTag(tag);
      const selection = $createRangeSelection();
      selection.anchor = $createPoint(para.getKey(), 2, "element"); // past the para's own glyph
      selection.focus = $createPoint(construct.getKey(), offset, "element");
      $setSelection(selection);
    }),
  );
  const { event, getData } = copyEvent();
  await act(async () => lexical.dispatchCommand(COPY_COMMAND, event));
  return { [PLAIN]: getData(PLAIN), [HTML]: getData(HTML), [LEXICAL]: getData(LEXICAL) };
}

const SHAPES = ["plain", "plain+html", "full"] as const;

describe("figure (UnknownNode) copy→paste across all three payload shapes", () => {
  const usj = corpusUsj("figure (USFM 3 attributes)");
  SHAPES.forEach((shape) => {
    it(`${shape} payload round-trips the figure, its caption, and every attribute`, async () => {
      expect(await pastedUsjFor(usj, shape)).toEqual(usj);
    });
  });
});

describe("sidebar (UnknownNode) copy→paste across all three payload shapes", () => {
  const usj = corpusUsj("sidebar (esb)");
  SHAPES.forEach((shape) => {
    it(`${shape} payload round-trips the sidebar whole — its category attribute and nested paragraph included`, async () => {
      expect(await pastedUsjFor(usj, shape)).toEqual(usj);
    });
  });
});

describe("periph (UnknownNode) copy→paste across all three payload shapes", () => {
  const usj = corpusUsj("periph");
  SHAPES.forEach((shape) => {
    // Compared construct-to-construct rather than document-to-document: `periph` is book-level
    // front matter with no chapter, so this sweep's "header plus one empty `\\p` host" target
    // leaves the pasted block nested inside that host paragraph. Where the block LANDS is generic
    // Lexical insertion, not construct fidelity; what these pins are about is that nothing inside
    // the construct was lost on the way.
    it(`${shape} payload round-trips the periph construct whole — its id/alt attributes and nested paragraph included`, async () => {
      const pasted = await pastedUsjFor(usj, shape);
      expect(objectsOfType(pasted, "periph")).toEqual(objectsOfType(usj, "periph"));
    });
  });

  it("loses the division's content if the copy is laid out line-per-marker instead of on one line", async () => {
    // Why the one-line copy rule (`$startsBlockLine`, `whitespaceDisplay.plugin.utils.ts`) has to
    // cover a peripheral division too, measured rather than argued. A `\periph` line and the
    // blocks it contains are separate USFM lines the way a writer emits them, and a paste replays
    // every line break as a paragraph split — after which Tier 2 re-tokenizes each paragraph on
    // its own and no single pass ever sees the division together with its content. The tokenizer
    // reads both spellings identically (`usfmFragmentToUsj.test.ts`); it is the paste's line
    // splitting, not the byte form, that decides whether the content can be reassembled.
    const payload = await copyContentPayload(usj);
    const lineBroken = payload[PLAIN].replace("\\mt1", "\n\\mt1");
    const pasted = await pasteIntoFreshHost(usj, { [PLAIN]: lineBroken });
    if (!pasted) throw new Error("editor produced no USJ");
    expect(objectsOfType(pasted, "periph")).toEqual([
      { type: "periph", alt: "Title Page", id: "title" },
    ]);
    expect(objectsOfType(pasted, "para").map((item) => item.marker)).toContain("mt1");
  });
});

describe("ref (UnknownNode) copy→paste across all three payload shapes", () => {
  const usj = corpusUsj("cross-reference ref target");
  it("full payload (lexical flavor) round-trips the ref wrapper and its loc attribute", async () => {
    expect(await pastedUsjFor(usj, "full")).toEqual(usj);
  });

  (["plain", "plain+html"] as const).forEach((shape) => {
    // Inherent to the construct, not to the clipboard: USJ invented the `<ref>` container and USFM
    // never carried it, so a plain-text carrier has no bytes anywhere that mark the wrapper's
    // extent. A raw USFM export of the same document has the identical gap.
    it(`${shape} payload loses the ref wrapper — USFM has no bytes for it, so only its child text survives`, async () => {
      const pasted = await pastedUsjFor(usj, shape);
      expect(objectsOfType(pasted, "ref")).toEqual([]);
      expect(JSON.stringify(pasted)).toContain("Genesis 1:1");
    });
  });
});

describe("a construct's own start boundary (the shared isSelected rule)", () => {
  // `UnknownNode.isSelected` asks whether any of the node's OWN CHILDREN are in the selection,
  // rather than taking Lexical's default key-membership answer for the WRAPPER — so the
  // lexical-JSON copy agrees with `text/plain`, whose walker reads the same `getNodes()` list. The
  // rule is written once for every kind and keys on nothing kind-specific, so it is pinned on more
  // than the optbreak that surfaced it (`optbreakClipboardFidelity.test.tsx`): these constructs
  // have real attributes and real content, which an optbreak does not.
  //
  // Every assertion below reads the construct's own CONTENT BYTES, never just its tag. A tag-only
  // assertion cannot see the shape that matters here — a copy that dropped the wrapper while
  // HOISTING its characters out has no tag in it and its content bytes are all still there.
  const FIGURE = { tag: "figure", fixture: "figure (USFM 3 attributes)" };
  const REF = { tag: "ref", fixture: "cross-reference ref target" };
  const FIGURE_BYTES = "At once they left their nets.";
  const REF_BYTES = "Genesis 1:1";

  it("a selection ending exactly at a DISPLAY-BYTE-LED construct's start excludes it from both carriers", async () => {
    // A figure's first child is the `\fig ` display decorator, so the element-type focus point
    // stays an element point and reaches none of the figure's children: neither carrier carries
    // the caption, and the lexical flavor has no figure node either.
    const payload = await copyToConstructBoundary(corpusUsj(FIGURE.fixture), FIGURE.tag, 0);
    expect(payload[PLAIN]).not.toContain(FIGURE_BYTES);
    expect(payload[PLAIN]).not.toContain("\\fig");
    expect(payload[LEXICAL]).not.toContain(FIGURE_BYTES);
    expect(payload[LEXICAL]).not.toContain('"figure"');
  });

  it("a selection ending exactly at a TEXT-LED construct's start carries it WHOLE in the lexical flavor — a superset of text/plain, deliberately, because the alternative loses the node", async () => {
    // A `ref` has no display bytes of its own (USJ invented the container), so its first child is a
    // real TextNode and Lexical normalizes the same focus point into a TEXT point at that child's
    // offset 0. The child is then in `getNodes()` contributing zero characters: `text/plain`
    // correctly emits none of it, while `isSelected` answers true and the lexical flavor keeps the
    // construct.
    //
    // That residual disagreement is the DELIBERATE half of the trade. Answering false instead makes
    // `$appendNodesToJSON` hoist the construct's children in place of the excluded wrapper, and a
    // token-mode child is never sliced, so the copy carries `Genesis 1:1` with the `ref` node and
    // its `loc` attribute silently gone — the same convincing-lie shape this suite's header
    // describes. Measured both ways; this pin fixes which one ships.
    const payload = await copyToConstructBoundary(corpusUsj(REF.fixture), REF.tag, 0);
    expect(payload[PLAIN]).not.toContain(REF_BYTES);
    expect(payload[LEXICAL]).toContain(REF_BYTES);
    // Whole, not hoisted: the wrapper and the attribute it carries travel with those bytes.
    expect(payload[LEXICAL]).toContain('"ref"');
    expect(payload[LEXICAL]).toContain('"loc":"GEN 1:1"');
  });

  [
    { ...FIGURE, bytes: FIGURE_BYTES },
    { ...REF, bytes: REF_BYTES },
  ].forEach(({ tag, fixture, bytes }) => {
    it(`extending that selection over the ${tag}'s first child puts its content in BOTH carriers`, async () => {
      const payload = await copyToConstructBoundary(corpusUsj(fixture), tag, 1);
      expect(payload[LEXICAL]).toContain(`"${tag}"`);
      expect(payload[LEXICAL]).toContain(bytes);
      expect(payload[PLAIN]).toContain(tag === "figure" ? "\\fig" : bytes);
    });
  });
});

describe("table (ImmutableTable* nodes, not UnknownNode) copy→paste across all three payload shapes", () => {
  const usj = corpusUsj("table with header and cells");
  SHAPES.forEach((shape) => {
    it(`${shape} payload round-trips the table whole — rows, cells, their markers and derived alignment`, async () => {
      expect(await pastedUsjFor(usj, shape)).toEqual(usj);
    });
  });
});
