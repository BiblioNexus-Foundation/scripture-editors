import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import useModal from "../../hooks/useModal";
import { InsertDialog } from "../../components/Input/TextInput";
import { insertChapterNode, insertVerseNode, insertFootNoteNode } from "./insertFunctions";

export function InsertButtons() {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useModal();

  return (
    <div className="flex gap-1 space-x-1">
      <button
        onClick={() => {
          showModal("Insert Verse", (onClose) => (
            <InsertDialog
              activeEditor={editor}
              onClose={onClose}
              insertFunction={insertVerseNode}
              label="Verse"
              placeholder="Verse Number"
            />
          ));
        }}
        className="px-2 py-1 text-base hover:bg-gray-700"
        title="Insert Verse"
      >
        V
      </button>
      <button
        onClick={() => {
          showModal("Insert Chapter", (onClose) => (
            <InsertDialog
              activeEditor={editor}
              onClose={onClose}
              insertFunction={insertChapterNode}
              label="Chapter"
              placeholder="Chapter Number"
            />
          ));
        }}
        className="px-2 py-1 text-base hover:bg-gray-700"
        title="Insert Chapter"
      >
        C
      </button>
      <button
        onClick={() => {
          showModal("Insert Footnote", (onClose) => (
            <InsertDialog
              activeEditor={editor}
              onClose={onClose}
              insertFunction={insertFootNoteNode}
              label="Footnote"
            />
          ));
        }}
        className="px-2 py-1 text-base hover:bg-gray-700"
        title="Footnote"
      >
        FN
      </button>
      <button
        onClick={() => {
          showModal("Insert Cross Reference", (onClose) => (
            <InsertDialog
              activeEditor={editor}
              onClose={onClose}
              insertFunction={insertFootNoteNode}
              label="XRef"
            />
          ));
        }}
        className="px-2 py-1 text-base hover:bg-gray-700"
        title="Footnote"
      >
        XR
      </button>
      {modal}
    </div>
  );
}
