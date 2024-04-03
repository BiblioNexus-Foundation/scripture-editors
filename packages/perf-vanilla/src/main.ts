import "./style.css";
import { createEditor } from "lexical";
import scriptureNodes from "shared/nodes";
import { EmoticonNode } from "shared/nodes/EmoticonNode";
import { getLexicalState, getPerf } from "shared/contentManager";
import { fetchUsfm } from "shared/contentManager/mockup/fetchUsfm";
import {
  HistoryMergeListener,
  createEmptyHistoryState,
  registerHistory,
} from "shared/plugins/History";
import { getPathBuilder } from "shared/plugins/PerfOperations/pathBuilder";
import { getOperations } from "shared/plugins/History/operations";
import { operationBuilder } from "shared/plugins/PerfOperations/operationBuilder";
import { transformLexicalStateToPerf } from "shared/converters/lexicalToPerf";
import equal from "deep-equal";
import { applyPatch } from "open-patcher";
import { SerializedUsfmElementNode } from "shared/nodes/UsfmElementNode";

(async () => {
  const config = {
    namespace: "MyEditor",
    theme: {},
    nodes: [...scriptureNodes, EmoticonNode],
    onError: console.error,
  };
  const { lexicalState, perfSource } = await fetchUsfm({
    serverName: "dbl",
    organizationId: "bfbs",
    languageCode: "fra",
    versionId: "lsg",
    bookCode: "tit",
  }).then(async (usfm) => {
    const perfSource = await getPerf(usfm);
    return { perfSource, lexicalState: JSON.stringify(getLexicalState(perfSource)) };
  });
  //Initialize editor
  const editor = createEditor(config);
  editor.setEditorState(editor.parseEditorState(lexicalState), {
    tag: "history-merge",
  });

  const handleChange: HistoryMergeListener = ({
    dirtyLeaves,
    dirtyElements,
    editorState,
    prevEditorState,
    history,
  }) => {
    const { canUndo, mergeHistory, currentEntry } = history;
    const { perfDocument: prevPerfDocument } = currentEntry as {
      perfDocument: { sequences: { [sequenceId: string]: unknown }; ["main_sequence_id"]: string };
    };
    console.log({ dirtyElements, dirtyLeaves, currentEntry });

    if (!canUndo && !prevPerfDocument) {
      //History initialization
      console.log("Initializing Perf History");
      mergeHistory({ perfDocument: perfSource });
      return;
    }

    //TODO: MAKE SURE MODIFICATIONS TO CONTENT ELEMENTS OF KIND GRAFT ARE ALSO CONVERTED INTO SEQUENCE ACTIONS IF THEY ARE DELETED OR REPLACED WITH A DIFFERENT GRAFT (OTHER TARGET).
    const elementOperations = getOperations({
      dirtyNodes: dirtyElements,
      editorState,
      prevEditorState,
      pathBuilder: getPathBuilder(prevPerfDocument["main_sequence_id"]),
      operationBuilder: operationBuilder,
    });

    const patchedSequences = applyPatch({
      source: prevPerfDocument.sequences,
      operations: [...elementOperations],
    });

    const patchedDocument = { ...prevPerfDocument, sequences: patchedSequences };
    console.log({ editorState });

    const editorLexicalState = editorState.toJSON();
    const _lexicalPerfState = transformLexicalStateToPerf(
      editorLexicalState.root as SerializedUsfmElementNode,
      "sequence",
    );
    const lexicalPerfState = {
      ...patchedDocument,
      sequences: {
        [patchedDocument["main_sequence_id"]]: _lexicalPerfState.targetNode,
        ..._lexicalPerfState.sequences,
      },
    };
    const isPerfDeepEqual =
      JSON.stringify(patchedDocument, null, 2) === JSON.stringify(lexicalPerfState, null, 2);
    console.log("Is perf deep equal:", isPerfDeepEqual, equal(patchedDocument, lexicalPerfState));
    console.log({
      a: JSON.stringify(patchedDocument, null, 2),
      b: JSON.stringify(lexicalPerfState, null, 2),
    });

    const perfLexicalState = getLexicalState(patchedDocument);

    const isLexicalDeepEqual =
      JSON.stringify(editorLexicalState, null, 2) === JSON.stringify(perfLexicalState, null, 2);
    console.log(
      "Is lexical deep equal:",
      isLexicalDeepEqual,
      equal(editorLexicalState, perfLexicalState),
    );

    console.log({ editorLexicalState, perfLexicalState });
    console.log({
      a: JSON.stringify(editorLexicalState, null, 2),
      b: JSON.stringify(perfLexicalState, null, 2),
    });

    mergeHistory({
      actions: { elementOperations },
      perfDocument: patchedDocument,
    });
  };

  //Register Plugins
  // registerRichText(editor);
  // registerEmoticons(editor);
  // registerOnTransform({ editor, onTransform: () => null });
  registerHistory(editor, createEmptyHistoryState(), handleChange, 1000);
  // registerOnChange({
  //   editor,
  //   onChange: ({ editorState, dirtyElements, dirtyLeaves }) => {
  //     console.log({ dirtyElements, editorState });
  //   },
  // });
  // registerOnMutation({
  //   editor,
  //   onMutation: () => {},
  // });
  editor.setRootElement(document.getElementById("editor"));
})();
