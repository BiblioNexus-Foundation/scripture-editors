import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getNodeByKey,
  $getRoot,
  $getSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import type { ScriptureReference } from "platform-bible-utils";
import { useEffect } from "react";
import { $isBookNode, BookNode } from "shared/nodes/scripture/usj/BookNode";
import {
  CURSOR_CHANGE_TAG,
  findChapter,
  findNextChapter,
  findThisChapter,
  removeNodeAndAfter,
  removeNodesBeforeNode,
} from "shared/nodes/scripture/usj/node.utils";
import { findThisVerse, findVerse } from "shared-react/nodes/scripture/usj/node-react.utils";
import {
  getChapterNodeClass,
  getVerseNodeClass,
  getViewOptions,
  ViewOptions,
} from "./adaptors/view-options.utils";

/** Prevents the cursor being moved again after a selection has changed. */
let hasSelectionChanged = false;

/**
 * A component (plugin) that keeps the Scripture reference updated.
 * @param props.scrRef - Scripture reference.
 * @param props.onScrRefChange - Callback function when the Scripture reference has changed.
 * @param props.viewOptions - View options to select different view modes.
 * @returns null, i.e. no DOM elements.
 */
export default function ScriptureReferencePlugin({
  scrRef,
  onScrRefChange,
  viewOptions = getViewOptions(),
}: {
  scrRef: ScriptureReference;
  onScrRefChange: (scrRef: ScriptureReference) => void;
  viewOptions?: ViewOptions;
}): null {
  const [editor] = useLexicalComposerContext();
  const { bookNum, chapterNum, verseNum } = scrRef;

  // Book loaded or changed
  useEffect(
    () =>
      editor.registerMutationListener(BookNode, (nodeMutations) => {
        editor.update(
          () => {
            for (const [nodeKey, mutation] of nodeMutations) {
              const bookNode = $getNodeByKey<BookNode>(nodeKey);
              if (bookNode && $isBookNode(bookNode) && mutation === "created") {
                $moveCursorToVerseStart(chapterNum, verseNum, viewOptions);
              }
            }
          },
          { tag: CURSOR_CHANGE_TAG },
        );
      }),
    [editor, chapterNum, verseNum, viewOptions],
  );

  // Scripture Ref changed
  useEffect(() => {
    editor.update(
      () => {
        if (!hasSelectionChanged) $moveCursorToVerseStart(chapterNum, verseNum, viewOptions);
        else hasSelectionChanged = false;
      },
      { tag: CURSOR_CHANGE_TAG },
    );
  }, [editor, chapterNum, verseNum, viewOptions]);

  // selection changed
  useEffect(
    () =>
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () =>
          $findAndSetChapterAndVerse(bookNum, chapterNum, verseNum, onScrRefChange, viewOptions),
        COMMAND_PRIORITY_LOW,
      ),
    [editor, bookNum, chapterNum, verseNum, onScrRefChange, viewOptions],
  );

  return null;
}

function $moveCursorToVerseStart(chapterNum: number, verseNum: number, viewOptions?: ViewOptions) {
  const ChapterNodeClass = getChapterNodeClass(viewOptions);
  const VerseNodeClass = getVerseNodeClass(viewOptions);
  if (!ChapterNodeClass || !VerseNodeClass) return;

  const children = $getRoot().getChildren();
  const chapterNode = findChapter(children, chapterNum, ChapterNodeClass);
  const nodesInChapter = removeNodesBeforeNode(children, chapterNode);
  const nextChapterNode = findNextChapter(nodesInChapter, !!chapterNode, ChapterNodeClass);
  if ((nextChapterNode && !chapterNode) || !chapterNode) return;

  removeNodeAndAfter(nodesInChapter, chapterNode, nextChapterNode);
  const verseNode = findVerse(nodesInChapter, verseNum, VerseNodeClass);
  if (!verseNode || verseNode.isSelected()) return;

  verseNode.selectNext(0, 0);
}

function $findAndSetChapterAndVerse(
  bookNum: number,
  chapterNum: number,
  verseNum: number,
  onScrRefChange: (scrRef: ScriptureReference) => void,
  viewOptions?: ViewOptions,
) {
  const startNode = $getSelection()?.getNodes()[0];
  const ChapterNodeClass = getChapterNodeClass(viewOptions);
  const VerseNodeClass = getVerseNodeClass(viewOptions);
  if (!startNode || !ChapterNodeClass || !VerseNodeClass) return false;

  const chapterNode = findThisChapter(startNode, ChapterNodeClass);
  const selectedChapterNum = parseInt(chapterNode?.getNumber() ?? "0", 10);
  const verseNode = findThisVerse(startNode, VerseNodeClass);
  // For combined verses this returns the first number.
  const selectedVerseNum = parseInt(verseNode?.getNumber() ?? "0", 10);
  hasSelectionChanged = !!(
    (chapterNode && selectedChapterNum !== chapterNum) ||
    (verseNode && selectedVerseNum !== verseNum)
  );
  if (hasSelectionChanged)
    onScrRefChange({
      bookNum,
      chapterNum: selectedChapterNum || chapterNum,
      verseNum: selectedVerseNum || verseNum,
    });

  return false;
}
