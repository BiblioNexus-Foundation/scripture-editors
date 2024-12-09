/**
 * Modified from https://github.com/facebook/lexical/blob/92c47217244f9d3c22a59728633fb41a10420724/packages/lexical-playground/src/plugins/TreeViewPlugin/index.tsx
 */

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TreeView } from "@lexical/react/LexicalTreeView";
import { LexicalNode } from "lexical";
import { $isTypedMarkNode } from "shared/nodes/features/TypedMarkNode";
import { $isBookNode } from "shared/nodes/scripture/usj/BookNode";
import { $isChapterNode } from "shared/nodes/scripture/usj/ChapterNode";
import { $isCharNode } from "shared/nodes/scripture/usj/CharNode";
import { $isImmutableChapterNode } from "shared/nodes/scripture/usj/ImmutableChapterNode";
import { $isImmutableVerseNode } from "shared-react/nodes/scripture/usj/ImmutableVerseNode";
import { $isParaNode } from "shared/nodes/scripture/usj/ParaNode";
import { $isVerseNode } from "shared/nodes/scripture/usj/VerseNode";
import { $isImmutableNoteCallerNode } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";

function $customPrintNode(node: LexicalNode) {
  if ($isBookNode(node)) return `${node.__code}`;
  if ($isChapterNode(node)) return `${node.__marker} "${node.__number}"`;
  if ($isImmutableChapterNode(node)) return `${node.__marker} "${node.__number}"`;
  if ($isVerseNode(node)) return `${node.__marker} "${node.__number}"`;
  if ($isImmutableVerseNode(node)) return `${node.__marker} "${node.__number}"`;
  if ($isParaNode(node)) return `${node.__marker}`;
  if ($isCharNode(node)) return `${node.__marker} "${node.__text}"`;
  if ($isImmutableNoteCallerNode(node)) return `${node.__caller}`;
  if ($isTypedMarkNode(node)) return `ids: [ ${JSON.stringify(node.getTypedIDs())} ]`;
  return "";
}

export default function TreeViewPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  return (
    <TreeView
      viewClassName="tree-view-output"
      treeTypeButtonClassName="debug-treetype-button"
      timeTravelPanelClassName="debug-timetravel-panel"
      timeTravelButtonClassName="debug-timetravel-button"
      timeTravelPanelSliderClassName="debug-timetravel-panel-slider"
      timeTravelPanelButtonClassName="debug-timetravel-panel-button"
      customPrintNode={$customPrintNode}
      editor={editor}
    />
  );
}
