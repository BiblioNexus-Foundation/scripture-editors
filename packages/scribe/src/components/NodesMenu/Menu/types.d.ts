export type OptionItem = {
  name: string;
  label: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: ({
    editor,
    newVerseRChapterNum,
    noteText,
  }: {
    editor: LexicalEditor;
    newVerseRChapterNum?: number;
    noteText?: string;
  }) => void;
};
