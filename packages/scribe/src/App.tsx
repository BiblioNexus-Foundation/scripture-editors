import { Usj, USJ_TYPE, USJ_VERSION } from "@biblionexus-foundation/scripture-utilities";
import { useState, useMemo, SyntheticEvent, useRef, useEffect } from "react";
import { useUsfm2Usj } from "./hooks/useUsfm2Usj";
import Editor, { EditorRef } from "./components/Editor";
import { getViewOptions } from "./adaptors/view-options.utils";
import { formattedViewMode as defaultViewMode } from "./plugins/view-mode.model";
import { ScriptureReference } from "shared/utils/get-marker-action.model";
import { UsjNodeOptions } from "shared-react/nodes/scripture/usj/usj-node-options.model";
import { immutableNoteCallerNodeName } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import { NoteEditor } from "./components/NoteEditor";
import { Usj2Usfm } from "./hooks/usj2Usfm";

const defaultUsj: Usj = {
  type: USJ_TYPE,
  version: USJ_VERSION,
  content: [],
};
const defaultScrRef: ScriptureReference = { book: "PSA", chapterNum: 1, verseNum: 1 };

function App() {
  const editorRef = useRef<EditorRef>(null!);
  const [stateX, setStateX] = useState<boolean>(false);
  const [text, setText] = useState<string>();
  const [scrRef, setScrRef] = useState(defaultScrRef);
  const { usj } = useUsfm2Usj();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (usj) editorRef.current?.setUsj(usj);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [usj]);

  const [viewMode] = useState(defaultViewMode);
  const nodeOptions: UsjNodeOptions = {
    [immutableNoteCallerNodeName]: {
      onClick: (e: SyntheticEvent) => {
        setStateX(true);
        setText(e.currentTarget.getAttribute("data-caller-id") as string);
        console.log({ e });
      },
    },
  };
  const viewOptions = useMemo(() => getViewOptions(viewMode), [viewMode]);
  // const noteViewOptions = useMemo(() => getViewOptions(noteViewMode), [noteViewMode]);
  const onChange = async (usj: Usj) => {
    console.log({ usj });
    const usfm = await Usj2Usfm(usj);
    console.log(usfm);
  };
  useEffect(() => {
    console.log({ scrRef });
  }, [scrRef]);
  return (
    <div className="flex-center m-2 flex h-editor justify-center p-8">
      <div className="relative w-2/3 overflow-hidden rounded-md border-2 border-secondary">
        <div className="left-0 right-0 top-0 z-10 flex items-center justify-between bg-gray-200 px-4 py-2">
          <span className="text-lg font-semibold">Editor</span>
          <button
            className="rounded bg-cyan-500 px-2 py-1 text-sm font-bold text-white hover:bg-white hover:text-cyan-500"
            onClick={() => setStateX(true)}
          >
            Graft Editor
          </button>
        </div>

        <div className="h-editor overflow-y-auto p-2">
          <Editor
            usjInput={defaultUsj}
            ref={editorRef}
            onChange={onChange}
            viewOptions={viewOptions}
            nodeOptions={nodeOptions}
            scrRef={scrRef}
            setScrRef={setScrRef}
          />
        </div>
      </div>

      {stateX && (
        <div
          className="relative h-56 overflow-hidden rounded-md border-2 border-secondary"
          id="noteEditor"
        >
          <div className="left-0 right-0 top-0 z-10 flex items-center justify-between bg-gray-200 px-4 py-2">
            <span className="text-lg font-semibold">Note Editor</span>
            <button
              className="rounded bg-red-500 px-2 py-1 text-sm font-bold text-white hover:bg-red-700"
              onClick={() => setStateX(false)}
            >
              X
            </button>
          </div>
          <div className="z-20 h-44 overflow-y-auto p-2">
            <NoteEditor
              usj={usj}
              onChange={onChange}
              viewOptions={viewOptions}
              nodeOptions={nodeOptions}
              scrollId={text}
            />
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
