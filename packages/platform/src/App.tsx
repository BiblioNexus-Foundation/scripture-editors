import { RefSelector, ScriptureReference } from "papi-components";
import { useCallback, useMemo, useState } from "react";
import { usxStringToJson } from "shared/converters/usj/usx-to-usj";
import { WEB_PSA_USX as usx } from "shared/data/WEB-PSA.usx";
// import { PSA_USX as usx } from "shared/data/psa.usfm.usx";
import { noteNodeName } from "shared-react/nodes/scripture/usj/NoteNode";
import { getViewOptions, viewOptionsToMode } from "./editor/adaptors/view-options.utils";
import { UsjNodeOptions } from "./editor/adaptors/usj-editor.adaptor";
import { formattedViewMode as defaultViewMode } from "./editor/plugins/toolbar/view-mode.model";
import ViewModeDropDown from "./editor/plugins/toolbar/ViewModeDropDown";
import Editor from "./editor/Editor";
import "./App.css";

const defaultScrRef: ScriptureReference = { /* PSA */ bookNum: 19, chapterNum: 1, verseNum: 1 };

const usj = usxStringToJson(usx);

const nodeOptions: UsjNodeOptions = { [noteNodeName]: { onClick: () => undefined } };

export default function App() {
  const [viewMode, setViewMode] = useState(defaultViewMode);
  const [scrRef, setScrRef] = useState(defaultScrRef);
  const viewOptions = useMemo(() => getViewOptions(viewMode), [viewMode]);
  const setViewOptions = useCallback(() => {
    const viewMode = viewOptionsToMode(viewOptions);
    if (viewMode) setViewMode(viewMode);
  }, [viewOptions]);

  return (
    <>
      <div className="ref-selector">
        <RefSelector handleSubmit={setScrRef} scrRef={scrRef} />
      </div>
      <ViewModeDropDown viewMode={viewMode} handleSelect={setViewMode} />
      <Editor
        usj={usj}
        viewOptionsState={[viewOptions, setViewOptions]}
        scrRefState={[scrRef, setScrRef]}
        nodeOptions={nodeOptions}
        logger={console}
      />
    </>
  );
}
