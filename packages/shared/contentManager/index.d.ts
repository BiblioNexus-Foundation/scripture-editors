// TODO: remove this file when `packages\shared\contentManager\index.js` is converted to TS.

declare module "shared/contentManager" {
  export function getLexicalState(
    perf: Record<string | number, unknown>,
  ): Record<string | number, unknown>;

  export function getPerf(usfm: string): Promise<Record<string | number, unknown>>;
}
