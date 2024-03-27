import { CAN_REDO_COMMAND, CAN_UNDO_COMMAND, EditorState, LexicalEditor } from "lexical";

export type HistoryStateEntry<T = Record<string, unknown>> = {
  editor: LexicalEditor;
  editorState: EditorState;
} & T;

export type HistoryState = {
  current: null | HistoryStateEntry;
  redoStack: Array<HistoryStateEntry>;
  undoStack: Array<HistoryStateEntry>;
};

export class LexicalHistoryManager {
  current: HistoryState["current"];
  redoStack: HistoryState["redoStack"];
  undoStack: HistoryState["undoStack"];
  editor: LexicalEditor;

  constructor(editor: LexicalEditor, historyState: HistoryState) {
    this.editor = editor;
    this.current = historyState.current ?? null;
    this.redoStack = historyState.redoStack ?? [];
    this.undoStack = historyState.undoStack ?? [];
  }

  merge(historyEntry: HistoryStateEntry) {
    this.current = historyEntry;
  }

  push() {
    if (this.redoStack.length !== 0) {
      this.redoStack = [];
      this.editor.dispatchCommand(CAN_REDO_COMMAND, false);
    }

    if (this.current !== null) {
      this.undoStack.push({
        ...this.current,
      });
      this.editor.dispatchCommand(CAN_UNDO_COMMAND, true);
    }
  }

  redo(/* onRedo = () => null */) {
    const redoStack = this.redoStack;
    const undoStack = this.undoStack;

    if (redoStack.length !== 0) {
      const current = this.current;

      if (current !== null) {
        undoStack.push(current);
        this.editor.dispatchCommand(CAN_UNDO_COMMAND, true);
      }

      const historyStateEntry = redoStack.pop();

      if (redoStack.length === 0) {
        this.editor.dispatchCommand(CAN_REDO_COMMAND, false);
      }

      this.current = historyStateEntry || null;

      if (historyStateEntry) {
        historyStateEntry.editor.setEditorState(historyStateEntry.editorState, {
          tag: "historic",
        });
      }
    }
  }

  undo(/* onUndo = () => null */) {
    const redoStack = this.redoStack;
    const undoStack = this.undoStack;
    const undoStackLength = undoStack.length;

    if (undoStackLength !== 0) {
      const current = this.current;
      const historyStateEntry = undoStack.pop();

      if (current !== null) {
        redoStack.push(current);
        this.editor.dispatchCommand(CAN_REDO_COMMAND, true);
      }

      if (undoStack.length === 0) {
        this.editor.dispatchCommand(CAN_UNDO_COMMAND, false);
      }

      this.current = historyStateEntry || null;

      if (historyStateEntry) {
        historyStateEntry.editor.setEditorState(historyStateEntry.editorState, {
          tag: "historic",
        });
      }
    }
  }

  reset(editor?: LexicalEditor) {
    this.clear();
    if (editor) this.editor = editor;
    this.editor.dispatchCommand(CAN_REDO_COMMAND, false);
    this.editor.dispatchCommand(CAN_UNDO_COMMAND, false);
  }

  clear() {
    this.current = null;
    this.redoStack = [];
    this.undoStack = [];
  }
}
