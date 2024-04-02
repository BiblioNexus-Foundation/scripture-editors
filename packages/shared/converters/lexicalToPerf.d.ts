declare module "shared/converters/lexicalToPerf" {
  import { SerializedUsfmElementNode } from "../nodes/UsfmElementNode";
  export interface LexicalStateNode {
    [key: string]: Perf;
  }
  export interface Perf {
    sequences: { [key: string]: Perf };
    targetNode?: Perf;
  }

  export interface NodeBuilderProps {
    [key: string]: Perf;
  }

  export interface CustomNodeBuilderProps extends NodeBuilderProps {
    perf: Perf;
  }

  export function transformLexicalStateToPerf(
    lexicalStateNode: SerializedUsfmElementNode,
    kind: string,
  ): Perf;

  export function getDatafromAttributes(attributes: { [key: string]: unknown }): unknown;
}
