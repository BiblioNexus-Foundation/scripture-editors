import {
  $applyNodeReplacement,
  $createParagraphNode,
  $createTextNode,
  $insertNodes,
  $isRootOrShadowRoot,
  $parseSerializedNode,
  SerializedLexicalNode,
} from "lexical";
import { $wrapNodeInElement } from "@lexical/utils";

export const $insertUsfmNode = (serializedNode: SerializedLexicalNode) => {
  const newNode = $applyNodeReplacement($parseSerializedNode(serializedNode));
  $insertNodes([newNode]);

  //temporary trick so there is some text to move the cursor to after and before the newly added span
  if (!newNode.getNextSibling()) newNode.insertAfter($createTextNode(" "));
  if (!newNode.getPreviousSibling()) newNode.insertBefore($createTextNode(" "));

  if ($isRootOrShadowRoot(newNode.getParentOrThrow())) {
    $wrapNodeInElement(newNode, $createParagraphNode).selectEnd();
  }
};
