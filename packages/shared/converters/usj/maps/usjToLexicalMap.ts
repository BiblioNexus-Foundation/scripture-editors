import { UsjMilestone, UsjNode } from "../core/usj";

import { Attributes } from "../../../nodes/scripture/generic/ScriptureElementNode";
import { UsjChar } from "../core/usj";
import { Output, UsjMapCreator } from "../core/usjToLexical";
import { SerializedLexicalNode, SerializedTextNode } from "lexical";
import { createSerializedRootNode, createSerializedTextNode } from "../../utils";
import { createSerializedBlockNode } from "../../../nodes/scripture/generic/BlockNode";
import { createSerializedInlineNode } from "../../../nodes/scripture/generic/InlineNode";
import XRegExp from "xregexp";

const convertNodePropsToAttributes = (
  nodeProps: Record<string, unknown> | null | undefined,
): Attributes => {
  return Object.entries(nodeProps ?? {}).reduce<Attributes>((acc, [key, value]) => {
    if (value != null) {
      acc[`data-${key}`] = String(value);
    }
    return acc;
  }, {});
};

type UsjNodeOrString = UsjNode | string;

const UsjNodeGetters = {
  getUsjNodeFromRelativePath(
    relativePath: number[],
    initialNode: UsjNodeOrString,
  ): UsjNodeOrString {
    return relativePath.reduce((acc, path) => {
      if (typeof acc === "string") {
        return acc;
      }

      if (!("content" in acc) || !acc.content) {
        return acc;
      }

      const content = acc.content;
      if (path < 0 || path >= content.length) {
        return acc;
      }

      return content[path];
    }, initialNode);
  },

  createSiblingPath(pathToCurrentNode: number[], offset: number): number[] {
    const parentPath = pathToCurrentNode.slice(0, -1);
    const currentIndex = pathToCurrentNode[pathToCurrentNode.length - 1];
    return [...parentPath, currentIndex + offset];
  },

  getUsjNodeNextSiblingFromPath(
    pathToCurrentNode: number[],
    initialNode: UsjNodeOrString,
  ): UsjNodeOrString {
    const nextSiblingPath = this.createSiblingPath(pathToCurrentNode, 1);
    return this.getUsjNodeFromRelativePath(nextSiblingPath, initialNode);
  },

  getPreviousUsjNodeSiblingFromPath(
    pathToCurrentNode: number[],
    initialNode: UsjNodeOrString,
  ): UsjNodeOrString {
    const previousSiblingPath = this.createSiblingPath(pathToCurrentNode, -1);
    return this.getUsjNodeFromRelativePath(previousSiblingPath, initialNode);
  },

  getUsjNodeParentFromPath(
    pathToCurrentNode: number[],
    initialNode: UsjNodeOrString,
  ): UsjNodeOrString {
    const parentPath = pathToCurrentNode.slice(0, -1);
    return this.getUsjNodeFromRelativePath(parentPath, initialNode);
  },
};

