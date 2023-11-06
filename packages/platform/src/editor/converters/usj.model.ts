/**
 * Unified Scripture JSON (USJ) - The JSON variant of USFM and USX data models.
 * These types follow this schema:
 * @see https://github.com/usfm-bible/tcdocs/blob/usj/grammar/usj.js
 */

/** The USJ spec type */
export const USJ_TYPE = "USJ";
/** The USJ spec version */
export const USJ_VERSION = "0.0.1-alpha.2";

/** Single piece of Scripture content */
export type MarkerContent = string | MarkerObject;

/** A Scripture Marker and its contents */
export type MarkerObject = {
  /**
   * The kind of node or element this is, corresponding each marker in USFM or each node in USX
   * Its format is `element:style`
   * @example `para:p`, `verse:v`, `char:nd`
   */
  type: string;
  /** This marker's contents laid out in order */
  content?: MarkerContent[];
  /** Indicates the Book-chapter-verse value in the paragraph based structure */
  sid?: string;
  /** Chapter number or verse number */
  number?: string;
  /** The 3-letter book code in ID element */
  code?: BookCode;
  /** Alternate chapter number or verse number */
  altnumber?: string;
  /** Published character of chapter or verse */
  pubnumber?: string;
  /** Caller character for footnotes and cross-refs */
  caller?: string;
  /** Alignment of table cells */
  align?: string;
  /** Category of extended study bible sections */
  category?: string;
};

/** Scripture data represented in JSON format. Data compatible transformation from USX/USFM */
export type Usj = {
  /** The USJ spec type */
  type: typeof USJ_TYPE;
  /** The USJ spec version */
  version: typeof USJ_VERSION;
  /** The JSON representation of scripture contents from USFM/USX */
  content: MarkerContent[];
};

/** 3-letter Scripture book code */
export type BookCode =
  // Old Testament
  | "GEN"
  | "EXO"
  | "LEV"
  | "NUM"
  | "DEU"
  | "JOS"
  | "JDG"
  | "RUT"
  | "1SA"
  | "2SA"
  | "1KI"
  | "2KI"
  | "1CH"
  | "2CH"
  | "EZR"
  | "NEH"
  | "EST"
  | "JOB"
  | "PSA"
  | "PRO"
  | "ECC"
  | "SNG"
  | "ISA"
  | "JER"
  | "LAM"
  | "EZK"
  | "DAN"
  | "HOS"
  | "JOL"
  | "AMO"
  | "OBA"
  | "JON"
  | "MIC"
  | "NAM"
  | "HAB"
  | "ZEP"
  | "HAG"
  | "ZEC"
  | "MAL"
  // New Testament
  | "MAT"
  | "MRK"
  | "LUK"
  | "JHN"
  | "ACT"
  | "ROM"
  | "1CO"
  | "2CO"
  | "GAL"
  | "EPH"
  | "PHP"
  | "COL"
  | "1TH"
  | "2TH"
  | "1TI"
  | "2TI"
  | "TIT"
  | "PHM"
  | "HEB"
  | "JAS"
  | "1PE"
  | "2PE"
  | "1JN"
  | "2JN"
  | "3JN"
  | "JUD"
  | "REV"
  // Deuterocanon
  | "TOB"
  | "JDT"
  | "ESG"
  | "WIS"
  | "SIR"
  | "BAR"
  | "LJE"
  | "S3Y"
  | "SUS"
  | "BEL"
  | "1MA"
  | "2MA"
  | "3MA"
  | "4MA"
  | "1ES"
  | "2ES"
  | "MAN"
  | "PS2"
  | "ODA"
  | "PSS"
  | "EZA"
  | "5EZ"
  | "6EZ"
  | "DAG"
  | "PS3"
  | "2BA"
  | "LBA"
  | "JUB"
  | "ENO"
  | "1MQ"
  | "2MQ"
  | "3MQ"
  | "REP"
  | "4BA"
  | "LAO"
  // Non scripture
  | "FRT"
  | "BAK"
  | "OTH"
  | "INT"
  | "CNC"
  | "GLO"
  | "TDX"
  | "NDX"
  | "XXA"
  | "XXB"
  | "XXC"
  | "XXD"
  | "XXE"
  | "XXF"
  | "XXG";
