import { LexicalMapCreator } from "../core/lexicalToUsj";
import { SerializedLexicalNode, SerializedTextNode } from "lexical";
import { UsjNode, UsjDocument, UsjParaContent, UsjCharType, UsjRow } from "../core/usj";
// import { Output } from "../core/usjToLexical";
import { ExtractedAlignments } from "./usjToLexicalMap";

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
      note: ({ node, children }) => {
        const attributes =
          (node as SerializedLexicalNode & { attributes?: Record<string, string> }).attributes ??
          {};

        const hasCaller = typeof children?.[0] === "string" && children[0].length === 1;

        const caller = hasCaller ? children[0] : attributes["data-caller"];

        const { marker, ...props } = extractDataAttributes(attributes, ["caller"]);

        return {
          type: "note",
          caller,
          marker: marker || "f",
          ...props,
          content: hasCaller
            ? (children.slice(1) as UsjParaContent[])
            : (children as UsjParaContent[]),
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
