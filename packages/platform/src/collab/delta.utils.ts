import { $getRoot, $createTextNode, $isElementNode, $isTextNode, LexicalNode } from "lexical";
import { DeltaOperation } from "rich-text";
import { LoggerBasic } from "shared/adaptors/logger-basic.model";
import { $createParaNode, $isParaNode, ParaNode } from "shared/nodes/usj/ParaNode";

/**
 * Apply Operational Transform updates to the editor.
 * @param ops - Operations array.
 * @param logger - Logger to use, if any.
 */
export function $applyUpdate(ops: DeltaOperation[], logger?: LoggerBasic) {
  /** Tracks the current position in the document */
  let currentIndex = 0;
  ops.forEach((op) => {
    if ("retain" in op) {
      if (typeof op.retain !== "number" || op.retain < 0) {
        logger?.error(`Invalid retain operation: ${JSON.stringify(op)}`);
        return; // Skip malformed operation
      }

      logger?.debug(`Retain: ${op.retain}`);
      // TODO: Handle attributes if present in op.attributes
      currentIndex += op.retain;
    } else if ("delete" in op) {
      if (typeof op.delete !== "number" || op.delete <= 0) {
        logger?.error(`Invalid delete operation: ${JSON.stringify(op)}`);
        return; // Skip malformed operation
      }
      logger?.debug(`Delete: ${op.delete}`);
      $deleteTextAtCurrentIndex(currentIndex, op.delete, logger);
      // Delete operations do not advance the currentIndex in the Quill Delta model
    } else if ("insert" in op) {
      logger?.debug(`Insert: ${op.insert}`);
      const insertValue = op.insert;
      if (typeof insertValue === "string") {
        $insertStringAtCurrentIndex(currentIndex, insertValue, logger);
        currentIndex += insertValue.length;
      } else {
        // TODO: Handle embed objects (op.insert is not a string)
        // Embeds also advance the currentIndex, typically by 1.
        logger?.warn(
          `Insert of non-string type not yet implemented: ${JSON.stringify(insertValue)}`,
        );
        // currentIndex += 1; // Placeholder: Advance by 1 for an embed
      }
    } else {
      logger?.error(`Unknown operation: ${JSON.stringify(op)}`);
    }
  });
}

// Helper function to delete text starting at a given flat index from the document
function $deleteTextAtCurrentIndex(targetIndex: number, count: number, logger?: LoggerBasic) {
  if (count <= 0) return;

  const root = $getRoot();
  let charWalkerOffset = 0; // Tracks characters traversed so far in the document's text content
  let remainingToDelete = count;

  // Inner recursive function to find and delete text
  function $traverseAndDelete(
    currentNode: LexicalNode,
  ): boolean /* true if deletion is complete */ {
    if (remainingToDelete <= 0) return true;

    if ($isTextNode(currentNode)) {
      const textLength = currentNode.getTextContentSize();
      // Check if the current text node is where the deletion should start or continue
      if (targetIndex < charWalkerOffset + textLength) {
        const offsetInNode = Math.max(0, targetIndex - charWalkerOffset);
        const deletableCharsInNode = textLength - offsetInNode;
        const numCharsToDeleteFromThisNode = Math.min(remainingToDelete, deletableCharsInNode);

        if (numCharsToDeleteFromThisNode > 0) {
          currentNode.spliceText(offsetInNode, numCharsToDeleteFromThisNode, "");
          logger?.debug(
            `Deleted ${numCharsToDeleteFromThisNode} chars from TextNode (key: ${currentNode.getKey()}) ` +
              `at nodeOffset ${offsetInNode}. Original targetIndex: ${targetIndex}, current charWalkerOffset: ${charWalkerOffset}.`,
          );
          remainingToDelete -= numCharsToDeleteFromThisNode;
        }
      }
      charWalkerOffset += textLength;
    } else if ($isElementNode(currentNode)) {
      const children = currentNode.getChildren();
      for (const child of children) {
        if (remainingToDelete <= 0) break;
        if ($traverseAndDelete(child)) {
          // If deletion completed in a child, propagate true
          if (remainingToDelete <= 0) return true;
        }
      }
    }
    // Other node types (LineBreakNode, DecoratorNode, Embeds) might need specific length handling for charWalkerOffset.

    return remainingToDelete <= 0; // Return true if deletion is complete
  }

  $traverseAndDelete(root);

  if (remainingToDelete > 0) {
    logger?.warn(
      `Delete operation could not remove all requested characters. ` +
        `Remaining to delete: ${remainingToDelete}. Original targetIndex: ${targetIndex}, count: ${count}. Final charWalkerOffset: ${charWalkerOffset}`,
    );
  }
}

function $insertStringAtCurrentIndex(
  targetIndex: number,
  textToInsert: string,
  logger?: LoggerBasic,
) {
  // TODO: Implement proper indexed insertion.
  // For now, this uses a simplified logic that primarily works for index 0 or appends.
  // This will need to be made more robust to handle arbitrary targetIndex values correctly.
  logger?.debug(
    `$insertStringAtCurrentIndex called with index ${targetIndex}, text "${textToInsert}". Using fallback append logic.`,
  );
  if (textToInsert.length <= 0) return;

  const root = $getRoot();
  const textNode = $createTextNode(textToInsert);
  let targetParaNode: ParaNode;

  if (root.isEmpty()) {
    // If the root is completely empty, create a new ParaNode and append it.
    targetParaNode = $createParaNode();
    root.append(targetParaNode);
  } else {
    // Simplified: try to append to the last child if it's a ParaNode, otherwise create a new one.
    // This does not correctly handle insertion at a specific `targetIndex` other than effectively the end.
    const lastChild = root.getLastChild();
    if ($isParaNode(lastChild)) {
      // If the last child is a ParaNode, use it.
      targetParaNode = lastChild;
    } else {
      // Otherwise, create a new ParaNode and append it.
      targetParaNode = $createParaNode();
      root.append(targetParaNode);
    }
  }
  targetParaNode.append(textNode);
}
