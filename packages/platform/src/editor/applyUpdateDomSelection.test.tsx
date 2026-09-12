/**
 * `EditorRef.applyUpdate` and DOM focus: Lexical reconciles the DOM selection after every commit,
 * and writing a selection inside a `contenteditable` gives that element DOM focus. An editor the
 * user is not typing in must therefore commit a programmatic update WITHOUT writing the DOM
 * selection, or it steals the caret from whatever does hold focus — a host's footnote editor
 * applying its edits back into the Scripture text, for instance.
 */
import Editorial from "../Editorial";
import { EditorOptions, EditorRef } from "./editor.model";
import { MarkerObject, Usj } from "@eten-tech-foundation/scripture-utilities";
import { act, render } from "@testing-library/react";
import { createRef } from "react";
import { $getRoot, LexicalEditor, SKIP_DOM_SELECTION_TAG } from "lexical";
import { $dfs } from "@lexical/utils";
// Reaching inside only for tests.
// eslint-disable-next-line @nx/enforce-module-boundaries
import { getEmbeddedLexicalEditor } from "../../../../libs/shared-react/src/plugins/usj/react-test.utils";
import { $isNoteNode, NoteNode } from "shared";
import { getViewOptions, STANDARD_VIEW_MODE } from "shared-react";

function requireDefined<T>(value: T | undefined | null, message: string): T {
  if (value === undefined || value === null) throw new Error(message);
  return value;
}

const options: EditorOptions = {
  hasSpellCheck: false,
  markerMenuTrigger: "\\",
  view: requireDefined(getViewOptions(STANDARD_VIEW_MODE), "standard view options"),
  hasExternalUI: true,
};

function note(text: string): MarkerObject {
  return {
    type: "note",
    marker: "f",
    caller: "+",
    content: [
      { type: "char", marker: "fr", content: ["1:1 "] },
      { type: "char", marker: "ft", content: [text] },
    ],
  };
}

const twoNotesUsj: Usj = {
  type: "USJ",
  version: "3.1",
  content: [
    { type: "book", marker: "id", code: "GEN", content: ["Test Book"] },
    { type: "chapter", marker: "c", number: "1" },
    {
      type: "para",
      marker: "p",
      content: [
        { type: "verse", marker: "v", number: "1" },
        "first ",
        note("alpha"),
        "second ",
        note("beta"),
        "end",
      ],
    },
  ],
};

const scrRef = { book: "GEN", chapterNum: 1, verseNum: 1 };

async function renderEditor() {
  const ref = createRef<EditorRef>();
  let container: HTMLElement | undefined;
  await act(async () => {
    const result = render(
      <Editorial
        ref={ref}
        defaultUsj={twoNotesUsj}
        scrRef={scrRef}
        onScrRefChange={() => undefined}
        options={options}
      />,
    );
    container = result.container;
  });
  return {
    editorRef: requireDefined(ref.current, "editor ref"),
    lexical: getEmbeddedLexicalEditor(container),
  };
}

function noteKeys(lexical: LexicalEditor): string[] {
  return lexical.getEditorState().read(() =>
    $dfs($getRoot())
      .map(({ node }) => node)
      .filter($isNoteNode)
      .map((n: NoteNode) => n.getKey()),
  );
}

/** Collects the update tags of every commit that happens while `run` executes. */
async function tagsOfUpdatesDuring(lexical: LexicalEditor, run: () => void): Promise<Set<string>> {
  const seen = new Set<string>();
  const unregister = lexical.registerUpdateListener(({ tags }) => {
    tags.forEach((tag) => seen.add(tag));
  });
  await act(async () => {
    run();
  });
  unregister();
  return seen;
}

describe("EditorRef.applyUpdate and DOM focus", () => {
  it("skips the DOM selection when the editor does not hold focus", async () => {
    const { editorRef, lexical } = await renderEditor();
    const [first] = noteKeys(lexical);
    const rootElement = requireDefined(lexical.getRootElement(), "root element");
    expect(rootElement.contains(rootElement.ownerDocument.activeElement)).toBe(false);

    const tags = await tagsOfUpdatesDuring(lexical, () => editorRef.replaceEmbedUpdate(first, []));

    expect(tags.has(SKIP_DOM_SELECTION_TAG)).toBe(true);
  });

  it("reconciles the DOM selection when the editor holds focus", async () => {
    const { editorRef, lexical } = await renderEditor();
    const [first] = noteKeys(lexical);
    const rootElement = requireDefined(lexical.getRootElement(), "root element");
    // jsdom only treats an element as focusable when it is explicitly in the tab order, so give
    // the root a tabindex to reproduce what a real contenteditable does on its own.
    rootElement.setAttribute("tabindex", "-1");
    rootElement.focus();
    expect(rootElement.contains(rootElement.ownerDocument.activeElement)).toBe(true);

    const tags = await tagsOfUpdatesDuring(lexical, () => editorRef.replaceEmbedUpdate(first, []));

    expect(tags.has(SKIP_DOM_SELECTION_TAG)).toBe(false);
  });
});
