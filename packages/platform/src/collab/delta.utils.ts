import {
  OTEmbedChapter,
  OTEmbedVerse,
  OTEmbedMilestone,
  OT_CHAPTER_PROPS,
  OT_VERSE_PROPS,
  OT_MILESTONE_PROPS,
} from "./rich-text-ot.model";
import { $getRoot, $createTextNode, $isElementNode, $isTextNode, LexicalNode } from "lexical";
import { Op } from "quill-delta";
import { $createImmutableVerseNode } from "shared-react/nodes/usj/ImmutableVerseNode";
import { $isSomeVerseNode } from "shared-react/nodes/usj/node-react.utils";
import { ViewOptions } from "shared-react/views/view-options.utils";
import { LoggerBasic } from "shared/adaptors/logger-basic.model";
import { $isUnknownNode } from "shared/nodes/features/UnknownNode";
import { $createChapterNode } from "shared/nodes/usj/ChapterNode";
import { $isCharNode } from "shared/nodes/usj/CharNode";
import { $createImmutableChapterNode } from "shared/nodes/usj/ImmutableChapterNode";
import { $createMilestoneNode, $isMilestoneNode } from "shared/nodes/usj/MilestoneNode";
import {
  $isSomeChapterNode,
  getUnknownAttributes,
  getVisibleOpenMarkerText,
} from "shared/nodes/usj/node.utils";
import { $isNoteNode } from "shared/nodes/usj/NoteNode";
import { $createParaNode, $isParaNode } from "shared/nodes/usj/ParaNode";
import { $createVerseNode } from "shared/nodes/usj/VerseNode";

/**
 * Apply Operational Transform rich-text updates to the editor.
 * @param ops - Operations array.
 * @param viewOptions - View options of the editor.
 * @param logger - Logger to use, if any.
 *
 * @see https://github.com/ottypes/rich-text
 */
