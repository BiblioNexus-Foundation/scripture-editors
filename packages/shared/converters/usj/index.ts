import { transformUsjToLexical } from "./core/usjToLexical";
import { UsjNode } from "./core/usj";
import { transformLexicalToUsj } from "./core/lexicalToUsj";
import { SerializedRootNode } from "lexical";
import { createUsjMap, ExtractedAlignments } from "./maps/usjToLexicalMap";
import { createLexicalMap as lexicalToUsjMapCreator } from "./maps/lexicalToUsjmap";
import { isSerializedScriptureElementNode } from "../../nodes/scripture/generic/ScriptureElementNode";
import { MetadataBuilder } from "../perf/lexicalToX";
import { lexicalToVerseTextMapCreator } from "./maps/lexicalToVerseTextMap";

/**
 * Types of USJ nodes that do not contain canonical scripture content.
 */
const NON_CANONICAL_TYPES = [
  "book",
  "sidebar",
  "chapter",
  "verse",
  "ms",
  "figure",
  "note",
  "whitespace",
  "table",
  "table:row",
  "table:cell",
];

const HEADER_MARKERS = [
  "ide",
  "h1",
  "h2",
  "h3",
  "h",
  "toc1",
  "toc2",
  "toc3",
  "toca1",
  "toca2",
  "toca3",
  "sts",
  "rem",
];

const TITLE_MARKERS = ["mt1", "mt2", "mt3", "mt4", "mt"];

const INTRODUCTION_MARKERS = [
  "imt1",
  "imt2",
  "imt3",
  "imt4",
  "imte1",
  "imte2",
  "imte",
  "imt",
  "ib",
  "ie",
  "imi",
  "imq",
  "im",
  "io1",
  "io2",
  "io3",
  "io4",
  "iot",
  "io",
  "ipc",
  "ipi",
  "ipq",
  "ipr",
  "ip",
  "iq1",
  "iq2",
  "iq3",
  "iq",
  "is1",
  "is2",
  "is",
  "iex",
  "lit",
];
const INTRODUCTION_LIST_MARKERS = ["ili1", "ili2", "ili"];

const SECTION_MARKERS = [
  "restore",
  "iex",
  "ip",
  "ms1",
  "ms2",
  "ms3",
  "ms",
  "mr",
  "mte1",
  "mte2",
  "mte",
  "r",
  "s1",
  "s2",
  "s3",
  "s4",
  "sr",
  "sp",
  "sd1",
  "sd2",
  "sd3",
  "sd4",
  "sd",
  "s",
  "cl",
  "cd",
];

const NON_CANONICAL_MARKERS = [
  "usfm",
  ...SECTION_MARKERS,
  ...INTRODUCTION_MARKERS,
  ...INTRODUCTION_LIST_MARKERS,
  ...HEADER_MARKERS,
  ...TITLE_MARKERS,
];

/**
 * Converts a USJ (Unified Scripture JSON) node to a serialized Lexical editor state.
 * Handles metadata processing to track canonical vs non-canonical content.
 *
 * @param node - The USJ node to convert
 * @returns A serialized Lexical editor state
 */
export function usjNodeToSerializedLexical(node: UsjNode) {
  return transformUsjToLexical(node, createUsjMap(), ({ node, metadata }) => {
    metadata.isCanonical =
      metadata.isCanonical === false
        ? metadata.isCanonical
        : !NON_CANONICAL_TYPES.includes(node.type);
    metadata.parent = node;
    return metadata;
  });
}

/**
 * Converts a serialized Lexical editor state back to a USJ node.
 * Preserves metadata about canonical vs non-canonical content during conversion.
 *
 * @param node - The serialized Lexical root node to convert
 * @returns A USJ node representation
 */
export function serializedLexicalToUsjNode(
  node: SerializedRootNode,
  extractedAlignment?: ExtractedAlignments,
) {
  const metaDataBuilder: MetadataBuilder = ({ node, metadata }) => {
    if (metadata.isCanonical === undefined) {
      metadata.isCanonical = true;
    }
    if (metadata.isCanonical !== false && isSerializedScriptureElementNode(node)) {
      const type = node.attributes?.["data-type"];
      const marker = node.attributes?.["data-marker"];

      const isTypeCanonical = type ? !NON_CANONICAL_TYPES.includes(type) : true;
      const isMarkerCanonical = marker ? !NON_CANONICAL_MARKERS.includes(marker) : true;
      metadata.isCanonical = isTypeCanonical && isMarkerCanonical;
    }

    metadata.parent = node;

    return metadata;
  };
  if (extractedAlignment) {
    const { verseTextMap } = transformLexicalToUsj(
      node,
      lexicalToVerseTextMapCreator(),
      metaDataBuilder,
    );
    return transformLexicalToUsj(
      node,
      lexicalToUsjMapCreator({
        extractedAlignment: extractedAlignment as ExtractedAlignments,
        verseTextMap: verseTextMap as { [chapter: string]: { [verse: string]: string } },
      }),
      metaDataBuilder,
    );
  }
  return transformLexicalToUsj(node, lexicalToUsjMapCreator(), metaDataBuilder);
}
