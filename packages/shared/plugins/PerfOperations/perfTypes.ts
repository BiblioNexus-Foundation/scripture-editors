export type PerfDocument = DocumentStructure & PerfDocumentConstraint;
/**
 * Hooks, ie typed labels that may be used to link documents
 */
export type HookStructure = [
  (
    | ("bcv_ref" | "book_ref")
    | {
        [k: string]: unknown;
      }
    | {
        [k: string]: unknown;
      }
  ) &
    string,
  (
    | "label"
    | {
        [k: string]: unknown;
      }
  ) &
    string,
][];
export type PerfContentElementConstraint = {
  content?: (string | PerfContentElementConstraint)[];
  meta_content?: (string | PerfContentElementConstraint)[];
  [k: string]: unknown;
} & {
  [k: string]: unknown;
} & {
  [k: string]: unknown;
} & {
  [k: string]: unknown;
} & {
  [k: string]: unknown;
} & {
  [k: string]: unknown;
};

/**
 * A document, typically corresponding to a single USFM or USX book
 */
export interface DocumentStructure {
  schema: {
    /**
     * The basic 'shape' of the content
     */
    structure: "flat" | "nested";
    /**
     * the semantic version of the structure schema
     */
    structure_version: string;
    constraints: {
      name: "perf" | "sofria";
      /**
       * the semantic version of the constraint schema
       */
      version: string;
    }[];
  };
  /**
   * Metadata describing the document and the translation it belongs to
   */
  metadata: {
    /**
     * Metadata concerning the translation to which the document belongs
     */
    translation?:
      | {
          /**
           * Tags attached to the translation
           */
          tags?: string[];
          /**
           * Key/value properties attached to the translation
           */
          properties?: {
            [k: string]: string;
          };
          /**
           * Proskomma selectors for the translation that, together, provide a primary key in the translation store
           */
          selectors?: {
            [k: string]: string;
          };
        }
      | { [k: string]: string };
    /**
     * Metadata concerning the document itself
     */
    document?:
      | {
          /**
           * Tags attached to the document
           */
          tags?: string[];
          /**
           * Key/value properties attached to the document
           */
          properties?: {
            [k: string]: string;
          };
          chapters?: string;
        }
      | { [k: string]: string };
  };
  hooks?: HookStructure;
  sequences?: {
    [k: string]: SequenceStructure;
  };
  sequence?: SequenceStructure;
  main_sequence_id?: string;
}
/**
 * A sequence contains a 'flow' of one or more blocks
 */
export interface SequenceStructure {
  /**
   * The type of sequence
   */
  type: string;
  /**
   * An optional field to provide some kind of printable label
   */
  preview_text?: string;
  /**
   * The blocks that, together, represent the 'flow' of the sequence
   */
  blocks?: BlockStructure[];
  hooks?: HookStructure;
}
/**
 * A block, which represents either a paragraph of text or a graft
 */
export interface BlockStructure {
  /**
   * The type of block
   */
  type: "paragraph" | "row" | "graft";
  /**
   * A type-specific subtype
   */
  subtype?: string;
  /**
   * The id of the sequence containing graft content
   */
  target?: string;
  sequence?: SequenceStructure;
  /**
   * An optional field to provide some kind of printable label for a graft
   */
  preview_text?: string;
  /**
   * If present and true, is interpreted as a request for the server to create a new graft
   */
  new?: boolean;
  /**
   * An object containing USFM attributes or subtype-specific additional information (such as the number of a verse or chapter). The value may be a boolean, a string or an array of strings
   */
  atts?: {
    [k: string]: string[] | string | boolean;
  };
  /**
   * The content of the block
   */
  content?: (string | ContentElementStructure)[];
  hooks?: HookStructure;
}

/**
 * A content element, ie some form of (possibly nested) markup
 */
export interface ContentElementStructure {
  /**
   * The type of element
   */
  type: "mark" | "wrapper" | "start_milestone" | "end_milestone" | "graft";
  /**
   * The subtype of the element, which is context-dependent
   */
  subtype?: string;
  /**
   * An object containing USFM attributes or subtype-specific additional information (such as the number of a verse or chapter). The value may be a boolean, a string or an array of strings
   */
  atts?: {
    [k: string]: string[] | string | boolean | number;
  };
  /**
   * The id of the sequence containing graft content
   */
  target?: string;
  sequence?: SequenceStructure;
  /**
   * An optional field to provide some kind of printable label for a graft
   */
  preview_text?: string;
  /**
   * If present and true, is interpreted as a request for the server to create a new graft
   */
  new?: boolean;
  /**
   * Nested content within the content element
   */
  content?: (string | ContentElementStructure)[];
  /**
   * Non-Scripture content related to the content element, such as checking data or related resources
   */
  meta_content?: (string | ContentElementStructure)[];
  hooks?: HookStructure;
}

export interface PerfDocumentConstraint {
  hooks?: unknown[];
  sequences?: {
    [k: string]: PerfSequenceConstraint;
  };
  [k: string]: unknown;
}
export interface PerfSequenceConstraint {
  type?:
    | "main"
    | "introduction"
    | "intro_title"
    | "intro_end_title"
    | "title"
    | "end_title"
    | "heading"
    | "remark"
    | "sidebar"
    | "table"
    | "tree"
    | "kv"
    | "footnote"
    | "note_caller"
    | "xref"
    | "pub_number"
    | "alt_number"
    | "esb_cat"
    | "fig"
    | "temp";
  blocks?: PerfBlockConstraint[];
  [k: string]: unknown;
}
export interface PerfBlockConstraint {
  type?: "paragraph" | "graft" | "row" | "node" | "lookup";
  content?: (string | PerfContentElementConstraint)[];
  meta_content?: (string | PerfContentElementConstraint)[];
  [k: string]: unknown;
}
