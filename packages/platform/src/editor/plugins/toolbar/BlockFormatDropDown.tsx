import { $setBlocksType } from "@lexical/selection";
import { $getSelection, $isRangeSelection, LexicalEditor } from "lexical";
import { typeToClassName, typeToStyle } from "shared/converters/usj/usj.util";
import { $createParaNode } from "shared/nodes/scripture/usj/ParaNode";
import DropDown, { DropDownItem } from "../../ui/DropDown";

export type BlockTypeToBlockNames = typeof blockTypeToBlockNames;

const commonBlockTypeToBlockNames = {
  "para:b": "b - Poetry - Stanza Break (Blank Line)",
  "para:m": "m - Paragraph - Margin - No First Line Indent",
  "para:ms": "ms - Heading - Major Section Level 1",
  "para:nb": "nb - Paragraph - No Break with Previous Paragraph",
  "para:p": "p - Paragraph - Normal - First Line Indent",
  "para:pi": "pi - Paragraph - Indented - Level 1 - First Line Indent",
  "para:q1": "q1 - Poetry - Indent Level 1",
  "para:q2": "q2 - Poetry - Indent Level 2",
  "para:r": "r - Heading - Parallel References",
  "para:s": "s - Heading - Section Level 1",
};

// This list is incomplete.
const blockTypeToBlockNames = {
  ...commonBlockTypeToBlockNames,
  "para:ide": "ide - File - Encoding",
  "para:h": "h - File - Header",
  "para:h1": "h1 - File - Header",
  "para:h2": "h2 - File - Left Header",
  "para:h3": "h3 - File - Right Header",
  "para:toc1": "toc1 - File - Long Table of Contents Text",
  "para:toc2": "toc2 - File - Short Table of Contents Text",
  "para:toc3": "toc3 - File - Book Abbreviation",
  "para:cl": "cl - Chapter - Publishing Label",
  "para:mt": "mt - Title - Major Title Level 1",
  "para:mt1": "mt1 - Title - Major Title Level 1",
  "para:mt2": "mt2 - Title - Major Title Level 2",
  "para:mt3": "mt3 - Title - Major Title Level 3",
  "para:mt4": "mt4 - Title - Major Title Level 4",
  "para:ms1": "ms1 - Heading - Major Section Level 1",
  "para:ms2": "ms2 - Heading - Major Section Level 2",
  "para:ms3": "ms3 - Heading - Major Section Level 3",
};

function blockTypeToClassName(blockType: string) {
  return blockType in blockTypeToBlockNames ? typeToClassName(blockType) : "ban";
}

function blockFormatLabel(blockType: string) {
  return blockType in blockTypeToBlockNames
    ? blockTypeToBlockNames[blockType as keyof BlockTypeToBlockNames]
    : "No Style";
}

function dropDownActiveClass(active: boolean) {
  return active ? "active dropdown-item-active" : "";
}

export default function BlockFormatDropDown({
  editor,
  blockType,
  disabled = false,
  closeMenu,
}: {
  editor: LexicalEditor;
  blockType: string;
  disabled?: boolean;
  closeMenu?: () => void;
}): JSX.Element {
  const formatPara = (selectedBlockType: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParaNode(typeToStyle(selectedBlockType)));
      }
    });
    if (closeMenu) {
      closeMenu();
    }
  };

  return (
    <DropDown
      disabled={disabled}
      buttonClassName="toolbar-item block-controls"
      buttonIconClassName={"icon block-type " + blockTypeToClassName(blockType)}
      buttonLabel={blockFormatLabel(blockType)}
      buttonAriaLabel="Formatting options for block type"
    >
      {Object.keys(commonBlockTypeToBlockNames).map((itemBlockType) => (
        <DropDownItem
          key={itemBlockType}
          className={"item block-type " + dropDownActiveClass(blockType === itemBlockType)}
          onClick={() => formatPara(itemBlockType)}
        >
          <i className={"icon block-type " + typeToClassName(itemBlockType)} />
          <span className={"text usfm_" + typeToStyle(itemBlockType)}>
            {commonBlockTypeToBlockNames[itemBlockType as keyof typeof commonBlockTypeToBlockNames]}
          </span>
        </DropDownItem>
      ))}
    </DropDown>
  );
}
