/* eslint-disable  @typescript-eslint/no-explicit-any */
import {
  LexicalEditor,
  $getSelection,
  $isRangeSelection,
  $createTextNode,
  RangeSelection,
  TextNode,
  $insertNodes,
  $applyNodeReplacement,
  $parseSerializedNode,
  SerializedLexicalNode,
  $isRootOrShadowRoot,
  $createParagraphNode,
} from "lexical";
import { recurseNodes as recurseSerializedNodes } from "../adaptors/editor-usj.adaptor";
import { recurseNodes as recurseEditorNodes } from "../adaptors/usj-editor.adaptor";

import { $createChapterNode } from "shared/nodes/scripture/usj/EditableChapterNode";
import { $createVerseNode } from "shared/nodes/scripture/usj/VerseNode";
import { emptyFootnote } from "../nodes/emptyCrossRefence";
import { $wrapNodeInElement } from "@lexical/utils";

function moveToEndOfNode(selection: RangeSelection, node: TextNode) {
  const anchorOffset = node.getTextContentSize();
  selection.anchor.set(node.getKey(), anchorOffset, "text");
  selection.focus.set(node.getKey(), anchorOffset, "text");
}
export const $createNodeFromSerializedNode = (serializedNode: SerializedLexicalNode) => {
  return $applyNodeReplacement($parseSerializedNode(serializedNode));
};
export const $insertUsfmNode = (serializedNode: SerializedLexicalNode) => {
  const newNode = $createNodeFromSerializedNode(serializedNode);
  $insertNodes([newNode]);

  if ($isRootOrShadowRoot(newNode.getParentOrThrow())) {
    $wrapNodeInElement(newNode, $createParagraphNode).selectEnd();
  }

  return newNode;
};
export function insertChapterNode({
  editor,
  inputValues: { chapter },
}: {
  editor: LexicalEditor;
  inputValues: { chapter: string };
}): void {
  console.log({ chapter });
  const sid: string = "xx",
    altnumber: string = "xx",
    pubnumber: string = "xx",
    text: string = chapter,
    classList: string[] = ["chapter", "usfm_c", "text-spacing", "formatted-font"];
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const chapterNode = $createChapterNode(chapter, classList, text, sid, altnumber, pubnumber);
      const spaceNode = $createTextNode(" ");
      selection.insertNodes([chapterNode, spaceNode]);
      moveToEndOfNode(selection, spaceNode);
    }
  });
}

export function insertVerseNode({
  editor,
  inputValues: { verse },
}: {
  editor: LexicalEditor;
  inputValues: { verse: string };
}): void {
  const sid: string = "xx",
    altnumber: string = "xx",
    pubnumber: string = "xx",
    text: string = verse;
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const verseNode = $createVerseNode(verse, text, sid, altnumber, pubnumber);

      const spaceNode = $createTextNode(" ");
      selection.insertNodes([verseNode, spaceNode]);
      moveToEndOfNode(selection, spaceNode);
    }
  });
}
export interface InsertNoteNodeParams {
  editor: LexicalEditor;
  inputValues: {
    fr?: string;
    fqa?: string;
    fq?: string;
    ft?: string;
  };
}
type InputValues = InsertNoteNodeParams["inputValues"];
function createFootnodeFromInputs(inputValues: InputValues): any {
  const createNode = (node: any, inputValues: InputValues): any => {
    console.log({ node });
    const newNode = { ...node };

    if (newNode.children) {
      newNode.children[0] = newNode.children[0]?.map((child: any) =>
        createNode(child, inputValues),
      );

      Object.keys(inputValues).forEach((key) => {
        if (!newNode[0].children.some((child: any) => child.marker === key)) {
          newNode.children[0].push({
            type: "char",
            marker: key,
            text: inputValues[key as keyof InputValues],
            detail: 0,
            format: 0,
            mode: "normal",
            style: "display: none",
            version: 1,
          });
        }
      });
    }
    // if (newNode.children && newNode.children[0]?.children) {
    //   console.log(newNode.children[0].children);
    //   newNode.children[0].children = newNode.children[0].children.map((child: any) =>
    //     createNode(child, inputValues),
    //   );

    //   // Add missing markers as new nodes
    //   Object.keys(inputValues).forEach((key) => {
    //     if (!newNode.children[0].children.some((child: any) => child.marker === key)) {
    //       newNode.children[0].children.push({
    //         type: "char",
    //         marker: key,
    //         text: inputValues[key as keyof InputValues],
    //         detail: 0,
    //         format: 0,
    //         mode: "normal",
    //         style: "display: none",
    //         version: 1,
    //       });
    //     }
    //   });
    // }

    const key = newNode.marker as keyof InputValues;
    if (inputValues[key]) {
      newNode.text = inputValues[key];
    }

    return newNode;
  };
  // const rootNote = emptyFootnote.children[0];
  // if (rootNote) {
  //   emptyFootnote.children[0] = createNode(rootNote, inputValues);
  // }

  return createNode(emptyFootnote, inputValues);
}

export function insertFootNoteNode({ editor, inputValues }: InsertNoteNodeParams): void {
  const newFootnoteNode = createFootnodeFromInputs(inputValues);
  console.log({ newFootnoteNode });
  editor.update(() => {
    const notecontent = recurseSerializedNodes(newFootnoteNode.children);
    const noteNode = recurseEditorNodes(notecontent);
    $insertUsfmNode(noteNode[0]);
  });
}

// export function insertXrefNode({
//   editor,
//   ftOriginRef,
//   ftcontent,
//   ftquot,
//   fttext,
// }: {
//   editor: LexicalEditor;
//   ftOriginRef?: string;
//   ftcontent?: string;
//   ftquot?: string;
//   fttext?: string;
// }): void {
//   editor.update(() => {
//     const notecontent = recurseSerializedNodes(emptyCrossRefence.children);
//     console.log({ notecontent });
//     const noteNode = recurseEditorNodes(notecontent);
//     console.log({ noteNode });
//     $insertUsfmNode(noteNode[0]);
//   });
// }
