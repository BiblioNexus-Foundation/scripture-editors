import { Usj } from "@biblionexus-foundation/scripture-utilities";
import { useState, useMemo, SyntheticEvent, useRef, useEffect, useCallback } from "react";
import { useUsfm2Usj } from "./hooks/useUsfm2Usj";
import Editor, { EditorRef } from "./components/Editor";
import { getViewOptions } from "./adaptors/view-options.utils";
import { formattedViewMode as defaultViewMode } from "./plugins/view-mode.model";
import { UsjNodeOptions } from "shared-react/nodes/scripture/usj/usj-node-options.model";
import { immutableNoteCallerNodeName } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import { NoteEditor } from "./components/NoteEditor";
import { Usj2Usfm } from "./hooks/usj2Usfm";
import { ScriptureReference } from "./plugins/ScriptureReferencePlugin";
import { TextDirection } from "shared-react/plugins/text-direction.model";

const defaultUsj: Usj = {
  type: "USJ",
  version: "0.2.1",
  content: [],
};
const defaultScrRef: ScriptureReference = { /* PSA */ bookCode: "PSA", chapterNum: 1, verseNum: 1 };
const directions: TextDirection[] = ["ltr", "rtl", "auto"];

function App() {
  const editorRef1 = useRef<EditorRef>(null!);
  const editorRef2 = useRef<EditorRef>(null!);
  const [stateX, setStateX] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const [scrRef, setScrRef] = useState(defaultScrRef);
  const [textDirection, setTextDirection] = useState<TextDirection>("rtl");

  const [mainEditorScrollPosition, setMainEditorScrollPosition] = useState(0);
  const [noteEditorScrollPosition, setNoteEditorScrollPosition] = useState(0);
  const [isSyncingScroll, setIsSyncingScroll] = useState(false);

  const { usj } = useUsfm2Usj();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      usj && editorRef1.current?.setUsj(usj);
      usj && editorRef2.current?.setUsj(usj);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [usj]);

  const [viewMode] = useState(defaultViewMode);
  const nodeOptions: UsjNodeOptions = {
    [immutableNoteCallerNodeName]: {
      onClick: (e: SyntheticEvent) => {
        setStateX(true);
        setText(e.currentTarget.getAttribute("data-caller-id") as string);
      },
    },
  };
  const viewOptions = useMemo(() => getViewOptions(viewMode), [viewMode]);
  // const noteViewOptions = useMemo(() => getViewOptions(noteViewMode), [noteViewMode]);
  const onChange = async (updatedUsj: Usj) => {
    editorRef1.current?.setUsj(updatedUsj);
    const usfm = await Usj2Usfm(updatedUsj);
    console.log(usfm);
  };

  useEffect(() => {
    console.log({ scrRef });
  }, [scrRef]);
  const toggleDirection = () => {
    setTextDirection((current) => {
      const index = directions.indexOf(current);
      return directions[(index + 1) % directions.length];
    });
  };
  const handleMainEditorScroll = useCallback(
    (position: number) => {
      if (!isSyncingScroll) {
        setIsSyncingScroll(true);
        setMainEditorScrollPosition(position);
        if (
          editorRef2.current &&
          typeof usj?.content[0] === "object" &&
          usj?.content[0]?.code === scrRef.bookCode
        ) {
          editorRef2.current.setScrollPosition(position);
        }
        setIsSyncingScroll(false);
      }
    },
    [isSyncingScroll, usj, scrRef.bookCode],
  );

  const handleNoteEditorScroll = useCallback(
    (position: number) => {
      if (!isSyncingScroll) {
        setIsSyncingScroll(true);
        setNoteEditorScrollPosition(position);
        if (
          editorRef1.current &&
          typeof usj?.content[0] === "object" &&
          usj?.content[0]?.code === scrRef.bookCode
        ) {
          editorRef1.current.setScrollPosition(position);
        }
        setIsSyncingScroll(false);
      }
    },
    [isSyncingScroll, usj, scrRef.bookCode],
  );

  return (
    <div className="m-2 flex h-editor items-start justify-center">
      <div className="w-full overflow-hidden rounded-md border-2 border-secondary">
        <div className="left-0 right-0 top-0 z-10 flex items-center justify-between bg-gray-200 px-4 py-2">
          <span className="text-lg font-semibold">Editor</span>
          <button
            className="rounded bg-cyan-500 px-2 py-1 text-sm font-bold text-white hover:bg-white hover:text-cyan-500"
            onClick={() => setStateX(true)}
          >
            Graft Editor
          </button>
          <button
            className="rounded bg-cyan-500 px-2 py-1 text-sm font-bold text-white hover:bg-white hover:text-cyan-500"
            onClick={() => toggleDirection()}
          >
            Toggle Direction ({textDirection})
          </button>
        </div>
        <div className="flex">
          <div className="h-editor">
            <Editor
              usjInput={defaultUsj}
              ref={editorRef1}
              onChange={onChange}
              viewOptions={viewOptions}
              nodeOptions={nodeOptions}
              scrRef={scrRef}
              setScrRef={setScrRef}
              textDirection={textDirection}
              onScroll={handleMainEditorScroll}
              syncScrollPosition={mainEditorScrollPosition}
            />
          </div>
          <div className="h-editor overflow-y-auto">
            <Editor
              usjInput={defaultUsj}
              ref={editorRef2}
              onChange={onChange}
              viewOptions={viewOptions}
              nodeOptions={nodeOptions}
              scrRef={scrRef}
              setScrRef={setScrRef}
              textDirection={textDirection}
              onScroll={handleNoteEditorScroll}
              syncScrollPosition={noteEditorScrollPosition}
              IsRefEditor={true}
            />
          </div>
        </div>
      </div>

      {stateX && (
        <div
          className="h-56 w-[300px] overflow-hidden rounded-md border-2 border-secondary"
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
