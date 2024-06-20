import {
  insertChapterNode,
  insertVerseNode,
  insertFootNoteNode,
  // insertXrefNode,
} from "./insertFunctions";
import Button from "./Button";
import useModal from "../hooks/useModal";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { InsertDialog } from "./Input/TextInput";

export const Toolbar = () => {
  const [modal, showModal] = useModal();
  const activeEditor = useLexicalComposerContext()[0];
  return (
    <div className="left-0 right-0 top-0 z-10 flex items-center justify-start bg-gray-200 px-2 py-2">
      <div className="flex space-x-2">
        <Button
          onClick={() => {
            showModal("Insert Verse", (onClose) => (
              <InsertDialog
                activeEditor={activeEditor}
                onClose={onClose}
                insertFunction={insertVerseNode}
                label="Verse"
                placeholder="Verse Number"
              />
            ));
          }}
        >
          Insert Verse
        </Button>
        <Button
          onClick={() => {
            showModal("Insert Chapter", (onClose) => (
              <InsertDialog
                activeEditor={activeEditor}
                onClose={onClose}
                insertFunction={insertChapterNode}
                label="Chapter"
                placeholder="Chapter Number"
              />
            ));
          }}
        >
          Insert Chapter
        </Button>
        <Button
          onClick={() => {
            showModal("Insert Footnote", (onClose) => (
              <InsertDialog
                activeEditor={activeEditor}
                onClose={onClose}
                insertFunction={insertFootNoteNode}
                label="Footnote"
              />
            ));
          }}
          className="item"
        >
          <span className="text">Footnote</span>
        </Button>
        {/* <Button
          onClick={() => {
            showModal("Insert Cross Reference", (onClose) => (
              <InsertDialog
                activeEditor={activeEditor}
                onClose={onClose}
                insertFunction={insertXrefNode}
                label="Cross Reference"
              />
            ));
          }}
          className="item"
        >
          <span className="text">Cross Reference</span>
        </Button> */}
      </div>
      {modal}
    </div>
  );
};
