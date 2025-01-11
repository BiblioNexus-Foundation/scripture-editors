import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Canon } from "@sillsdev/scripture";
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useEffect, useMemo, useState } from "react";
import { ScriptureReference } from "shared/adaptors/scr-ref.model";
import { GetMarkerAction } from "shared/utils/get-marker-action.model";
import { $isReactNodeWithMarker } from "../nodes/scripture/usj/node-react.utils";
import UsfmNodesMenuPlugin from "./UsfmNodesMenuPlugin";

export default function UsjNodesMenuPlugin({
  trigger,
  scrRef,
  getMarkerAction,
}: {
  trigger: string;
  scrRef: ScriptureReference;
  getMarkerAction: GetMarkerAction;
}) {
  const { bookNum, chapterNum, verseNum } = scrRef;
  const scriptureReference = useMemo(
    () => ({
      book: Canon.bookNumberToId(bookNum ?? 0),
      chapter: chapterNum ?? 0,
      verse: verseNum ?? 0,
    }),
    [bookNum, chapterNum, verseNum],
  );

  const [editor] = useLexicalComposerContext();
  const [contextMarker, setContextMarker] = useState<string | undefined>();
  useEffect(
    () =>
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          editor.read(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) {
              setContextMarker(undefined);
              return;
            }

            const startNode = $getNodeByKey(selection.anchor.key);
            const endNode = $getNodeByKey(selection.focus.key);
            if (!startNode || !endNode) {
              setContextMarker(undefined);
              return;
            }

            const contextNode = startNode.getCommonAncestor(endNode);
            if (!contextNode || !$isReactNodeWithMarker(contextNode)) {
              setContextMarker(undefined);
              return;
            }

            setContextMarker(contextNode.getMarker());
          });
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    [editor],
  );

  return (
    <UsfmNodesMenuPlugin
      trigger={trigger}
      scriptureReference={scriptureReference}
      contextMarker={contextMarker}
      getMarkerAction={getMarkerAction}
    />
  );
}