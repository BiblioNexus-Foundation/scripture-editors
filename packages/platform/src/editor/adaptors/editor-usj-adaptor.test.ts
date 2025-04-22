import { MarkerObject } from "@biblionexus-foundation/scripture-utilities";
import { deepEqual } from "fast-equals";
import { SerializedTextNode } from "lexical";
import { TypedMarkNode } from "shared/nodes/features/TypedMarkNode";
import scriptureUsjNodes from "shared/nodes/scripture/usj";
import { CHAPTER_MARKER, SerializedChapterNode } from "shared/nodes/scripture/usj/ChapterNode";
import { SerializedParaNode } from "shared/nodes/scripture/usj/ParaNode";
import { getVisibleOpenMarkerText } from "shared/nodes/scripture/usj/node.utils";
import { SerializedVerseNode, VERSE_MARKER } from "shared/nodes/scripture/usj/VerseNode";
import { createBasicTestEnvironment } from "shared/nodes/test.utils";
import { ImmutableNoteCallerNode } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import { ImmutableVerseNode } from "shared-react/nodes/scripture/usj/ImmutableVerseNode";
// Reaching inside only for tests.
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  CHAPTER_1_INDEX,
  VERSE_2_EDITABLE_INDEX,
  VERSE_2_INDEX,
  VERSE_PARA_INDEX,
  editorStateEmpty,
  editorStateGen1v1,
  editorStateGen1v1Editable,
  editorStateGen1v1ImpliedPara,
  editorStateGen1v1ImpliedParaEmpty,
  editorStateGen1v1Nonstandard,
  editorStateMarks,
  editorStateWithUnknownItems,
  usjEmpty,
  usjGen1v1,
  usjGen1v1ImpliedPara,
  usjGen1v1ImpliedParaEmpty,
  usjGen1v1Nonstandard,
  usjMarks,
  usjWithUnknownItems,
} from "../../../../utilities/src/converters/usj/converter-test.data";
import editorUsjAdaptor from "./editor-usj.adaptor";
import usjEditorAdaptor from "./usj-editor.adaptor";

const nodes = [TypedMarkNode, ImmutableNoteCallerNode, ImmutableVerseNode, ...scriptureUsjNodes];
const { editor } = createBasicTestEnvironment(nodes);

describe("Editor USJ Adaptor", () => {
  it("should convert to USJ from empty Lexical editor state JSON", () => {
    const editorState = editor.parseEditorState(editorStateEmpty);

    const usj = editorUsjAdaptor.deserializeEditorState(editorState);

    expect(usj).toEqual(usjEmpty);
  });

  it("should convert to USJ from Lexical editor state JSON", () => {
    const editorState = editor.parseEditorState(editorStateGen1v1);

    const usj = editorUsjAdaptor.deserializeEditorState(editorState);

    expect(usj).toEqual(usjGen1v1);
  });

  it("should convert to USJ from Lexical editor state JSON with an empty implied para", () => {
    const editorState = editor.parseEditorState(editorStateGen1v1ImpliedParaEmpty);

    const usj = editorUsjAdaptor.deserializeEditorState(editorState);

    expect(usj).toEqual(usjGen1v1ImpliedParaEmpty);
  });

  it("should convert to USJ from Lexical editor state JSON with implied para", () => {
    const editorState = editor.parseEditorState(editorStateGen1v1ImpliedPara);

    const usj = editorUsjAdaptor.deserializeEditorState(editorState);

    expect(usj).toEqual(usjGen1v1ImpliedPara);
  });

  // TODO: Fix char not being able to contain other content and re-enable this test
  // https://github.com/BiblioNexus-Foundation/scripture-editors/issues/223
  xit("should convert to USJ from Lexical editor state JSON with nonstandard features", () => {
    const editorState = editor.parseEditorState(editorStateGen1v1Nonstandard);

    const usj = editorUsjAdaptor.deserializeEditorState(editorState);

    expect(usj).toEqual(usjGen1v1Nonstandard);
  });

  it("should convert to USJ from Lexical editor state JSON with edits", () => {
    const editorStateEdited = editorStateGen1v1Editable;
    const chapter1 = editorStateEdited.root.children[CHAPTER_1_INDEX] as SerializedChapterNode;
    const chapter1Number = "101";
    (chapter1.children[0] as SerializedTextNode).text = getVisibleOpenMarkerText(
      CHAPTER_MARKER,
      chapter1Number,
    );
    const verse2 = (editorStateEdited.root.children[VERSE_PARA_INDEX] as SerializedParaNode)
      .children[VERSE_2_EDITABLE_INDEX] as SerializedVerseNode;
    const verse2Number = "202";
    verse2.text = getVisibleOpenMarkerText(VERSE_MARKER, verse2Number);
    const editorState = editor.parseEditorState(editorStateEdited);

    const usj = editorUsjAdaptor.deserializeEditorState(editorState);

    const usjGen1v1Edited = usjGen1v1;
    const usjChapter1 = usjGen1v1Edited.content[CHAPTER_1_INDEX] as MarkerObject;
    usjChapter1.number = chapter1Number;
    const usjVerse2 = (
      (usjGen1v1Edited.content[VERSE_PARA_INDEX] as MarkerObject).content as MarkerObject[]
    )[VERSE_2_INDEX];
    usjVerse2.number = verse2Number;
    expect(usj).toEqual(usjGen1v1Edited);
  });

  it("should convert USJ to Lexical editor state JSON and back again", () => {
    const serializedEditorState = usjEditorAdaptor.serializeEditorState(usjGen1v1);
    const editorState = editor.parseEditorState(serializedEditorState);

    const usj = editorUsjAdaptor.deserializeEditorState(editorState);

    const isEqual = deepEqual(usj, usjGen1v1);
    expect(usj).toEqual(usjGen1v1);
    expect(isEqual).toBe(true);
  });

  it("should convert to USJ from Lexical editor state JSON with Marks", () => {
    const editorState = editor.parseEditorState(editorStateMarks);

    const usj = editorUsjAdaptor.deserializeEditorState(editorState);

    expect(usj).toEqual(usjMarks);
  });

  it("should convert to USJ from Lexical editor state JSON with unknown items", () => {
    const editorState = editor.parseEditorState(editorStateWithUnknownItems);

    const usj = editorUsjAdaptor.deserializeEditorState(editorState);

    expect(usj).toEqual(usjWithUnknownItems);
  });
});
