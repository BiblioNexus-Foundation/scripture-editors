import { Usj, usxStringToUsj } from "@biblionexus-foundation/scripture-utilities";
import { BookChapterControl, ScriptureReference } from "platform-bible-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WEB_PSA_USX as usx } from "shared/data/WEB-PSA.usx";
// import { PSA_USX as usx } from "shared/data/psa.usfm.usx";
import { WEB_PSA_COMMENTS as comments } from "shared/data/WEB_PSA.comments";
import { immutableNoteCallerNodeName } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import { UsjNodeOptions } from "shared-react/nodes/scripture/usj/usj-node-options.model";
import { TextDirection } from "shared-react/plugins/text-direction.model";
import { getViewOptions, DEFAULT_VIEW_MODE } from "./editor/adaptors/view-options.utils";
import { EditorOptions } from "./editor/Editor";
import { Comments } from "./marginal/comments/commenting";
import Marginal, { MarginalRef } from "./marginal/Marginal";
import TextDirectionDropDown from "./TextDirectionDropDown";
import ViewModeDropDown from "./ViewModeDropDown";

import "./App.css";

const defaultUsj = usxStringToUsj('<usx version="3.0" />');
const defaultScrRef: ScriptureReference = { /* PSA */ bookNum: 19, chapterNum: 1, verseNum: 1 };
const nodeOptions: UsjNodeOptions = { [immutableNoteCallerNodeName]: { onClick: () => undefined } };
// Word "man" inside first q1 of PSA 1:1.
const annotationRange1 = {
  start: { jsonPath: "$.content[10].content[2]", offset: 15 },
  end: { jsonPath: "$.content[10].content[2]", offset: 18 },
};
// Phrase "man who" inside first q1 of PSA 1:1.
const annotationRange2 = {
  start: { jsonPath: "$.content[10].content[2]", offset: 15 },
  end: { jsonPath: "$.content[10].content[2]", offset: 22 },
};
// Phrase "stand on " inside first q2 of PSA 1:1.
const annotationRange3 = {
  start: { jsonPath: "$.content[11].content[0]", offset: 4 },
  end: { jsonPath: "$.content[11].content[0]", offset: 9 },
};
const cursorLocation = { start: { jsonPath: "$.content[10].content[2]", offset: 15 } };

function getOptions(
  definedOptions: boolean,
  hasSpellCheck: boolean,
  textDirection: TextDirection,
  viewMode: string | undefined,
): EditorOptions {
  return definedOptions
    ? { hasSpellCheck, textDirection, view: getViewOptions(viewMode), nodes: nodeOptions }
    : {};
}

export default function App() {
  const marginalRef = useRef<MarginalRef | null>(null);
  const [definedOptions, setDefinedOptions] = useState(true);
  const [hasSpellCheck, setHasSpellCheck] = useState(false);
  const [textDirection, setTextDirection] = useState<TextDirection>("ltr");
  const [viewMode, setViewMode] = useState(DEFAULT_VIEW_MODE);
  const [scrRef, setScrRef] = useState(defaultScrRef);

  const options = useMemo<EditorOptions>(
    () => getOptions(definedOptions, hasSpellCheck, textDirection, viewMode),
    [definedOptions, hasSpellCheck, textDirection, viewMode],
  );

  const handleChange = useCallback((usj: Usj, comments: Comments | undefined) => {
    console.log({ usj, comments });
    marginalRef.current?.setUsj(usj);
  }, []);

  const toggleDefineOptions = useCallback(() => setDefinedOptions((value) => !value), []);

  // Simulate USJ updating after the editor is loaded.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      marginalRef.current?.setComments?.(comments as Comments);
      marginalRef.current?.setUsj(usxStringToUsj(usx));
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Add annotations after USJ is loaded.
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const timeoutId = setTimeout(() => {
      marginalRef.current?.addAnnotation(annotationRange1, "spelling", "annotationId");
      marginalRef.current?.addAnnotation(annotationRange2, "grammar", "abc123");
      marginalRef.current?.addAnnotation(annotationRange1, "other", "bcd234");
      marginalRef.current?.addAnnotation(annotationRange3, "other", "bcd567");
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Remove some annotations after they were added and set cursor location.
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const timeoutId = setTimeout(() => {
      marginalRef.current?.removeAnnotation("other", "bcd234");
      marginalRef.current?.setSelection(cursorLocation);
    }, 4000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <div className="controls">
        <BookChapterControl scrRef={scrRef} handleSubmit={setScrRef} />
        <button onClick={toggleDefineOptions}>
          {definedOptions ? "Undefine" : "Define"} Options
        </button>
      </div>
      {definedOptions && (
        <div className="defined-options">
          <div className="checkbox">
            <input
              type="checkbox"
              id="hasSpellCheckBox"
              checked={hasSpellCheck}
              onChange={(e) => setHasSpellCheck(e.target.checked)}
            />
            <label htmlFor="hasSpellCheckBox">Has Spell Check</label>
          </div>
          <TextDirectionDropDown textDirection={textDirection} handleSelect={setTextDirection} />
          <ViewModeDropDown viewMode={viewMode} handleSelect={setViewMode} />
        </div>
      )}
      <Marginal
        ref={marginalRef}
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
