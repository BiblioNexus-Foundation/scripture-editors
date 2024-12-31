import { LexicalMapCreator } from "../core/lexicalToUsj";
import { SerializedLexicalNode, SerializedTextNode } from "lexical";
import { UsjNode, UsjDocument, UsjParaContent, UsjCharType, UsjRow } from "../core/usj";
// import { Output } from "../core/usjToLexical";
import { ExtractedAlignments } from "./usjToLexicalMap";

export const LexicalNodeGetters = {
  getLexicalNodeFromRelativePath(
    relativePath: number[],
    initialNode: SerializedLexicalNode,
  ): SerializedLexicalNode {
    return relativePath.reduce((acc, path) => {
      if (!("children" in acc) || !acc.children) {
        return acc;
      }

      if (!Array.isArray(acc.children)) {
        return acc;
      }

      const children = acc.children;
      if (path < 0 || path >= children.length) {
        return acc;
      }

      return children[path];
    }, initialNode);
  },

  createSiblingPath(pathToCurrentNode: number[], offset: number): number[] {
    const parentPath = pathToCurrentNode.slice(0, -1);
    const currentIndex = pathToCurrentNode[pathToCurrentNode.length - 1];
    return [...parentPath, currentIndex + offset];
  },

  getUsjNodeNextSiblingFromPath(
    pathToCurrentNode: number[],
    initialNode: SerializedLexicalNode,
  ): SerializedLexicalNode {
    const nextSiblingPath = this.createSiblingPath(pathToCurrentNode, 1);
    return this.getLexicalNodeFromRelativePath(nextSiblingPath, initialNode);
  },

  getPreviousUsjNodeSiblingFromPath(
    pathToCurrentNode: number[],
    initialNode: SerializedLexicalNode,
  ): SerializedLexicalNode {
    const previousSiblingPath = this.createSiblingPath(pathToCurrentNode, -1);
    return this.getLexicalNodeFromRelativePath(previousSiblingPath, initialNode);
  },

  getUsjNodeParentFromPath(
    pathToCurrentNode: number[],
    initialNode: SerializedLexicalNode,
  ): SerializedLexicalNode {
    const parentPath = pathToCurrentNode.slice(0, -1);
    return this.getLexicalNodeFromRelativePath(parentPath, initialNode);
  },
};

