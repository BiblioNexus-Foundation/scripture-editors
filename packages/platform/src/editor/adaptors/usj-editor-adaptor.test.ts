import { SerializedEditorState } from "lexical";
import {
  NOTE_CALLER_INDEX,
  NOTE_INDEX,
  NOTE_PARA_INDEX,
  editorStateEmpty,
  editorStateGen1v1,
  editorStateGen1v1ImpliedPara,
  usjEmpty,
  usjGen1v1,
  usjGen1v1ImpliedPara,
} from "shared/converters/usj/converter-test.data";
import { MarkerObject } from "shared/converters/usj/usj.model";
import { SerializedParaNode } from "shared/nodes/scripture/usj/ParaNode";
import { SerializedImmutableNoteCallerNode } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import { loadEditorState, reset } from "./usj-editor.adaptor";
import { SerializedNoteNode } from "shared/nodes/scripture/usj/NoteNode";

/**
 * Remove the `onClick` function because it can't be compared since it's anonymous.
 * @param serializedEditorState
 */
function removeOnClick(serializedEditorState: SerializedEditorState) {
  const note = (serializedEditorState.root.children[NOTE_PARA_INDEX] as SerializedParaNode)
    .children[NOTE_INDEX] as SerializedNoteNode;
  const noteCaller = note.children[NOTE_CALLER_INDEX] as SerializedImmutableNoteCallerNode;
  delete noteCaller.onClick;
}

describe("USJ Editor Adaptor", () => {
  it("should convert from empty USJ to Lexical editor state JSON", () => {
    const serializedEditorState = loadEditorState(usjEmpty);
    expect(serializedEditorState).toEqual(editorStateEmpty);
  });

  it("should convert from USJ to Lexical editor state JSON", () => {
    const serializedEditorState = loadEditorState(usjGen1v1);
    const note = (serializedEditorState.root.children[NOTE_PARA_INDEX] as SerializedParaNode)
      .children[NOTE_INDEX] as SerializedNoteNode;
    const noteCaller = note.children[NOTE_CALLER_INDEX] as SerializedImmutableNoteCallerNode;
    expect(typeof noteCaller.onClick).toBe("function");
    removeOnClick(serializedEditorState);
    expect(serializedEditorState).toEqual(editorStateGen1v1);
  });

  it("should convert from USJ with implied para to Lexical editor state JSON", () => {
    const serializedEditorState = loadEditorState(usjGen1v1ImpliedPara);
    expect(serializedEditorState).toEqual(editorStateGen1v1ImpliedPara);
  });

  it("should convert from USJ to Lexical editor state JSON with caller clocked", () => {
    reset(25);

    // SUT
    let serializedEditorState = loadEditorState(usjGen1v1);

    const editorStateCallerUpdated = editorStateGen1v1;
    const note = (editorStateCallerUpdated.root.children[NOTE_PARA_INDEX] as SerializedParaNode)
      .children[NOTE_INDEX] as SerializedNoteNode;
    const noteCaller = note.children[NOTE_CALLER_INDEX] as SerializedImmutableNoteCallerNode;
    noteCaller.caller = "z";
    removeOnClick(serializedEditorState);
    expect(serializedEditorState).toEqual(editorStateCallerUpdated);

    reset(52);

    // SUT
    serializedEditorState = loadEditorState(usjGen1v1);

    noteCaller.caller = "ba";
    removeOnClick(serializedEditorState);
    expect(serializedEditorState).toEqual(editorStateCallerUpdated);
  });

  it("should reset if the note caller count is too large", () => {
    reset(701);

    // SUT
    let serializedEditorState = loadEditorState(usjGen1v1);

    const editorStateCallerUpdated = editorStateGen1v1;
    const note = (editorStateCallerUpdated.root.children[NOTE_PARA_INDEX] as SerializedParaNode)
      .children[NOTE_INDEX] as SerializedNoteNode;
    const noteCaller = note.children[NOTE_CALLER_INDEX] as SerializedImmutableNoteCallerNode;
    noteCaller.caller = "zz";
    removeOnClick(serializedEditorState);
    expect(serializedEditorState).toEqual(editorStateCallerUpdated);

    reset(702);

    // SUT
    serializedEditorState = loadEditorState(usjGen1v1);

    noteCaller.caller = "a";
    removeOnClick(serializedEditorState);
    expect(serializedEditorState).toEqual(editorStateCallerUpdated);
  });

  it("should convert from USJ to Lexical editor state JSON without note", () => {
    const usjGen1v1Updated = usjGen1v1;
    const usjNote = (
      (usjGen1v1Updated.content[NOTE_PARA_INDEX] as MarkerObject).content as MarkerObject[]
    )[NOTE_INDEX];
    usjNote.caller = "-";

    const serializedEditorState = loadEditorState(usjGen1v1Updated);

    const editorStateCallerUpdated = editorStateGen1v1;
    const notePara = editorStateCallerUpdated.root.children[NOTE_PARA_INDEX] as SerializedParaNode;
    notePara.children.splice(NOTE_INDEX, 1);
    expect(serializedEditorState).toEqual(editorStateCallerUpdated);
  });
});
