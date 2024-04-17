import { SerializedEditorState } from "lexical";
import {
  NOTE_CALLER_INDEX,
  NOTE_INDEX,
  NOTE_PARA_INDEX,
  NOTE_PARA_WITH_UNKNOWN_ITEMS_INDEX,
  editorStateEmpty,
  editorStateGen1v1,
  editorStateGen1v1Editable,
  editorStateGen1v1ImpliedPara,
  editorStateMarks,
  editorStateWithUnknownItems,
  usjEmpty,
  usjGen1v1,
  usjGen1v1ImpliedPara,
  usjMarks,
  usjWithUnknownItems,
} from "shared/converters/usj/converter-test.data";
import { MarkerObject } from "shared/converters/usj/usj.model";
import { SerializedParaNode } from "shared/nodes/scripture/usj/ParaNode";
import { SerializedNoteNode } from "shared/nodes/scripture/usj/NoteNode";
import { SerializedImmutableNoteCallerNode } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import { unformattedViewMode } from "../toolbar/view-mode.model";
import { serializeEditorState, reset } from "./usj-editor.adaptor";
import { getViewOptions } from "./view-options.utils";

/**
 * Remove the `onClick` function because it can't be compared since it's anonymous.
 * @param serializedEditorState
 */
function removeOnClick(
  serializedEditorState: SerializedEditorState,
  noteParaIndex = NOTE_PARA_INDEX,
  noteIndex = NOTE_INDEX,
  noteCallerIndex = NOTE_CALLER_INDEX,
) {
  const note = (serializedEditorState.root.children[noteParaIndex] as SerializedParaNode).children[
    noteIndex
  ] as SerializedNoteNode;
  const noteCaller = note.children[noteCallerIndex] as SerializedImmutableNoteCallerNode;
  delete noteCaller.onClick;
}

describe("USJ Editor Adaptor", () => {
  it("should convert from empty USJ to Lexical editor state JSON", () => {
    const serializedEditorState = serializeEditorState(usjEmpty);

    expect(serializedEditorState).toEqual(editorStateEmpty);
  });

  it("should convert from USJ to Lexical editor state JSON", () => {
    const serializedEditorState = serializeEditorState(usjGen1v1);

    const note = (serializedEditorState.root.children[NOTE_PARA_INDEX] as SerializedParaNode)
      .children[NOTE_INDEX] as SerializedNoteNode;
    const noteCaller = note.children[NOTE_CALLER_INDEX] as SerializedImmutableNoteCallerNode;
    expect(typeof noteCaller.onClick).toBe("function");
    removeOnClick(serializedEditorState);
    expect(serializedEditorState).toEqual(editorStateGen1v1);
  });

  it("should convert from USJ with implied para to Lexical editor state JSON", () => {
    const serializedEditorState = serializeEditorState(usjGen1v1ImpliedPara);

    expect(serializedEditorState).toEqual(editorStateGen1v1ImpliedPara);
  });

  it("should convert from USJ to Lexical editor state JSON with editable view", () => {
    const serializedEditorState = serializeEditorState(
      usjGen1v1,
      getViewOptions(unformattedViewMode),
    );

    expect(serializedEditorState).toEqual(editorStateGen1v1Editable);
  });

  it("should convert from USJ to Lexical editor state JSON with caller clocked", () => {
    reset(25);

    // SUT
    let serializedEditorState = serializeEditorState(usjGen1v1);

    const editorStateCallerUpdated = editorStateGen1v1;
    const note = (editorStateCallerUpdated.root.children[NOTE_PARA_INDEX] as SerializedParaNode)
      .children[NOTE_INDEX] as SerializedNoteNode;
    const noteCaller = note.children[NOTE_CALLER_INDEX] as SerializedImmutableNoteCallerNode;
    noteCaller.caller = "z";
    removeOnClick(serializedEditorState);
    expect(serializedEditorState).toEqual(editorStateCallerUpdated);

    reset(52);

    // SUT
    serializedEditorState = serializeEditorState(usjGen1v1);

    noteCaller.caller = "ba";
    removeOnClick(serializedEditorState);
    expect(serializedEditorState).toEqual(editorStateCallerUpdated);
  });

  it("should reset if the note caller count is too large", () => {
    reset(701);

    // SUT
    let serializedEditorState = serializeEditorState(usjGen1v1);

    const editorStateCallerUpdated = editorStateGen1v1;
    const note = (editorStateCallerUpdated.root.children[NOTE_PARA_INDEX] as SerializedParaNode)
      .children[NOTE_INDEX] as SerializedNoteNode;
    const noteCaller = note.children[NOTE_CALLER_INDEX] as SerializedImmutableNoteCallerNode;
    noteCaller.caller = "zz";
    removeOnClick(serializedEditorState);
    expect(serializedEditorState).toEqual(editorStateCallerUpdated);

    reset(702);

    // SUT
    serializedEditorState = serializeEditorState(usjGen1v1);

    noteCaller.caller = "a";
    removeOnClick(serializedEditorState);
    expect(serializedEditorState).toEqual(editorStateCallerUpdated);
  });

  it("should convert from USJ to Lexical editor state JSON including the hidden caller", () => {
    const usjGen1v1Updated = usjGen1v1;
    const usjNote = (
      (usjGen1v1Updated.content[NOTE_PARA_INDEX] as MarkerObject).content as MarkerObject[]
    )[NOTE_INDEX];
    usjNote.caller = "-";

    const serializedEditorState = serializeEditorState(usjGen1v1Updated);

    const editorStateCallerUpdated = editorStateGen1v1;
    const note = (editorStateCallerUpdated.root.children[NOTE_PARA_INDEX] as SerializedParaNode)
      .children[NOTE_INDEX] as SerializedNoteNode;
    note.caller = "-";
    const noteCaller = note.children[NOTE_CALLER_INDEX] as SerializedImmutableNoteCallerNode;
    noteCaller.caller = "-";
    removeOnClick(serializedEditorState);
    expect(serializedEditorState).toEqual(editorStateCallerUpdated);
  });

  it("should convert from USJ with Marks to Lexical editor state JSON", () => {
    const serializedEditorState = serializeEditorState(usjMarks);

    expect(serializedEditorState).toEqual(editorStateMarks);
  });

  it("should convert from USJ with unknown items to Lexical editor state JSON", () => {
    reset();

    const serializedEditorState = serializeEditorState(usjWithUnknownItems);

    removeOnClick(serializedEditorState, NOTE_PARA_WITH_UNKNOWN_ITEMS_INDEX);
    expect(serializedEditorState).toEqual(editorStateWithUnknownItems);
  });
});
