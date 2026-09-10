/**
 * `EditorRef.getNoteIndex` and `EditorRef.highlightNote`: the two host-facing note affordances a
 * footnotes pane needs — the document-order index a USJ-built notes list addresses notes by, and
 * PT9's selected-caller highlight (`caller_highlight`) on one note's caller at a time.
 */
import Editorial from "../Editorial";
import { EditorOptions, EditorRef } from "./editor.model";
import { MarkerObject, Usj } from "@eten-tech-foundation/scripture-utilities";
import { act, render } from "@testing-library/react";
import { createRef } from "react";
import { $getRoot, LexicalEditor } from "lexical";
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

const threeNotesUsj: Usj = {
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
        "third ",
        note("gamma"),
        "end",
      ],
    },
  ],
};

const scrRef = { book: "GEN", chapterNum: 1, verseNum: 1 };

async function renderEditor(defaultUsj: Usj) {
  const ref = createRef<EditorRef>();
  let container: HTMLElement | undefined;
  await act(async () => {
    const result = render(
      <Editorial
        ref={ref}
        defaultUsj={defaultUsj}
        scrRef={scrRef}
        onScrRefChange={() => undefined}
        options={options}
      />,
    );
    container = result.container;
  });
  const editorRef = requireDefined(ref.current, "editor ref");
  const lexical = getEmbeddedLexicalEditor(container);
  return { editorRef, lexical, container: requireDefined(container, "container") };
}

function noteKeys(lexical: LexicalEditor): string[] {
  return lexical.getEditorState().read(() =>
    $dfs($getRoot())
      .map(({ node }) => node)
      .filter($isNoteNode)
      .map((n: NoteNode) => n.getKey()),
  );
}

describe("EditorRef.getNoteIndex", () => {
  it("returns the document-order index for each note key", async () => {
    const { editorRef, lexical } = await renderEditor(threeNotesUsj);
    const keys = noteKeys(lexical);
    expect(keys).toHaveLength(3);
    expect(keys.map((key) => editorRef.getNoteIndex(key))).toEqual([0, 1, 2]);
  });

  it("returns undefined for a key that is not a note", async () => {
    const { editorRef, lexical } = await renderEditor(threeNotesUsj);
    const rootKey = lexical.getEditorState().read(() => $getRoot().getKey());
    expect(editorRef.getNoteIndex(rootKey)).toBeUndefined();
    expect(editorRef.getNoteIndex("no-such-key")).toBeUndefined();
  });

  it("shifts later indexes down after an earlier note is removed", async () => {
    const { editorRef, lexical } = await renderEditor(threeNotesUsj);
    const [first, , third] = noteKeys(lexical);
    await act(async () => {
      editorRef.replaceEmbedUpdate(first, []);
    });
    expect(editorRef.getNoteIndex(third)).toBe(1);
    expect(editorRef.getNoteIndex(first)).toBeUndefined();
  });
});

describe("EditorRef.getNoteKey", () => {
  it("returns the key of the note at a document-order index and undefined past the end", async () => {
    const { editorRef, lexical } = await renderEditor(threeNotesUsj);
    const keys = noteKeys(lexical);
    expect([0, 1, 2].map((i) => editorRef.getNoteKey(i))).toEqual(keys);
    expect(editorRef.getNoteKey(3)).toBeUndefined();
    expect(editorRef.getNoteKey(-1)).toBeUndefined();
  });
});
