import {
  SerializedLexicalNode,
  SerializedRootNode,
  SerializedTextNode,
  TextModeType,
} from "lexical";

export const createSerializedRootNode = (children: SerializedLexicalNode[]): SerializedRootNode => {
  return {
    children,
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  };
};

export const createSerializedTextNode = (
  text: string,
  format = 0,
  style = "",
  mode: TextModeType = "normal",
  detail = 0,
): SerializedTextNode => {
  return {
    detail,
    format,
    mode,
    style,
    text,
    type: "text",
    version: 1,
  };
};
