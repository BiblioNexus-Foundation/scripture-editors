import { RefSelector, ScriptureReference } from "papi-components";
import { useCallback, useMemo, useRef, useState } from "react";
import { usxStringToUsj } from "shared/converters/usj/usx-to-usj";
import { Usj } from "shared/converters/usj/usj.model";
import { WEB_PSA_USX as usx } from "shared/data/WEB-PSA.usx";
// import { PSA_USX as usx } from "shared/data/psa.usfm.usx";
import { immutableNoteCallerNodeName } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import { UsjNodeOptions } from "shared-react/nodes/scripture/usj/usj-node-options.model";
import { getViewOptions } from "./editor/adaptors/view-options.utils";
import { formattedViewMode as defaultViewMode } from "./editor/toolbar/view-mode.model";
import ViewModeDropDown from "./editor/toolbar/ViewModeDropDown";
import Editor, { EditorRef } from "./editor/Editor";
import "./App.css";

const defaultUsj = usxStringToUsj('<usx version="3.0" />');
const defaultScrRef: ScriptureReference = { /* PSA */ bookNum: 19, chapterNum: 1, verseNum: 1 };
const nodeOptions: UsjNodeOptions = { [immutableNoteCallerNodeName]: { onClick: () => undefined } };

export default function App() {
  // This ref becomes defined when passed to the editor.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const editorRef = useRef<EditorRef>(null!);
  const [viewMode, setViewMode] = useState(defaultViewMode);
  const [scrRef, setScrRef] = useState(defaultScrRef);
  const viewOptions = useMemo(() => getViewOptions(viewMode), [viewMode]);

  // Simulate USJ updating after the editor is loaded.
  setTimeout(() => {
    editorRef.current?.setUsj(usxStringToUsj(usx));
  }, 1000);

  const handleChange = useCallback((usj: Usj) => {
    console.log({ usj });
    editorRef.current?.setUsj(usj);
  }, []);

  return (
    <>
      <div className="ref-selector">
        <RefSelector handleSubmit={setScrRef} scrRef={scrRef} />
      </div>
      <ViewModeDropDown viewMode={viewMode} handleSelect={setViewMode} />
      <Editor
        defaultUsj={defaultUsj}
        ref={editorRef}
        viewOptions={viewOptions}
        scrRef={scrRef}
        setScrRef={setScrRef}
        nodeOptions={nodeOptions}
        onChange={handleChange}
        logger={console}
      />
    </>
  );
}
