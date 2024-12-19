import { usjNodeToSerializedLexical, serializedLexicalToUsjNode } from "./index";
import { basicUsj, fullUsj } from "./data.test";
import { titUsj } from "./alignment/examples/tit.usj";
import { SerializedRootNode } from "lexical";
import { ExtractedAlignments } from "./maps/usjToLexicalMap";

describe("alignment", () => {
  it("titUsj", () => {
    const result = usjNodeToSerializedLexical(titUsj);
    console.log(result);
    expect(result).toMatchSnapshot();
    const lexical = result.result as SerializedRootNode;
    const extractedAlignment = result.extractedAlignment;
    const bcvOutput = serializedLexicalToUsjNode(
      lexical,
      extractedAlignment as ExtractedAlignments,
    );
    console.log(bcvOutput);
    expect(bcvOutput).toMatchSnapshot();
  });
});

describe("usjNodeToSerializedLexical", () => {
  const lexicalBasic = (usjNodeToSerializedLexical(basicUsj).result as SerializedRootNode) || {
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
    children: [],
  };
  console.log(lexicalBasic);

  // it("basicUsj", () => {
  //   expect(lexicalBasic).toMatchSnapshot();
  // });

  // it("fullUsj", () => {
  //   expect(usjNodeToSerializedLexical(fullUsj)).toMatchSnapshot();
  // });

  const lexicalFull = (usjNodeToSerializedLexical(fullUsj).result as SerializedRootNode) || {
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
    children: [],
  };

  it("serializedLexicalToUsjNode", () => {
    expect(serializedLexicalToUsjNode(lexicalFull)).toMatchSnapshot();
  });

  //roundtrip test
  it("roundtrip test", () => {
    expect(
      serializedLexicalToUsjNode(usjNodeToSerializedLexical(fullUsj).result as SerializedRootNode)
        .result,
    ).toEqual(fullUsj);
  });

  it("roundtrip test with basic", () => {
    expect(
      serializedLexicalToUsjNode(usjNodeToSerializedLexical(basicUsj).result as SerializedRootNode)
        .result,
    ).toEqual(basicUsj);
  });
});
