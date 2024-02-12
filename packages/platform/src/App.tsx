import { RefSelector, ScriptureReference } from "papi-components";
import { useMemo, useState } from "react";
import { usxStringToJson } from "shared/converters/usj/usx-to-usj";
import { WEB_PSA_USX as usx } from "shared/data/WEB-PSA.usx";
// import { PSA_USX as usx } from "shared/data/psa.usfm.usx";
import { immutableNoteCallerNodeName } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import { getViewOptions } from "./editor/adaptors/view-options.utils";
import { UsjNodeOptions } from "./editor/adaptors/usj-editor.adaptor";
import { formattedViewMode as defaultViewMode } from "./editor/plugins/toolbar/view-mode.model";
import ViewModeDropDown from "./editor/plugins/toolbar/ViewModeDropDown";
import Editor from "./editor/Editor";
import "./App.css";

const defaultScrRef: ScriptureReference = { /* PSA */ bookNum: 19, chapterNum: 1, verseNum: 1 };

const usj = usxStringToJson(usx);

const nodeOptions: UsjNodeOptions = { [immutableNoteCallerNodeName]: { onClick: () => undefined } };

export default function App() {
  const [viewMode, setViewMode] = useState(defaultViewMode);
  const [scrRef, setScrRef] = useState(defaultScrRef);
  const viewOptions = useMemo(() => getViewOptions(viewMode), [viewMode]);

  return (
    <>
      <div className="ref-selector">
        <RefSelector handleSubmit={setScrRef} scrRef={scrRef} />
      </div>
      <ViewModeDropDown viewMode={viewMode} handleSelect={setViewMode} />
      <Editor
        usj={usj}
        viewOptions={viewOptions}
        scrRef={scrRef}
        setScrRef={setScrRef}
        nodeOptions={nodeOptions}
        logger={console}
      />
    </>
  );
}