export function $applyUpdate(ops: Op[], viewOptions: ViewOptions, logger?: LoggerBasic) {
  /** Tracks the current position in the OT document */
  let currentIndex = 0;
  ops.forEach((op) => {
    if ("retain" in op) {
      if (typeof op.retain !== "number" || op.retain < 0) {
        logger?.error(`Invalid retain operation: ${JSON.stringify(op)}`);
        return;
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
      // Delete operations do not advance the currentIndex in the OT Delta model
    } else if ("insert" in op) {
      if (typeof op.insert === "string") {
        logger?.debug(`Insert: '${op.insert}'`);
        $insertTextAtCurrentIndex(currentIndex, op.insert, logger);
        currentIndex += op.insert.length;
      } else if (typeof op.insert === "object" && op.insert !== null) {
        logger?.debug(`Insert embed: ${JSON.stringify(op.insert)}`);
        if ($insertEmbedAtCurrentIndex(currentIndex, op.insert, viewOptions, logger)) {
          currentIndex += 1;
        } else {
          // If embed insertion fails, currentIndex is not advanced to prevent desync.
          logger?.error(
            `Failed to process insert embed operation: ${JSON.stringify(op.insert)} at index ${currentIndex}. Document may be inconsistent.`,
          );
        }
      } else {
        logger?.error(`Insert of unknown type: ${JSON.stringify(op.insert)}`);
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
    } else if (
      $isSomeChapterNode(currentNode) ||
      $isSomeVerseNode(currentNode) ||
      $isMilestoneNode(currentNode)
    ) {
      charWalkerOffset += 1;
    } else if ($isElementNode(currentNode)) {
      let elementEmbedLength = 0;
      // Determine if this element node is treated as an embed with a specific length
      // in the Delta model.
      if (
        $isParaNode(currentNode) ||
        $isCharNode(currentNode) ||
        $isNoteNode(currentNode) ||
        $isUnknownNode(currentNode)
      ) {
        elementEmbedLength = 1; // Assume these embeds have a Delta length of 1
      }

      if (elementEmbedLength > 0) {
        // If the deletion target is within this embed itself, this function (for text deletion)
        // might not be the right place to handle it. For now, we assume deletion targets text
        // that appears after such embeds.
        // We advance charWalkerOffset past this embed.
        charWalkerOffset += elementEmbedLength;
      }

      const children = currentNode.getChildren();
      for (const child of children) {
        if (remainingToDelete <= 0) break;
        if ($traverseAndDelete(child)) {
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

function $insertTextAtCurrentIndex(
  targetIndex: number,
  textToInsert: string,
  logger?: LoggerBasic,
) {
  if (textToInsert.length <= 0) {
    logger?.debug("Attempted to insert empty string. No action taken.");
    return;
  }

  const root = $getRoot();
  let charWalkerOffset = 0;
  let insertionPointFound = false;

  // Inner recursive function to find and insert text
  function $findAndInsertRecursive(
    currentNode: LexicalNode,
  ): boolean /* true if insertion is done */ {
    if (insertionPointFound) return true;

    if ($isTextNode(currentNode)) {
      const textLength = currentNode.getTextContentSize();
      // Check if the targetIndex is within this text node's span
      if (targetIndex >= charWalkerOffset && targetIndex <= charWalkerOffset + textLength) {
        const offsetInNode = targetIndex - charWalkerOffset;
        currentNode.spliceText(offsetInNode, 0, textToInsert);
        logger?.debug(
          `Inserted "${textToInsert}" in TextNode (key: ${currentNode.getKey()}) at nodeOffset ${offsetInNode}. ` +
            `Original targetIndex: ${targetIndex}, charWalkerOffset at node start: ${charWalkerOffset}.`,
        );
        insertionPointFound = true;
        return true;
      }
      charWalkerOffset += textLength;
    } else if (
      $isSomeChapterNode(currentNode) ||
      $isSomeVerseNode(currentNode) ||
      $isMilestoneNode(currentNode)
    ) {
      charWalkerOffset += 1;
    } else if ($isElementNode(currentNode)) {
      let elementEmbedLength = 0;
      let isParaLikeContainer = false; // Can this element directly contain the inserted text?

      if ($isParaNode(currentNode)) {
        elementEmbedLength = 1;
        isParaLikeContainer = true;
      } else if (
        $isCharNode(currentNode) ||
        $isNoteNode(currentNode) ||
        $isUnknownNode(currentNode)
      ) {
        // These are single-character embeds, not containers for arbitrary text insertion within them.
        elementEmbedLength = 1;
      }
      // ImpliedParaNode or other generic ElementNodes (like RootNode) don't have their own embed length.

      const offsetAtElementStart = charWalkerOffset;

      // Case 1: targetIndex is exactly at the start of a ParaNode-like embed.
      // This means insert text at the beginning of this container's content.
      if (isParaLikeContainer && targetIndex === offsetAtElementStart) {
        const firstChild = currentNode.getFirstChild();
        if ($isTextNode(firstChild)) {
          firstChild.spliceText(0, 0, textToInsert);
        } else {
          const newTextNode = $createTextNode(textToInsert);
          // If firstChild exists, insert before it. Otherwise (ParaNode is empty), append.
          if (firstChild) {
            firstChild.insertBefore(newTextNode);
          } else {
            currentNode.append(newTextNode);
          }
        }
        logger?.debug(
          `Inserted "${textToInsert}" at beginning of ParaNode-like container (key: ${currentNode.getKey()}). ` +
            `targetIndex: ${targetIndex}, charWalkerOffset at container start: ${offsetAtElementStart}.`,
        );
        insertionPointFound = true;
        return true;
      }

      // Advance charWalkerOffset for the element's own embed length (if any)
      if (elementEmbedLength > 0) {
        charWalkerOffset += elementEmbedLength;
      }

      // Recurse into children
      const children = currentNode.getChildren();
      for (const child of children) {
        if ($findAndInsertRecursive(child)) return true; // Propagate if insertion happened
        if (insertionPointFound) break;
      }

      // Case 2: targetIndex is exactly at the end of a ParaNode-like container's content area.
      // charWalkerOffset here is *after* this element's embedLength and all its children have been processed.
      if (isParaLikeContainer && targetIndex === charWalkerOffset) {
        const newTextNode = $createTextNode(textToInsert);
        currentNode.append(newTextNode);
        logger?.debug(
          `Appended "${textToInsert}" to end of ParaNode-like container (key: ${currentNode.getKey()}). ` +
            `targetIndex: ${targetIndex}, charWalkerOffset after container content: ${charWalkerOffset}.`,
        );
        insertionPointFound = true;
        return true;
      }
    }
    // Other node types (e.g., specific DecoratorNodes not covered) might need length handling if they affect charWalkerOffset.
    return insertionPointFound;
  }

  $findAndInsertRecursive(root);

  // Fallback: If insertion point wasn't found by traversal (e.g., empty doc or append at very end of document)
  if (!insertionPointFound && targetIndex === charWalkerOffset) {
    logger?.debug(
      `Insertion point matches end of document (targetIndex: ${targetIndex}, final charWalkerOffset: ${charWalkerOffset}). Appending text to new ParaNode.`,
    );
    const newTextNode = $createTextNode(textToInsert);
    const newParaNode = $createParaNode().append(newTextNode);
    root.append(newParaNode);
    insertionPointFound = true;
  }

  if (!insertionPointFound) {
    logger?.warn(
      `$insertStringAtCurrentIndex: Could not find insertion point for text "${textToInsert}" at targetIndex ${targetIndex}. ` +
        `Final charWalkerOffset: ${charWalkerOffset}. Text not inserted.`,
    );
  }
}

/**
 * Inserts an embed (LexicalNode) at a given flat index in the document.
 * @param targetIndex - The index in the document's flat representation where the embed
 *   should be inserted.
 * @param embedObject - The object defining the embed, e.g., `{ chapter: { ... } }`.
 * @param viewOptions - View options of the editor.
 * @param logger - Logger to use, if any.
 * @returns `true` if the embed was successfully inserted, `false` otherwise.
 */
function $insertEmbedAtCurrentIndex(
  targetIndex: number,
  embedObject: object,
  viewOptions: ViewOptions,
  logger?: LoggerBasic,
): boolean {
  let newNodeToInsert: LexicalNode | undefined;

  // Determine the LexicalNode to create based on the embedObject structure
  if (isEmbedOfType("chapter", embedObject)) {
    newNodeToInsert = $insertChapter(embedObject.chapter as OTEmbedChapter, viewOptions);
  } else if (isEmbedOfType("verse", embedObject)) {
    newNodeToInsert = $insertVerse(embedObject.verse as OTEmbedVerse, viewOptions);
  } else if (isEmbedOfType("ms", embedObject)) {
    newNodeToInsert = $insertMilestone(embedObject.ms as OTEmbedMilestone);
  }
  // TODO: Add other embed types here as needed (e.g., BookNode, CharNode, NoteNode, ParaNode, ImmutableUnmatchedNode)
  // else if ('char' in embedObject && ...) { newNodeToInsert = $createCharNode(...); }

  if (!newNodeToInsert) {
    logger?.error(`Cannot create LexicalNode for embed object: ${JSON.stringify(embedObject)}`);
    return false;
  }

  const root = $getRoot();
  let currentOffset = 0;
  let wasInserted = false;

  // Recursive function to traverse the document and find the insertion point.
  function $traverseAndInsertRecursive(parentElement: LexicalNode): boolean {
    if (wasInserted) return true;

    // Handle insertion at the beginning of the document or into an empty root.
    if (parentElement === root && targetIndex === 0 && newNodeToInsert) {
      const firstChild = root.getFirstChild();
      if (!firstChild) {
        // Root is empty
        logger?.debug(
          `Inserting embed into empty root, wrapped in ParaNode. targetIndex: ${targetIndex}`,
        );
        const para = $createParaNode().append(newNodeToInsert);
        root.append(para);
        wasInserted = true;
        return true;
      }
      // If root is not empty, the loop below will handle inserting before the first child.
    }

    if (!$isElementNode(parentElement)) {
      // Should not happen if called correctly, as we only recurse on ElementNodes.
      return false;
    }

    const children = parentElement.getChildren();
    for (const child of children) {
      // Case 1: Insert *before* the current child
      if (targetIndex === currentOffset && newNodeToInsert) {
        child.insertBefore(newNodeToInsert);
        logger?.debug(
          `Inserted embed ${newNodeToInsert.getType()} before child ${child.getType()} (key: ${child.getKey()}) in ${parentElement.getType()} (key: ${parentElement.getKey()}). targetIndex: ${targetIndex}, currentOffset: ${currentOffset}`,
        );
        wasInserted = true;
        return true;
      }

      // Case 2: Process current `child`
      if ($isTextNode(child)) {
        const textLength = child.getTextContentSize();
        // Case 2a: Insert *within* this TextNode
        if (
          newNodeToInsert &&
          targetIndex > currentOffset &&
          targetIndex < currentOffset + textLength
        ) {
          const splitOffset = targetIndex - currentOffset;
          const splitNodes = child.splitText(splitOffset);
          splitNodes[0].insertAfter(newNodeToInsert);
          logger?.debug(
            `Inserted embed ${newNodeToInsert.getType()} by splitting TextNode at offset ${splitOffset}. targetIndex: ${targetIndex}, currentOffset at node start: ${currentOffset}`,
          );
          wasInserted = true;
          return true;
        }
        // If not inserted within, advance offset by full length of text node
        currentOffset += textLength;
      } else if ($isSomeChapterNode(child) || $isSomeVerseNode(child) || $isMilestoneNode(child)) {
        currentOffset += 1;
      } else if ($isElementNode(child)) {
        let childOtLength = 0;
        let isAtomicEmbed = false;

        if ($isCharNode(child) || $isNoteNode(child) || $isUnknownNode(child)) {
          childOtLength = 1;
          isAtomicEmbed = true; // These are generally atomic and don't contain further indexed content for OT
        } else if ($isParaNode(child)) {
          childOtLength = 1; // ParaNode itself counts as 1 for its tag
        }
        // else: ImpliedParaNode, RootNode (parentElement) - their OT length is 0, content is traversed.

        // Advance currentOffset by the OT length of the element itself
        currentOffset += childOtLength;

        // Recurse if it's not an atomic embed (i.e., it's a container like ParaNode or ImpliedParaNode)
        if (!isAtomicEmbed) {
          if ($traverseAndInsertRecursive(child)) return true;
        }
      }
      // Else: other node types (LineBreakNode, DecoratorNode) - assume 0 OT length for now.
    } // End for loop over children

    // After iterating all children of parentElement, if targetIndex matches currentOffset,
    // it means the insertion point is at the end of parentElement's content.
    if (targetIndex === currentOffset && newNodeToInsert && $isElementNode(parentElement)) {
      if (parentElement === root) {
        // Append to root, wrapped in a ParaNode.
        logger?.debug(
          `Appending embed to root, wrapped in ParaNode. targetIndex: ${targetIndex}, currentOffset: ${currentOffset}`,
        );
        const para = $createParaNode().append(newNodeToInsert);
        parentElement.append(para);
      } else if ($isParaNode(parentElement) /* || other suitable containers */) {
        logger?.debug(
          `Appending embed to ${parentElement.getType()} (key: ${parentElement.getKey()}). targetIndex: ${targetIndex}, currentOffset: ${currentOffset}`,
        );
        parentElement.append(newNodeToInsert);
      } else {
        // Fallback for other element types, may need refinement based on desired structure.
        logger?.warn(
          `Appending embed to a generic ElementNode ${parentElement.getType()} (key: ${parentElement.getKey()}) that might not be an ideal container. Review structure if issues arise. targetIndex: ${targetIndex}`,
        );
        parentElement.append(newNodeToInsert);
      }
      wasInserted = true;
      return true;
    }
    return wasInserted;
  }

  $traverseAndInsertRecursive(root);

  if (!wasInserted) {
    logger?.warn(
      `$insertEmbedAtCurrentIndex: Could not find insertion point for embed at targetIndex ${targetIndex}. ` +
        `Final currentOffset: ${currentOffset}. Embed not inserted.`,
    );
  }
  return wasInserted;
}

function $insertChapter(chapterData: OTEmbedChapter, viewOptions: ViewOptions) {
  const { number, sid, altnumber, pubnumber } = chapterData;
  const unknownAttributes = getUnknownAttributes(chapterData, OT_CHAPTER_PROPS);
  let newNodeToInsert: LexicalNode;
  if (viewOptions.markerMode === "editable") {
    newNodeToInsert = $createChapterNode(number, sid, altnumber, pubnumber, unknownAttributes);
  } else {
    const showMarker = viewOptions.markerMode === "visible";
    newNodeToInsert = $createImmutableChapterNode(
      number,
      showMarker,
      sid,
      altnumber,
      pubnumber,
      unknownAttributes,
    );
  }
  return newNodeToInsert;
}

function $insertVerse(verseData: OTEmbedVerse, viewOptions: ViewOptions) {
  const { style, number, sid, altnumber, pubnumber } = verseData;
  const unknownAttributes = getUnknownAttributes(verseData, OT_VERSE_PROPS);
  let newNodeToInsert: LexicalNode;
  if (viewOptions.markerMode === "editable") {
    const text = getVisibleOpenMarkerText(style, number);
    newNodeToInsert = $createVerseNode(number, text, sid, altnumber, pubnumber, unknownAttributes);
  } else {
    const showMarker = viewOptions.markerMode === "visible";
    newNodeToInsert = $createImmutableVerseNode(
      number,
      showMarker,
      sid,
      altnumber,
      pubnumber,
      unknownAttributes,
    );
  }
  return newNodeToInsert;
}

function $insertMilestone(msData: OTEmbedMilestone) {
  const { style, sid, eid } = msData;
  const unknownAttributes = getUnknownAttributes(msData, OT_MILESTONE_PROPS);
  let newNodeToInsert: LexicalNode | undefined;
  if (style) newNodeToInsert = $createMilestoneNode(style, sid, eid, unknownAttributes);
  return newNodeToInsert;
}

/**
 * Type guard to check if an object has a specific property that is a non-null object.
 * @param embedObj The object to check.
 * @param embedType The property key to check for.
 * @returns `true` if `embedObj` has a property `embedType` and `embedObj[embedType]` is a non-null object, `false` otherwise.
 * @template T The type of the object.
 * @template K The type of the property key.
 */
function isEmbedOfType<T extends object, K extends PropertyKey>(
  embedType: K,
  embedObj: T,
): embedObj is T & { [P in K]: object } {
  if (!(embedType in embedObj)) {
    return false;
  }
  // After the 'embedType in embedObj' check, TypeScript knows that 'embedObj' has the property 'embedType'.
  // The type of 'embedObj' is narrowed to 'T & Record<K, unknown>'.
  // So, we can safely access embedObj[embedType], and its type will be 'unknown'.
  const value = (embedObj as T & Record<K, unknown>)[embedType];
  return typeof value === "object" && value !== null;
}