export const createLexicalMap: (props?: {
  extractedAlignment?: ExtractedAlignments;
  verseTextMap?: { [chapter: string]: { [verse: string]: string } };
}) => LexicalMapCreator = () => {
  const workspace: {
    book: string;
    chapter: string | null;
    verse: string | null;
    previousVerse: string | null;
    previousChapter: string | null;
    isCanonical: boolean;
    lastTextObject: SerializedTextNode | null;
    currentOccurrences: Record<string, number>;
    verseWordsOccurrences: Record<string, number>;
    unalignedWords: Record<string, number>;
  } = {
    book: "",
    chapter: "0",
    verse: "0",
    previousVerse: null,
    previousChapter: null,
    isCanonical: false,
    currentOccurrences: {},
    verseWordsOccurrences: {},
    lastTextObject: null,
    unalignedWords: {},
  };
  return () => {
    // const output = _output as unknown as OutputWithMissingAlignments;
    return {
      default: ({ node, children }) => {
        console.error(`No transformation found for type:`, node);
        if (
          "attributes" in node &&
          node.attributes &&
          node.attributes["data-type"] === "caller" &&
          typeof children?.[0] === "string"
        ) {
          return children[0];
        }
        return {
          type: "para",
          marker: "p",
          content: [`unsupported Lexical node: \n${JSON.stringify(node, null, 2)}`],
        };
      },
      root: ({ children }) => {
        return {
          type: "USJ",
          version: "0.2.1",
          content: children ?? ([] as UsjNode[]),
        } as UsjDocument;
      },
      text: ({ node }) => {
        const text = (node as SerializedTextNode).text;
        if (!workspace.chapter || !workspace.verse) {
          return text;
        }

        return text;
      },
      para: ({ node, children }) => {
        const attributes =
          (node as SerializedLexicalNode & { attributes?: Record<string, string> }).attributes ??
          {};
        const { marker, ...props } = extractDataAttributes(attributes);

        return {
          type: "para",
          marker: marker || "p",
          ...props,
          ...(children?.length ? { content: children as UsjParaContent[] } : undefined),
        };
      },
      book: ({ node, children }) => {
        const attributes =
          (node as SerializedLexicalNode & { attributes?: Record<string, string> }).attributes ??
          {};
        const code = attributes["data-code"];
        workspace.book = code;
        const props = extractDataAttributes(attributes, ["code", "marker"]);

        return {
          type: "book",
          code,
          marker: "id",
          ...props,
          content: children as string[],
        };
      },
      chapter: ({ node, children }) => {
        const attributes =
          (node as SerializedLexicalNode & { attributes?: Record<string, string> }).attributes ??
          {};
        const { marker, ...props } = extractDataAttributes(attributes, ["number", "sid"]);

        const number = typeof children?.[0] === "string" ? children[0] : "0";
        workspace.chapter = number;
        workspace.verse = "0";

        return {
          type: "chapter",
          marker: (marker as "c" | undefined) || "c",
          number,
          sid: `${workspace.book} ${number}`,
          ...props,
        };
      },
      verse: ({ node, children }) => {
        const attributes =
          (node as SerializedLexicalNode & { attributes?: Record<string, string> }).attributes ??
          {};
        const { marker, ...props } = extractDataAttributes(attributes, ["number", "sid"]);
        const number = typeof children?.[0] === "string" ? children[0] : "0";
        workspace.verse = number;
        return {
          type: "verse",
          marker: marker || "v",
          number,
          sid: `${workspace.book} ${workspace.chapter}:${number}`,
          ...props,
        };
      },
      note: ({ node, children, metadata: { relativePath, initialNode } }) => {
        const attributes =
          (node as SerializedLexicalNode & { attributes?: Record<string, string> }).attributes ??
          {};

        let caller = "+";

        if (initialNode) {
          const currentNode = LexicalNodeGetters.getLexicalNodeFromRelativePath(
            relativePath,
            initialNode,
          );
          if (
            currentNode &&
            "children" in currentNode &&
            Array.isArray(currentNode.children) &&
            currentNode.children?.[0]
          ) {
            caller = currentNode.children[0]?.children?.[0]?.text ?? "+";
          }
        }

        const { marker, ...props } = extractDataAttributes(attributes, ["caller"]);

        return {
          type: "note",
          caller,
          marker: marker || "f",
          ...props,
          content: children as UsjParaContent[],
        };
      },
      ms: ({ node, children }) => {
        const attributes =
          (node as SerializedLexicalNode & { attributes?: Record<string, string> }).attributes ??
          {};
        const { marker, ...props } = extractDataAttributes(attributes);

        return {
          type: "ms",
          marker: marker,
          ...props,
          content: children as UsjParaContent[],
        };
      },
      caller: () => {
        return "";
      },
      char: ({ node, children }) => {
        const attributes =
          (node as SerializedLexicalNode & { attributes?: Record<string, string> }).attributes ??
          {};
        const { marker, ...props } = extractDataAttributes(attributes);

        return {
          type: "char",
          marker: marker as UsjCharType,
          ...props,
          content: children as UsjParaContent[],
        };
      },
      table: ({ node, children }) => {
        const attributes =
          (node as SerializedLexicalNode & { attributes?: Record<string, string> }).attributes ??
          {};
        const props = extractDataAttributes(attributes);

        return {
          type: "table",
          ...props,
          content: children as UsjRow[],
        };
      },
    };
  };
};

function extractDataAttributes(
  attributes: Record<string, string> = {},
  skipKeys: string[] = [],
): Record<string, string> {
  return Object.entries(attributes).reduce(
    (acc, [key, value]) => {
      if (key.startsWith("data-") && !skipKeys.includes(key.replace("data-", ""))) {
        acc[key.replace("data-", "")] = value;
      }
      return acc;
    },
    {} as Record<string, string>,
  );
}
