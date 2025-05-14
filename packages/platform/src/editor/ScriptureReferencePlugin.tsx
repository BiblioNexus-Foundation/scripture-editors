import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { SerializedVerseRef } from "@sillsdev/scripture";
import {
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useEffect, useRef } from "react";
import { $isBookNode, BookNode } from "shared/nodes/usj/BookNode";
import { CURSOR_CHANGE_TAG } from "shared/nodes/usj/node-constants";
import {
  $findChapter,
  $findNextChapter,
  $findThisChapter,
  getSelectionStartNode,
  isVerseInRange,
  isVerseRange,
  removeNodeAndAfter,
  removeNodesBeforeNode,
} from "shared/nodes/usj/node.utils";
import { $isParaNode } from "shared/nodes/usj/ParaNode";
import { $findThisVerse, $findVerseOrPara } from "shared-react/nodes/usj/node-react.utils";

/**
 * A component (plugin) that keeps the Scripture reference updated.
 * @param props.scrRef - Scripture reference.
 * @param props.onScrRefChange - Callback function when the Scripture reference has changed.
 * @returns null, i.e. no DOM elements.
 */
export default function ScriptureReferencePlugin({
  scrRef,
  onScrRefChange,
}: {
  scrRef: SerializedVerseRef;
  onScrRefChange: (scrRef: SerializedVerseRef) => void;
}): null {
  const [editor] = useLexicalComposerContext();
  /** Prevents the cursor being moved again after a selection has changed. */
  const hasSelectionChangedRef = useRef(false);
  /** Prevents the `scrRef` updating again after the cursor has moved. */
  const hasCursorMovedRef = useRef(false);
  const { book, chapterNum, verseNum } = scrRef;

  // Book loaded or changed
  useEffect(
    () =>
      editor.registerMutationListener(
        BookNode,
        (nodeMutations) => {
          editor.update(
            () => {
              for (const [nodeKey, mutation] of nodeMutations) {
                const bookNode = $getNodeByKey<BookNode>(nodeKey);
                if (bookNode && $isBookNode(bookNode) && mutation === "created") {
                  $moveCursorToVerseStart(chapterNum, verseNum, hasCursorMovedRef);
                }
              }
            },
            { tag: CURSOR_CHANGE_TAG },
          );
        },
        { skipInitialization: true },
      ),
    [editor, chapterNum, verseNum],
  );

  // Scripture Reference changed
  useEffect(() => {
    if (hasSelectionChangedRef.current) hasSelectionChangedRef.current = false;
    else {
      editor.update(() => $moveCursorToVerseStart(chapterNum, verseNum, hasCursorMovedRef), {
        tag: CURSOR_CHANGE_TAG,
      });
    }
  }, [editor, chapterNum, verseNum]);

  // Selection changed
  useEffect(
    () =>
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          if (hasCursorMovedRef.current) hasCursorMovedRef.current = false;
          else {
            $findAndSetChapterAndVerse(
              book,
              chapterNum,
              verseNum,
              onScrRefChange,
              hasSelectionChangedRef,
            );
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    [editor, book, chapterNum, verseNum, onScrRefChange],
  );

  return null;
}

function $moveCursorToVerseStart(
  chapterNum: number,
  verseNum: number,
  hasCursorMovedRef: React.MutableRefObject<boolean>,
) {
  const startNode = getSelectionStartNode($getSelection());
  const selectedVerse = $findThisVerse(startNode)?.getNumber();
  if (isVerseRange(selectedVerse) && isVerseInRange(verseNum, selectedVerse)) return;

  const children = $getRoot().getChildren();
  const chapterNode = $findChapter(children, chapterNum);
  const nodesInChapter = removeNodesBeforeNode(children, chapterNode);
  const nextChapterNode = $findNextChapter(nodesInChapter, !!chapterNode);
  if ((nextChapterNode && !chapterNode) || !chapterNode) return;

  removeNodeAndAfter(nodesInChapter, nextChapterNode);
  const verseOrParaNode = $findVerseOrPara(nodesInChapter, verseNum);
  if (!verseOrParaNode) return;

  if ($isParaNode(verseOrParaNode)) {
    const firstChild = verseOrParaNode.getFirstChild();
    if ($isTextNode(firstChild)) firstChild.select(0, 0);
    else verseOrParaNode.select(0, 0);
  } else verseOrParaNode.selectNext(0, 0);
  hasCursorMovedRef.current = true;
}

function $findAndSetChapterAndVerse(
  book: string,
  chapterNum: number,
  verseNum: number,
  onScrRefChange: (scrRef: SerializedVerseRef) => void,
  hasSelectionChangedRef: React.MutableRefObject<boolean>,
) {
  const startNode = getSelectionStartNode($getSelection());
  if (!startNode) return;

  const chapterNode = $findThisChapter(startNode);
  const selectedChapterNum = parseInt(chapterNode?.getNumber() ?? "1", 10);
  const verseNode = $findThisVerse(startNode);
  const verse = verseNode?.getNumber();
  // For verse ranges this returns the first number.
  const selectedVerseNum = parseInt(verse ?? "0", 10);
  hasSelectionChangedRef.current = !!(
    (chapterNode && selectedChapterNum !== chapterNum) ||
    selectedVerseNum !== verseNum
  );
  if (hasSelectionChangedRef.current) {
    const scrRef: SerializedVerseRef = {
      book,
      chapterNum: selectedChapterNum,
      verseNum: selectedVerseNum,
    };
    if (verse != null && selectedVerseNum.toString() !== verse) scrRef.verse = verse;
    onScrRefChange(scrRef);
  }
}
