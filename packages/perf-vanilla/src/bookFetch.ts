interface BookNames {
  GEN: number;
  EXO: number;
  LEV: number;
  NUM: number;
  DEU: number;
  JOS: number;
  JDG: number;
  RUT: number;
  "1SA": number;
  "2SA": number;
  "1KI": number;
  "2KI": number;
  "1CH": number;
  "2CH": number;
  EZR: number;
  NEH: number;
  EST: number;
  JOB: number;
  PSA: number;
  PRO: number;
  ECC: number;
  SNG: number;
}

const bookNames: BookNames = {
  GEN: 1,
  EXO: 2,
  LEV: 3,
  NUM: 4,
  DEU: 5,
  JOS: 6,
  JDG: 7,
  RUT: 8,
  "1SA": 9,
  "2SA": 10,
  "1KI": 11,
  "2KI": 12,
  "1CH": 13,
  "2CH": 14,
  EZR: 15,
  NEH: 16,
  EST: 17,
  JOB: 18,
  PSA: 19,
  PRO: 20,
  ECC: 21,
  SNG: 22,
};

export async function getBookContents({
  bookId,
  org,
  repo,
}: {
  bookId: keyof BookNames;
  org: string;
  repo: string;
}) {
  let ls;
  try {
    ls = localStorage;
  } catch (e) {
    console.error(e);
  }
  const localKey = `${org}/${repo}/${bookId}`;
  const localUsfm = ls?.getItem(localKey);
  const targetUsfm =
    localUsfm ??
    (await fetch(
      `https://git.door43.org/${org}/${repo}/raw/branch/master/${String(bookNames[bookId]).padStart(
        2,
        "0",
      )}-${bookId}.usfm`,
    ).then((r) => r.text()));
  if (!localUsfm && targetUsfm) ls?.setItem(localKey, targetUsfm);
  return targetUsfm;
}
