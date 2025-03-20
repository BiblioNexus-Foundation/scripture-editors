import {
  CreateEditorArgs,
  Klass,
  LexicalEditor,
  LexicalNode,
  LexicalNodeReplacement,
  createEditor,
} from "lexical";
import scriptureUsjNodes from "./scripture/usj";

export type TestEnv = {
  editor: LexicalEditor;
  container?: HTMLElement;
};

/**
 * Create basic Lexical test environment.
 * @param nodes - Array of nodes for the test environment.
 * @param $initialEditorState - Optional function to set the initial editor state.
 * @returns a test environment.
 */
export function createBasicTestEnvironment(
  nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> = scriptureUsjNodes,
  $initialEditorState?: () => void,
): TestEnv {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const config: CreateEditorArgs = {
    namespace: "TestEditor",
    onError(error) {
      throw error;
    },
    nodes,
  };
  const editor = createEditor(config);
  editor.setRootElement(container);
  if ($initialEditorState) editor.update($initialEditorState, { discrete: true });

  const testEnv: TestEnv = {
    container,
    editor,
  };

  return testEnv;
}
