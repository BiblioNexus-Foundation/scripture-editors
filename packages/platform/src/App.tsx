import { Usj, usxStringToUsj } from "@biblionexus-foundation/scripture-utilities";
import { Canon, SerializedVerseRef } from "@sillsdev/scripture";
import { BookChapterControl } from "platform-bible-react";
import { ScriptureReference as BCReference } from "platform-bible-utils";
import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WEB_PSA_USX as usx } from "shared/data/WEB-PSA.usx";
import { WEB_PSA_COMMENTS as comments } from "shared/data/WEB_PSA.comments";
import { AnnotationRange } from "shared-react/annotation/selection.model";
import { immutableNoteCallerNodeName } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import { UsjNodeOptions } from "shared-react/nodes/scripture/usj/usj-node-options.model";
import { TextDirection } from "shared-react/plugins/text-direction.model";
import AnnotationTypeSelect from "./AnnotationTypeSelect";
import { getViewOptions, DEFAULT_VIEW_MODE } from "./editor/adaptors/view-options.utils";
import { EditorOptions } from "./editor/Editor";
import { Comments } from "./marginal/comments/commenting";
import Marginal, { MarginalRef } from "./marginal/Marginal";
import TextDirectionDropDown from "./TextDirectionDropDown";
import ViewModeDropDown from "./ViewModeDropDown";
import "./App.css";

type Annotations = {
  [buttonId: string]: {
    selection: AnnotationRange;
    types: { [annotationType: string]: { isSet: boolean; id: string } };
  };
};

const defaultUsj = usxStringToUsj('<usx version="3.1" />');
const defaultScrRef: SerializedVerseRef = {
  book: "PSA",
  chapterNum: 1,
  verseNum: 1,
};
const nodeOptions: UsjNodeOptions = {
  [immutableNoteCallerNodeName]: { onClick: () => console.log("note node clicked") },
};
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
// Word "stand" inside first q2 of PSA 1:1.
const annotationRange3 = {
  start: { jsonPath: "$.content[11].content[0]", offset: 4 },
  end: { jsonPath: "$.content[11].content[0]", offset: 9 },
};
const defaultAnnotations: Annotations = {
  annotation1: {
    selection: annotationRange1,
    types: {
      spelling: { isSet: false, id: "s1" },
      grammar: { isSet: false, id: "g1" },
      other: { isSet: false, id: "o1" },
    },
  },
  annotation2: {
    selection: annotationRange2,
    types: {
      spelling: { isSet: false, id: "s2" },
      grammar: { isSet: false, id: "g2" },
      other: { isSet: false, id: "o2" },
    },
  },
  annotation3: {
    selection: annotationRange3,
    types: {
      spelling: { isSet: false, id: "s3" },
      grammar: { isSet: false, id: "g3" },
      other: { isSet: false, id: "o3" },
    },
  },
};

function getOptions(
  isReadonly: boolean,
  hasSpellCheck: boolean,
  textDirection: TextDirection,
  viewMode: string | undefined,
): EditorOptions {
  return {
    isReadonly,
    hasSpellCheck,
    textDirection,
    view: getViewOptions(viewMode),
    nodes: nodeOptions,
  };
}

