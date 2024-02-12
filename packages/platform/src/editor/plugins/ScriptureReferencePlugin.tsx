import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getNodeByKey,
  $getRoot,
  $getSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { ScriptureReference } from "papi-components";
import { useEffect } from "react";
import { $isBookNode, BookNode } from "shared/nodes/scripture/usj/BookNode";
import {
  findChapter,
  findNextChapter,
  findThisChapter,
  findThisVerse,
  findVerse,
  removeNodeAndAfter,
  removeNodesBeforeNode,
} from "shared/nodes/scripture/usj/node.utils";
import { ViewOptions } from "../adaptors/view-options.utils";
import { getChapterNodeClass, getVerseNodeClass } from "../adaptors/usj-editor.adaptor";

/** Prevents the cursor being moved again after a selection has changed. */
let hasSelectionChanged = false;

/**
 * A component (plugin) that keeps the Scripture reference updated.
 * @param props.scrRef - Scripture reference.
 * @param props.setScrRef - Scripture reference set function.
 * @param props.viewOptions - View options to select different view modes.
 * @returns null, i.e. no DOM elements.
 */
export default function ScriptureReferencePlugin({
  scrRef,
  setScrRef,
  viewOptions,
}: {
  scrRef: ScriptureReference;
  setScrRef: React.Dispatch<React.SetStateAction<ScriptureReference>>;
  viewOptions?: ViewOptions;
}): null {
  const [editor] = useLexicalComposerContext();
  const { bookNum, chapterNum, verseNum } = scrRef;

  // Book loaded or changed
  useEffect(
    () =>
      editor.registerMutationListener(BookNode, (nodeMutations) => {
        editor.update(() => {
          for (const [nodeKey, mutation] of nodeMutations) {
            const bookNode = $getNodeByKey<BookNode>(nodeKey);
            if (bookNode && $isBookNode(bookNode) && mutation === "created") {
              moveCursorToVerseStart(chapterNum, verseNum, viewOptions);
            }
          }
        });
      }),
    [editor, chapterNum, verseNum, viewOptions],
  );

  // Scripture Ref changed
  useEffect(() => {
    editor.update(() => {
      if (!hasSelectionChanged) moveCursorToVerseStart(chapterNum, verseNum, viewOptions);
      else hasSelectionChanged = false;
    });
  }, [editor, chapterNum, verseNum, viewOptions]);

  // selection changed
  useEffect(
    () =>
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => findAndSetChapterAndVerse(bookNum, chapterNum, verseNum, setScrRef, viewOptions),
        COMMAND_PRIORITY_LOW,
      ),
    [editor, bookNum, chapterNum, verseNum, setScrRef, viewOptions],
  );

  return null;
}

function moveCursorToVerseStart(chapterNum: number, verseNum: number, viewOptions?: ViewOptions) {
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

function findAndSetChapterAndVerse(
  bookNum: number,
  chapterNum: number,
  verseNum: number,
  setScrRef: React.Dispatch<React.SetStateAction<ScriptureReference>>,
  viewOptions?: ViewOptions,
) {
  const startNode = $getSelection()?.getNodes()[0];
  const ChapterNodeClass = getChapterNodeClass(viewOptions);
  const VerseNodeClass = getVerseNodeClass(viewOptions);
  if (!startNode || !ChapterNodeClass || !VerseNodeClass) return false;

  const chapterNode = findThisChapter(startNode, ChapterNodeClass);
  const verseNode = findThisVerse(startNode, VerseNodeClass);
  hasSelectionChanged = !!(
    (chapterNode && +chapterNode.getNumber() !== chapterNum) ||
    (verseNode && +verseNode.getNumber() !== verseNum)
  );
  if (hasSelectionChanged)
    setScrRef({
      bookNum,
      chapterNum: +(chapterNode?.getNumber() ?? chapterNum),
      verseNum: +(verseNode?.getNumber() ?? verseNum),
    });

  return false;
}
