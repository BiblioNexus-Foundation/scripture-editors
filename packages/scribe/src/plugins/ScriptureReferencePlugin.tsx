import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getNodeByKey,
  $getRoot,
  $getSelection,
  COMMAND_PRIORITY_LOW,
  EditorState,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useEffect, useRef } from "react";
import { $isBookNode, BookNode } from "shared/nodes/scripture/usj/BookNode";
import {
  $findChapter,
  $findNextChapter,
  $findThisChapter,
  removeNodeAndAfter,
  removeNodesBeforeNode,
} from "shared/nodes/scripture/usj/node.utils";
import { ScriptureReference } from "shared/utils/get-marker-action.model";
import { $findThisVerse, $findVerse } from "shared-react/nodes/scripture/usj/node-react.utils";
import { CURSOR_CHANGE_TAG } from "shared/nodes/scripture/usj/node-constants";

/**
 * A component (plugin) that keeps the Scripture reference updated.
 * @param props.scrRef - Scripture reference.
 * @param props.setScrRef - Set Scripture reference callback function.
 * @param props.viewOptions - View options to select different view modes.
 * @returns null, i.e. no DOM elements.
 */
export function ScriptureReferencePlugin({
  scrRef,
  setScrRef,
}: {
  scrRef: ScriptureReference;
  setScrRef: React.Dispatch<React.SetStateAction<ScriptureReference>>;
}): null {
  const [editor] = useLexicalComposerContext();
  /** Prevents the cursor being moved again after a selection has changed. */
  const hasSelectionChangedRef = useRef(false);
  const { book, chapterNum, verseNum } = scrRef;

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
                  $moveCursorToVerseStart(chapterNum, verseNum);
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

  // Scripture Ref changed
  useEffect(() => {
    editor.update(
      () => {
        if (!hasSelectionChangedRef.current) $moveCursorToVerseStart(chapterNum, verseNum);
        else hasSelectionChangedRef.current = false;
      },
      { tag: CURSOR_CHANGE_TAG },
    );
  }, [editor, chapterNum, verseNum]);

  // selection changed
  useEffect(
    () =>
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () =>
          $findAndSetChapterAndVerse(book, chapterNum, verseNum, setScrRef, hasSelectionChangedRef),
        COMMAND_PRIORITY_LOW,
      ),
    [editor, book, chapterNum, verseNum, setScrRef],
  );

  editor.registerUpdateListener(({ editorState }) => {
    $getBookCode(editorState, setScrRef);
  });

  return null;
}

function $moveCursorToVerseStart(chapterNum: number, verseNum: number) {
  const children = $getRoot().getChildren();
  const chapterNode = $findChapter(children, chapterNum);
  const nodesInChapter = removeNodesBeforeNode(children, chapterNode);
  const nextChapterNode = $findNextChapter(nodesInChapter, !!chapterNode);
  if ((nextChapterNode && !chapterNode) || !chapterNode) return;

  removeNodeAndAfter(nodesInChapter, chapterNode, nextChapterNode);
  const verseNode = $findVerse(nodesInChapter, verseNum);
  if (!verseNode || verseNode.isSelected()) return;

  verseNode.selectNext(0, 0);
}

function $findAndSetChapterAndVerse(
  book: string,
  chapterNum: number,
  verseNum: number,
  onScrRefChange: (scrRef: ScriptureReference) => void,
  hasSelectionChangedRef: React.MutableRefObject<boolean>,
) {
  const startNode = $getSelection()?.getNodes()[0];
  if (!startNode) return false;

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
    const scrRef: ScriptureReference = {
      book,
      chapterNum: selectedChapterNum,
      verseNum: selectedVerseNum,
    };
    if (verse != null && selectedVerseNum.toString() !== verse) scrRef.verse = verse;
    onScrRefChange(scrRef);
  }

  return false;
}

const $getBookCode = (
  editorState: EditorState,
  setScrRef: React.Dispatch<React.SetStateAction<ScriptureReference>>,
) => {
  editorState.read(() => {
    const root = $getRoot();
    let node = root.getFirstChild();

    while (node !== null) {
      if ($isBookNode(node)) {
        const bookNode = node;
        setScrRef((prevState: ScriptureReference) => ({
          ...prevState,
          book: bookNode.__code,
        }));
        break;
      }
      node = node.getNextSibling();
    }
  });
};
