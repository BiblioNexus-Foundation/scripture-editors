import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $createRangeSelection,
  $getNearestNodeFromDOMNode,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  LexicalEditor,
  LexicalCommand,
} from "lexical";
import { useEffect, useRef } from "react";
import { $isChapterNode } from "shared/nodes/scripture/usj/ChapterNode";
import {
  $isImmutableChapterNumberNode,
  ImmutableChapterNumberNode,
  SELECT_IMMUTABLE_CHAPTER_NUMBER_COMMAND,
} from "shared/nodes/scripture/usj/ImmutableChapterNumberNode";
import {
  findNearestElementOfClass,
  isEditorInput,
  isImmutableChapter,
} from "shared/nodes/scripture/usj/node.utils";

function $handleChapterNumberSelection(chapterNumberElement: HTMLElement, editor: LexicalEditor) {
  editor.update(() => {
    const node = $getNearestNodeFromDOMNode(chapterNumberElement);
    const parent = node?.getParent();
    if (!$isImmutableChapterNumberNode(node) || !$isChapterNode(parent)) return;

    // Note the element is not displayed as selected and copying is prevented since it's immutable.
    const parentKey = parent.getKey();
    const selection = $createRangeSelection();
    selection.anchor.set(parentKey, 0, "element");
    selection.focus.set(parentKey, 0, "element");
    $setSelection(selection);
  });
  return true;
}

function useChapterNumberSelection(editor: LexicalEditor): void {
  const editorInputClassNameRef = useRef<string>();

  useEffect(() => {
    editorInputClassNameRef.current = editor.getRootElement()?.className || "";
  }, [editor]);

  useEffect(() => {
    if (!editor.hasNodes([ImmutableChapterNumberNode])) {
      throw new Error("SelectionPlugin: ImmutableChapterNumberNode not registered on editor!");
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const chapterNumberElement =
        // Closest ImmutableChapterNumberNode (element with the immutable chapter number class)
        target.closest<HTMLElement>(`.${ImmutableChapterNumberNode.getType()}`) ??
        // Else first element of the clicked chapter (should be ImmutableChapterNumberNode)
        ((isImmutableChapter(target) ? (target.children[0] as HTMLElement) : undefined) ??
        // Else nearest ImmutableChapterNumberNode to the clicked editor input container.
        isEditorInput(target, editorInputClassNameRef.current)
          ? findNearestElementOfClass(
              target,
              ImmutableChapterNumberNode.getType(),
              event.clientX,
              event.clientY,
            )
          : undefined);
      if (chapterNumberElement)
        editor.dispatchCommand<LexicalCommand<HTMLElement>>(
          SELECT_IMMUTABLE_CHAPTER_NUMBER_COMMAND,
          chapterNumberElement,
        );
    };

    return mergeRegister(
      editor.registerCommand(
        SELECT_IMMUTABLE_CHAPTER_NUMBER_COMMAND,
        $handleChapterNumberSelection,
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerRootListener(
        (rootElement: HTMLElement | null, prevRootElement: HTMLElement | null) => {
          if (prevRootElement !== null) {
            prevRootElement.removeEventListener("click", onClick);
          }
          if (rootElement !== null) {
            rootElement.addEventListener("click", onClick);
          }
        },
      ),
    );
  }, [editor]);
}

export default function SelectionPlugin(): null {
  const [editor] = useLexicalComposerContext();
  useChapterNumberSelection(editor);
  return null;
}