export const createUsjMap: () => UsjMapCreator = () => {
  const workspace: {
    book: string;
    chapter: string;
    verse: string;
    lastWord: string;
    pendingAlignmentMarkup: (UsjMilestone | UsjChar)[];
    verseWordsOccurrences: Record<string, number>;
    pendingStartMilestones: UsjMilestone[];
    lastTextObject: SerializedTextNode | null;
  } = {
    book: "",
    chapter: "0",
    verse: "0",
    lastWord: "",
    pendingAlignmentMarkup: [],
    verseWordsOccurrences: {},
    pendingStartMilestones: [],
    lastTextObject: null,
  };

  function $isSerializedTextNode(node: SerializedLexicalNode): node is SerializedTextNode {
    return typeof node === "object" && node !== null && "type" in node && node.type === "text";
  }

  interface OutputWithExtractedAlignment extends Output {
    extractedAlignment: ExtractedAlignments;
  }
  return (_output) => {
    const output = _output as unknown as OutputWithExtractedAlignment;
    return {
      default: ({ nodeProps, metadata }) => {
        console.error(`No transformation found for type: ${nodeProps?.type}`, nodeProps, metadata);
        return createSerializedTextNode(`unsupported USJ node: ${nodeProps?.type}`);
      },
      USJ: ({ convertedContent }) => {
        return createSerializedRootNode(convertedContent || []);
      },
      text: ({ nodeProps, metadata }) => {
        const parent = metadata.parent as UsjNode | null;

        if (parent && "type" in parent && parent.type === "char" && parent.marker === "w") {
          //Start Wrapper Event
          workspace.pendingAlignmentMarkup.push(parent);
        } else {
          const currentOutput = metadata.currentOutput;
          const textNode = createSerializedTextNode(nodeProps.value ?? "");
          if (currentOutput && textNode) {
            //get the latest output node
            const latestOutputNode = currentOutput[currentOutput.length - 1];
            if ($isSerializedTextNode(latestOutputNode)) {
              //merge contiguous text nodes
              latestOutputNode.text = latestOutputNode.text + textNode.text;
              return undefined;
            }
          }
        }

        const words = extractWords(nodeProps.value);

        for (const word of words) {
          processWord(word, workspace, output);
        }

        return createSerializedTextNode(nodeProps.value ?? "");
      },
      para: ({ nodeProps, convertedContent }) => {
        workspace.lastTextObject = null;
        return createSerializedBlockNode({
          children: convertedContent || [],
          attributes: convertNodePropsToAttributes(nodeProps),
        });
      },
      book: ({ nodeProps, convertedContent }) => {
        return createSerializedBlockNode({
          children: convertedContent || [],
          attributes: convertNodePropsToAttributes(nodeProps),
        });
      },
      chapter: ({ nodeProps }) => {
        workspace.chapter = nodeProps.number;
        workspace.verse = "0";
        if (!output.extractedAlignment) {
          output.extractedAlignment = {};
        }
        output.extractedAlignment[nodeProps.number] = {};
        workspace.lastWord = "";

        return createSerializedBlockNode({
          children: [createSerializedTextNode(nodeProps.number)],
          attributes: convertNodePropsToAttributes(nodeProps),
        });
      },
      verse: ({ nodeProps }) => {
        workspace.verse = nodeProps.number;
        workspace.lastTextObject = null;
        if (output.extractedAlignment?.[workspace.chapter])
          output.extractedAlignment[workspace.chapter][nodeProps.number] = {};
        workspace.lastWord = "";
        workspace.verseWordsOccurrences = {};

        return createSerializedInlineNode({
          children: [createSerializedTextNode(nodeProps.number)],
          attributes: convertNodePropsToAttributes(nodeProps),
        });
      },
      note: ({ nodeProps, convertedContent, metadata: { initialNode, relativePath } }) => {
        const { caller, ...atts } = nodeProps;

        let _caller = caller;

        if (!caller && initialNode) {
          const currentNode = UsjNodeGetters.getUsjNodeFromRelativePath(relativePath, initialNode);
          if (
            currentNode &&
            typeof currentNode === "object" &&
            "content" in currentNode &&
            currentNode.content &&
            currentNode.content.length &&
            currentNode.content[0] &&
            typeof currentNode.content[0] === "string"
          ) {
            _caller = currentNode.content[0];
            convertedContent?.shift();
          }
        }
        return createSerializedInlineNode({
          children: [
            createSerializedInlineNode({
              children: [createSerializedTextNode(_caller)],
              attributes: { "data-type": "caller", "data-value": _caller },
            }),
            ...(convertedContent || []),
          ],
          attributes: convertNodePropsToAttributes(atts),
        });
      },
      ms: ({ nodeProps, convertedContent }) => {
        if (["zaln-s", "zaln-e"].includes(nodeProps.marker)) {
          workspace.lastTextObject = null;
          if (nodeProps.marker === "zaln-s") {
            //Should delete marker prop from nodeProps?
            workspace.pendingAlignmentMarkup.push(nodeProps);
            workspace.pendingStartMilestones.push(nodeProps);
          }
          if (nodeProps.marker === "zaln-e") {
            const { chapter, verse, lastWord: word } = workspace;
            const markupData = {
              associatedWord: word,
              occurrenceIndex: workspace.verseWordsOccurrences[word],
              position: "after",
            };
            const record = {
              payload: { ...nodeProps },
              startMilestone: workspace.pendingStartMilestones.shift(),
            };

            const extractedAlignment = output.extractedAlignment[chapter][verse];
            const occurrencesCount = workspace.verseWordsOccurrences[word];
            handleMarkupData(extractedAlignment, markupData, record, occurrencesCount);
          }
          return undefined;
        }
        return createSerializedInlineNode({
          children: convertedContent || [],
          attributes: convertNodePropsToAttributes(nodeProps),
        });
      },
      char: ({ nodeProps, convertedContent, metadata }) => {
        if ("marker" in nodeProps && nodeProps.marker === "w") {
          const textNode = convertedContent?.[0] as SerializedTextNode | undefined;
          const metadataRelativePath = metadata.relativePath;
          if (metadataRelativePath) {
            const { currentOutput, initialNode } = metadata;
            const nextSibling = UsjNodeGetters.getUsjNodeNextSiblingFromPath(
              metadataRelativePath,
              initialNode,
            );

            const shouldAddSpaceAfter = Boolean(
              currentOutput &&
                nextSibling &&
                typeof nextSibling === "object" &&
                nextSibling.type === "char",
            );

            if (shouldAddSpaceAfter && textNode) {
              textNode.text = textNode.text + " ";
            }

            const previousSibling = UsjNodeGetters.getPreviousUsjNodeSiblingFromPath(
              metadataRelativePath,
              initialNode,
            );

            const shouldAddSpaceBefore = Boolean(
              currentOutput &&
                previousSibling &&
                typeof previousSibling === "object" &&
                previousSibling.type === "ms",
            );

            if (shouldAddSpaceBefore && textNode) {
              textNode.text = " " + textNode.text;
            }

            if (currentOutput && textNode) {
              //get the latest output node
              const latestOutputNode = currentOutput[currentOutput.length - 1];
              if ($isSerializedTextNode(latestOutputNode)) {
                //merge contiguous text nodes
                latestOutputNode.text = latestOutputNode.text + textNode.text;
                return undefined;
              }
            }
          }

          return textNode;
        }
        return createSerializedInlineNode({
          children: convertedContent || [],
          attributes: convertNodePropsToAttributes(nodeProps),
        });
      },
      table: ({ nodeProps, convertedContent }) => {
        return createSerializedBlockNode({
          children: convertedContent || [],
          attributes: convertNodePropsToAttributes(nodeProps),
        });
      },
    };
  };
};

