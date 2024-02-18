import { RefSelector, ScriptureReference } from "papi-components";
import { useMemo, useState } from "react";
import { usxStringToJson } from "shared/converters/usj/usx-to-usj";
import { Usj } from "shared/converters/usj/usj.model";
import { WEB_PSA_USX as usx } from "shared/data/WEB-PSA.usx";
// import { PSA_USX as usx } from "shared/data/psa.usfm.usx";
import { immutableNoteCallerNodeName } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import { UsjNodeOptions } from "shared-react/nodes/scripture/usj/usj-node-options.model";
import { getViewOptions } from "./editor/adaptors/view-options.utils";
import { formattedViewMode as defaultViewMode } from "./editor/plugins/toolbar/view-mode.model";
import ViewModeDropDown from "./editor/plugins/toolbar/ViewModeDropDown";
import Editor from "./editor/Editor";
import "./App.css";

const defaultScrRef: ScriptureReference = { /* PSA */ bookNum: 19, chapterNum: 1, verseNum: 1 };

const start = performance.now();
const usj = usxStringToJson(usx);
console.log(`usxStringToJson() took ${Math.round(performance.now() - start)} ms`);

const nodeOptions: UsjNodeOptions = { [immutableNoteCallerNodeName]: { onClick: () => undefined } };

const onChange = (usj: Usj) => console.log({ usjContent0_25: usj.content.slice(0, 26) });

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
        onChange={onChange}
        logger={console}
      />
    </>
  );
}
