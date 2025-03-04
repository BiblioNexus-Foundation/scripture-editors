import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $dfs, DFSNode, mergeRegister } from "@lexical/utils";
import {
  $getCommonAncestor,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useEffect, useMemo, useState } from "react";
import {
  $findNextChapter,
  $findThisChapter,
  getNextVerse,
  removeNodesBeforeNode,
} from "shared/nodes/scripture/usj/node.utils";
import { $isVerseNode, VerseNode } from "shared/nodes/scripture/usj/VerseNode";
import { GetMarkerAction, ScriptureReference } from "shared/utils/get-marker-action.model";
import {
  $isImmutableVerseNode,
  ImmutableVerseNode,
} from "shared-react/nodes/scripture/usj/ImmutableVerseNode";
import { $isReactNodeWithMarker } from "shared-react/nodes/scripture/usj/node-react.utils";
import UsfmNodesMenuPlugin from "./UsfmNodesMenuPlugin";

type DfsVerseNode = Omit<DFSNode, "node"> & { node: VerseNode | ImmutableVerseNode };

export default function UsjNodesMenuPlugin({
  trigger,
  scrRef,
  getMarkerAction,
  autoNumbering = true,
}: {
  trigger: string;
  scrRef: ScriptureReference;
  getMarkerAction: GetMarkerAction;
  autoNumbering: boolean;
}) {
  const { book, chapterNum, verseNum, verse } = scrRef;
  const scriptureReference = useMemo(() => scrRef, [book, chapterNum, verseNum, verse]);

  const [editor] = useLexicalComposerContext();
  const [contextMarker] = useContextMarker(editor);

  // Only register verse renumbering if autoNumbering is enabled
  useVerseCreated(editor, autoNumbering);

  return (
    <UsfmNodesMenuPlugin
      trigger={trigger}
      scriptureReference={scriptureReference}
      contextMarker={contextMarker}
      getMarkerAction={getMarkerAction}
      autoNumbering={autoNumbering}
    />
  );
}

function useContextMarker(editor: LexicalEditor) {
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

            const result = $getCommonAncestor(startNode, endNode);
            const commonAncestor = result ? result.commonAncestor : undefined;
            const contextNode = commonAncestor?.getParent();
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
  return [contextMarker];
}

/**
 * Extracts the verse range and/or segments from a given verse string.
 *
 * The verse string can be in the format:
 * - "1" (single verse)
 * - "1a" (single verse segment)
 * - "1-2" (verse range)
 * - "1a-2b" (verse range with segments)
 *
 * @param verse - The verse string to extract the range from.
 * @returns An array containing the matched groups or null if no match is found.
 */
function getVerseRangeSegment(verse: string) {
  return RegExp(/(\d+)([a-zA-Z]+)?(-(\d+)([a-zA-Z]+)?)?/).exec(verse);
}

/**
 * Renumber all the verse numbers after the inserted verse to keep them sequential.
 * @param insertedNode - Inserted verse node.
 */
function $renumberAllVerses(insertedNode: VerseNode | ImmutableVerseNode) {
  const children = $getRoot().getChildren();
  const chapterNode = $findThisChapter(insertedNode);
  const nodesInChapter = removeNodesBeforeNode(children, chapterNode);
  const nextChapterNode = $findNextChapter(nodesInChapter, !!chapterNode);
  const allVerseNodes = $dfs(chapterNode, nextChapterNode).filter<DfsVerseNode>(
    (dfsNode): dfsNode is DfsVerseNode =>
      $isImmutableVerseNode(dfsNode.node) || $isVerseNode(dfsNode.node),
  );
  // find the index of the inserted node in the DFS result
  const insertedNodeKey = insertedNode.getKey();
  const nodeIndex = allVerseNodes.findIndex(({ node }) => node.getKey() === insertedNodeKey);
  // all verse nodes that require renumbering
  const verseNodes = allVerseNodes.slice(nodeIndex + 1);

  // renumber for each verse
  let verseNum = parseInt(insertedNode.getNumber());
  verseNodes.forEach(({ node }) => {
    const nodeVerse = node.getNumber();
    const nodeVerseNum = parseInt(nodeVerse);
    if (nodeVerseNum > verseNum) return;

    const startVerse = getNextVerse(nodeVerseNum, undefined);
    const nodeVerseSegment = getVerseRangeSegment(nodeVerse);
    const isRange = !!nodeVerseSegment?.[3];
    const startVerseSegmentChar = nodeVerseSegment?.[2] ?? "";
    const endVerseSegmentChar = nodeVerseSegment?.[5] ?? "";
    const endVerse = isRange ? getNextVerse(parseInt(nodeVerseSegment[4]), undefined) : "";
    let tail = `${startVerseSegmentChar}`;
    tail += isRange ? `-${endVerse}${endVerseSegmentChar}` : "";
    node.setNumber(`${startVerse}${tail}`);
    verseNum = parseInt(isRange ? endVerse : startVerse);
  });
}

function useVerseCreated(editor: LexicalEditor, autoNumbering: boolean) {
  useEffect(() => {
    if (!editor.hasNodes([VerseNode, ImmutableVerseNode])) {
      throw new Error(
        "UsjNodesMenuPlugin: VerseNode or ImmutableVerseNode not registered on editor!",
      );
    }

    // Only register renumbering if autoNumbering is enabled
    if (!autoNumbering) {
      return;
    }

    // Re-generate all verse numbers when a verse is added.
    return mergeRegister(
      editor.registerMutationListener(ImmutableVerseNode, (nodeMutations) => {
        editor.update(
          () => {
            for (const [nodeKey, mutation] of nodeMutations) {
              const node = $getNodeByKey(nodeKey);
              if (mutation === "created" && $isImmutableVerseNode(node)) $renumberAllVerses(node);
            }
          },
          { tag: "history-merge" },
        );
      }),
      editor.registerMutationListener(VerseNode, (nodeMutations) => {
        editor.update(
          () => {
            for (const [nodeKey, mutation] of nodeMutations) {
              const node = $getNodeByKey(nodeKey);
              if (mutation === "created" && $isVerseNode(node)) $renumberAllVerses(node);
            }
          },
          { tag: "history-merge" },
        );
      }),
    );
  }, [editor, autoNumbering]);
}