export type ExtractedAlignments = { [chapter: string]: { [verse: string]: ExtractedAlignment } };

type ExtractedAlignment = Record<
  string,
  {
    occurrencesCount: number;
    occurrences: {
      [occurrenceIndex: string]: {
        [position: string]: { payload: UsjMilestone | UsjChar; startMilestone?: UsjMilestone }[];
      };
    };
  }
>;

type AlignmentRecord = { payload: UsjMilestone | UsjChar; startMilestone?: UsjMilestone };

type MarkupData = { associatedWord: string; occurrenceIndex: number; position: string };

function handleMarkupData(
  extractedAlignment: ExtractedAlignment,
  markupData: MarkupData,
  record: AlignmentRecord | undefined,
  occurrencesCount: number,
) {
  if (!record) return;
  const { associatedWord, occurrenceIndex, position } = markupData;

  if (!extractedAlignment[associatedWord]) {
    extractedAlignment[associatedWord] = {
      occurrencesCount,
      occurrences: {
        [occurrenceIndex]: {
          [position]: [record],
        },
      },
    };
  } else {
    extractedAlignment[associatedWord].occurrencesCount = occurrencesCount;
    extractedAlignment[associatedWord].occurrences[occurrenceIndex] =
      extractedAlignment[associatedWord].occurrences[occurrenceIndex] || {};
    extractedAlignment[associatedWord].occurrences[occurrenceIndex][position] =
      extractedAlignment[associatedWord].occurrences[occurrenceIndex][position] || [];
    extractedAlignment[associatedWord].occurrences[occurrenceIndex][position].push(record);
  }
}

function extractWords(text: string) {
  const re = XRegExp("([\\p{Letter}\\p{Number}\\p{Mark}\\u2060]{1,127})");
  return XRegExp.match(text, re, "all");
}

function processWord(
  word: string,
  workspace: {
    verseWordsOccurrences: Record<string, number>;
    pendingAlignmentMarkup: (UsjMilestone | UsjChar)[];
    chapter: string;
    verse: string;
    lastWord: string;
  },
  output: { extractedAlignment: ExtractedAlignments },
) {
  updateWordOccurrences(word, workspace);
  processAlignmentMarkup(word, workspace, output);
  workspace.lastWord = word;
}

function updateWordOccurrences(
  word: string,
  workspace: { verseWordsOccurrences: Record<string, number> },
) {
  workspace.verseWordsOccurrences[word] = (workspace.verseWordsOccurrences[word] || 0) + 1;
}

function processAlignmentMarkup(
  word: string,
  workspace:
    | {
        pendingAlignmentMarkup: (UsjMilestone | UsjChar)[];
        chapter: string;
        verse: string;
        verseWordsOccurrences: Record<string, number>;
      }
    | undefined,
  output: { extractedAlignment: ExtractedAlignments },
) {
  while (workspace?.pendingAlignmentMarkup.length) {
    const payload = workspace.pendingAlignmentMarkup.shift();
    const markupData = createMarkupData(word, workspace, "before");
    const record = createAlignmentRecord(payload, word);
    const extractedAlignment = output.extractedAlignment[workspace.chapter][workspace.verse];
    const occurrencesCount = workspace.verseWordsOccurrences[word];

    handleMarkupData(extractedAlignment, markupData, record, occurrencesCount);
  }
}

function createMarkupData(
  word: string,
  workspace: { verseWordsOccurrences: Record<string, number> },
  position: string,
) {
  return {
    associatedWord: word,
    occurrenceIndex: workspace.verseWordsOccurrences[word],
    position,
  };
}

function createAlignmentRecord(payload: UsjMilestone | UsjChar | undefined, word: string) {
  return payload
    ? {
        payload: {
          ...payload,
          ...(payload?.marker === "w" && { content: [word] }),
        },
      }
    : undefined;
}
