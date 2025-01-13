import { NonWhitespaceString, SingleCharString } from "./converters/usj/core/usj";

export function assertBookCode(code: string): void {
  if (!/^[0-6A-Z]{3}$/.test(code)) {
    throw new Error(`Invalid book code: ${code}`);
  }
}

export function assertChapterNumber(num: string): void {
  if (!/^[1-9][0-9]{0,2}(-[1-9][0-9]{0,2})?$/.test(num)) {
    throw new Error(`Invalid chapter number: ${num}`);
  }
}

export function assertVerseNumber(num: string): void {
  if (!/^[1-9][0-9]{0,2}(-[1-9][0-9]{0,2})?$/.test(num)) {
    throw new Error(`Invalid verse number: ${num}`);
  }
}

export function assertSid(sid: string): void {
  if (!/^[0-6A-Z]{3}( [1-9][0-9]{0,2}(:[1-9][0-9]{0,2}(-[1-9][0-9]{0,2})?)?)?$/.test(sid)) {
    throw new Error(`Invalid sid: ${sid}`);
  }
}

export function assertMarker(marker: string): void {
  if (!/^[^ \t\r\n]+$/.test(marker)) {
    throw new Error(`Invalid marker: ${marker}`);
  }
}

export function createBookCode(code: string): string {
  assertBookCode(code);
  return code;
}

export function createChapterNumber(num: string): string {
  assertChapterNumber(num);
  return num;
}

export function createVerseNumber(num: string): string {
  assertVerseNumber(num);
  return num;
}

export function createSid(sid: string): string {
  assertSid(sid);
  return sid;
}

export function createMarker(marker: string): string {
  assertMarker(marker);
  return marker;
}

export function assertNonWhitespaceString(str: string): asserts str is NonWhitespaceString {
  if (!/^[^ \t\r\n](.*[^ \t\r\n])?$/.test(str)) {
    throw new Error(`Invalid string (must not start/end with whitespace): ${str}`);
  }
}

export function assertSingleCharString(str: string): asserts str is SingleCharString {
  if (!/^[^ \t\n]$/.test(str)) {
    throw new Error(`Invalid string (must be single non-whitespace character): ${str}`);
  }
}

export function createNonWhitespaceString(str: string): NonWhitespaceString {
  assertNonWhitespaceString(str);
  return str as NonWhitespaceString;
}

export function createSingleCharString(str: string): SingleCharString {
  assertSingleCharString(str);
  return str as SingleCharString;
}

export function validateColspan(span: number): void {
  if (span < 1) {
    throw new Error(`Invalid colspan: ${span} (must be >= 1)`);
  }
}