export default function App() {
  const marginalRef = useRef<MarginalRef | null>(null);
  const [definedOptions, setDefinedOptions] = useState(true);
  const [isReadonly, setIsReadonly] = useState(false);
  const [hasSpellCheck, setHasSpellCheck] = useState(false);
  const [textDirection, setTextDirection] = useState<TextDirection>("ltr");
  const [viewMode, setViewMode] = useState(DEFAULT_VIEW_MODE);
  const [scrRef, setScrRef] = useState(defaultScrRef);
  const [annotations, setAnnotations] = useState(defaultAnnotations);
  const [annotationType, setAnnotationType] = useState("spelling");

  const options = useMemo<EditorOptions>(
    () => (definedOptions ? getOptions(isReadonly, hasSpellCheck, textDirection, viewMode) : {}),
    [definedOptions, isReadonly, hasSpellCheck, textDirection, viewMode],
  );

  const handleUsjChange = useCallback((usj: Usj, comments: Comments | undefined) => {
    console.log({ usj, comments });
    marginalRef.current?.setUsj(usj);
  }, []);

  const bcScrRef = useMemo<BCReference>(
    () => ({
      bookNum: Canon.bookIdToNumber(scrRef.book),
      chapterNum: scrRef.chapterNum,
      verseNum: scrRef.verseNum,
    }),
    [scrRef],
  );

  const handleBcScrRefChange = useCallback((bcScrRef: BCReference) => {
    setScrRef({
      book: Canon.bookNumberToId(bcScrRef.bookNum),
      chapterNum: bcScrRef.chapterNum,
      verseNum: bcScrRef.verseNum,
    });
  }, []);

  const handleTypeChange = useCallback((type: string) => setAnnotationType(type), []);

  const handleCursorClick = useCallback((addition: number) => {
    const location = marginalRef.current?.getSelection();
    if (!location) return;

    location.start.offset += addition;
    if (location.end) location.end.offset += addition;
    marginalRef.current?.setSelection(location);
  }, []);

  const handleAnnotationClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const buttonId = (event.target as HTMLButtonElement).id;
      const _annotations = { ...annotations };
      const annotation = _annotations[buttonId];
      const type = annotation.types[annotationType];
      const annotationId = type.id;
      type.isSet
        ? marginalRef.current?.removeAnnotation(annotationType, annotationId)
        : marginalRef.current?.addAnnotation(annotation.selection, annotationType, annotationId);
      type.isSet = !type.isSet;
      setAnnotations(_annotations);
    },
    [annotationType, annotations],
  );

  const annotateButtonClass = useCallback(
    (buttonId: string): string | undefined => {
      const isSet = annotations[buttonId].types[annotationType].isSet;
      return isSet ? "active" : undefined;
    },
    [annotationType, annotations],
  );

  const toggleDefineOptions = useCallback(() => setDefinedOptions((value) => !value), []);

  // Simulate USJ updating after the editor is loaded.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      marginalRef.current?.setComments?.(comments as Comments);
      marginalRef.current?.setUsj(usxStringToUsj(usx));
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <div className="controls">
        <BookChapterControl scrRef={bcScrRef} handleSubmit={handleBcScrRefChange} />
        <span>
          <div>Cursor Location</div>
          <div>
            <button onClick={() => handleCursorClick(-3)}>-3</button>
            <button onClick={() => handleCursorClick(-1)}>-1</button>
            <button onClick={() => handleCursorClick(1)}>+1</button>
            <button onClick={() => handleCursorClick(3)}>+3</button>
          </div>
        </span>
        <span>
          <div>
            Annotate <AnnotationTypeSelect onChange={handleTypeChange} />
          </div>
          <div>
            <button
              id="annotation1"
              className={annotateButtonClass("annotation1")}
              onClick={handleAnnotationClick}
            >
              man
            </button>
            <button
              id="annotation2"
              className={annotateButtonClass("annotation2")}
              onClick={handleAnnotationClick}
            >
              man who
            </button>
            <button
              id="annotation3"
              className={annotateButtonClass("annotation3")}
              onClick={handleAnnotationClick}
            >
              stand
            </button>
          </div>
        </span>
        <button onClick={toggleDefineOptions}>
          {definedOptions ? "Undefine" : "Define"} Options
        </button>
      </div>
      {definedOptions && (
        <div className="defined-options">
          <div className="checkbox">
            <input
              type="checkbox"
              id="isReadonlyCheckBox"
              checked={isReadonly}
              onChange={(e) => setIsReadonly(e.target.checked)}
            />
            <label htmlFor="isReadonlyCheckBox">Is Readonly</label>
          </div>
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
        onScrRefChange={setScrRef}
        onSelectionChange={(selection) => console.log({ selection })}
        onCommentChange={(comments) => console.log({ comments })}
        onUsjChange={handleUsjChange}
        options={options}
        logger={console}
      />
    </>
  );
}
