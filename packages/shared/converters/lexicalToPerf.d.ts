declare module "shared/converters/lexicalToPerf" {
  export interface LexicalStateNode {
    [key: string]: unknown;
  }
  export interface Perf {
    sequences: { [key: string]: unknown };
    targetSequence?: unknown;
  }

  export interface NodeBuilderProps {
    [key: string]: unknown;
  }

  export interface CustomNodeBuilderProps extends NodeBuilderProps {
    perf: Perf;
  }

  export function transformLexicalStateToPerf(
    lexicalStateNode: LexicalStateNode,
    kind: string,
  ): Perf;

  export function getDatafromAttributes(attributes: { [key: string]: unknown }): unknown;
}
