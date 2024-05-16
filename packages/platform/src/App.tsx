import { BookChapterControl, ScriptureReference } from "platform-bible-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usxStringToUsj } from "shared/converters/usj/usx-to-usj";
import { Usj } from "shared/converters/usj/usj.model";
import { WEB_PSA_USX as usx } from "shared/data/WEB-PSA.usx";
// import { PSA_USX as usx } from "shared/data/psa.usfm.usx";
import { immutableNoteCallerNodeName } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import { UsjNodeOptions } from "shared-react/nodes/scripture/usj/usj-node-options.model";
import { getViewOptions, DEFAULT_VIEW_MODE } from "./editor/adaptors/view-options.utils";
import ViewModeDropDown from "./editor/toolbar/ViewModeDropDown";
import { EditorOptions, EditorRef } from "./editor/Editor";
import Marginal from "./marginal/Marginal";
import "./App.css";

const defaultUsj = usxStringToUsj('<usx version="3.0" />');
const defaultScrRef: ScriptureReference = { /* PSA */ bookNum: 19, chapterNum: 1, verseNum: 1 };
const nodeOptions: UsjNodeOptions = { [immutableNoteCallerNodeName]: { onClick: () => undefined } };

export default function App() {
  // This ref becomes defined when passed to the editor.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const editorRef = useRef<EditorRef>(null!);
  const [viewMode, setViewMode] = useState(DEFAULT_VIEW_MODE);
  const [scrRef, setScrRef] = useState(defaultScrRef);
  const options = useMemo<EditorOptions>(
    () => ({ view: getViewOptions(viewMode), nodes: nodeOptions }),
    [viewMode],
  );

  // Simulate USJ updating after the editor is loaded.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      editorRef.current?.setUsj(usxStringToUsj(usx));
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleChange = useCallback((usj: Usj) => {
    console.log({ usj });
    editorRef.current?.setUsj(usj);
  }, []);

  return (
    <>
      <div className="controls">
        <BookChapterControl scrRef={scrRef} handleSubmit={setScrRef} />
        <ViewModeDropDown viewMode={viewMode} handleSelect={setViewMode} />
      </div>
      <Marginal
        ref={editorRef}
        defaultUsj={defaultUsj}
        scrRef={scrRef}
        setScrRef={setScrRef}
        options={options}
        onChange={handleChange}
        logger={console}
      />
    </>
  );
}
