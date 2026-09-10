/**
 * A pasted `\fig …\fig*` must land as ONE figure: its caption inside the construct, not stranded
 * as paragraph prose after the closing glyph.
 *
 * Live symptom, with the full editor plugin stack mounted: pasting
 * `\fig At once they left their nets.|src="avnt016.jpg" size="span" ref="1.18"\fig*` produced a
 * figure box holding only `\fig |src="…"\fig*` — the caption ejected past the closer into the
 * surrounding prose — and an exported USJ whose `figure` object had no `content` at all, the
 * caption merged into the neighbouring text run instead.
 *
 * Mechanism: `$textNodeInUnknownTransform` (`TextSpacingPlugin`, shared-react) ejects a TextNode
 * out of an `UnknownNode` parent only when the WRAPPER predates the current update — the shape a
 * typed intrusion into an existing read-only opaque block actually has. A Tier-2 rebuild
 * materializes the WHOLE figure — wrapper and caption together — in the same update, so the
 * caption stays inside it rather than being ejected as though it were typed text.
 *
 * These pins mount the real `Editor` (via `mountStandardViewEditor`) rather than the marker-edit
 * plugin alone: the ejection lives in a sibling plugin, so a harness carrying only
 * `MarkerEditPlugin` reports a clean round trip for the same paste and cannot see this class at
 * all.
 */

import { pasteEvent } from "./markerEdit.test-helpers";
import { mountStandardViewEditor } from "../settledGetUsj.test-helpers";
import { MarkerObject, Usj } from "@eten-tech-foundation/scripture-utilities";
import { act } from "@testing-library/react";
import { $getRoot, $isTextNode, LexicalEditor, PASTE_COMMAND, TextNode } from "lexical";
import { $isParaNode, NBSP } from "shared";

// jsdom implements neither `ClipboardEvent` nor `DragEvent`; Lexical's own paste fallback
// duck-types against both (`objectKlassEquals`). Same stub as the sibling clipboard suites.
const globalStubs: { DragEvent?: unknown; ClipboardEvent?: unknown } = globalThis;
if (typeof globalStubs.DragEvent === "undefined")
  globalStubs.DragEvent = class DragEvent extends Event {};
if (typeof globalStubs.ClipboardEvent === "undefined")
  globalStubs.ClipboardEvent = class ClipboardEvent extends Event {};

/** One figure's full USFM: the caption, then its USFM 3 attribute run, then the closer. The
 * caption sitting BEFORE the attributes is what makes the construct's own content the thing a
 * rebuild has to keep inside the wrapper. */
const FIGURE_USFM = `\\fig At once they left their nets.|src="avnt016.jpg" size="span" ref="1.18"\\fig*`;

const CAPTION = "At once they left their nets.";

/** The figure object those bytes mean, straight from the USFM: caption as the figure's own
 * content, `src` stored under USX/USJ's `file`. */
const figureObject: MarkerObject = {
  type: "figure",
  marker: "fig",
  file: "avnt016.jpg",
  size: "span",
  ref: "1.18",
  content: [CAPTION],
} as unknown as MarkerObject;

/** A two-paragraph document whose first paragraph holds `content`; the second is somewhere for the
 * caret to depart to. */
function figureUsj(content: MarkerObject["content"]): Usj {
  return {
    type: "USJ",
    version: "3.1",
    content: [
      { type: "book", marker: "id", code: "GEN", content: ["GEN"] },
      { type: "chapter", marker: "c", number: "1" },
      { type: "para", marker: "p", content },
      { type: "para", marker: "p", content: ["depart here"] },
    ],
  } as unknown as Usj;
}

async function settle(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

/** The paragraph text the editor actually displays, with display NBSPs read back as the plain
 * spaces they stand in for — the byte ORDER is what these pins are about, not which whitespace
 * codepoint carries a separator. */
function displayText(editor: LexicalEditor): string {
  return editor
    .getEditorState()
    .read(() => $getRoot().getTextContent())
    .replaceAll(NBSP, " ");
}

/** Pastes `FIGURE_USFM` as a plain-text clipboard payload at `offset` within the first
 * paragraph's `"Before after"` run, then departs the caret and settles. */
async function pasteFigureAt(editor: LexicalEditor, offset: number): Promise<void> {
  await act(async () =>
    editor.update(() => {
      const para = $getRoot().getChildren().filter($isParaNode)[0];
      const run = para
        ?.getChildren()
        .find(
          (node): node is TextNode => $isTextNode(node) && node.getTextContent().includes("Before"),
        );
      if (!run) throw new Error("expected the paragraph's `Before after` text run");
      run.select(offset, offset);
      editor.dispatchCommand(PASTE_COMMAND, pasteEvent({ "text/plain": FIGURE_USFM }).event);
    }),
  );
  await settle();
  await act(async () =>
    editor.update(() => {
      const departure = $getRoot().getChildren().filter($isParaNode)[1]?.getLastChild();
      if (!departure || !$isTextNode(departure))
        throw new Error("expected the `depart here` paragraph's text node");
      departure.select(0, 0);
    }),
  );
  await settle();
}

const hostContent: MarkerObject["content"] = [
  { type: "verse", marker: "v", number: "18" } as unknown as MarkerObject,
  "Before after",
];

describe("pasting a figure into Standard view", () => {
  it("keeps the caption inside the figure — the exported USJ carries it as the figure's own content, mid-paragraph", async () => {
    const { ref, lexical } = await mountStandardViewEditor(figureUsj(hostContent));
    await pasteFigureAt(lexical, 7); // between "Before " and "after"
    expect(ref.current?.getUsj()).toEqual(
      figureUsj([hostContent[0], "Before ", figureObject, "after"]),
    );
  });

  it("keeps the caption inside the figure when the paste lands at the paragraph's end", async () => {
    const { ref, lexical } = await mountStandardViewEditor(figureUsj(hostContent));
    await pasteFigureAt(lexical, "Before after".length);
    expect(ref.current?.getUsj()).toEqual(
      figureUsj([hostContent[0], "Before after", figureObject]),
    );
  });

  it("displays the pasted figure's bytes in the same order a LOAD of the identical document does — caption between the opening glyph and the attribute run, not after the closer", async () => {
    // The oracle is a real load of the document the paste is supposed to produce, so this pin
    // states "paste looks like load" rather than re-encoding the expected byte string by hand.
    const { lexical: loaded } = await mountStandardViewEditor(
      figureUsj([hostContent[0], "Before ", figureObject, "after"]),
    );
    const { lexical: pasted } = await mountStandardViewEditor(figureUsj(hostContent));
    await pasteFigureAt(pasted, 7);
    expect(displayText(pasted)).toContain(`\\fig ${CAPTION}|src="avnt016.jpg"`);
    expect(displayText(pasted)).toBe(displayText(loaded));
  });
});
