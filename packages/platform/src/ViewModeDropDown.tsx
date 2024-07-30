import { JSX } from "react";
import DropDown, { DropDownItem } from "./editor/toolbar/DropDown";
import { viewModeToViewNames, ViewNameKey } from "./editor/adaptors/view-mode.model";

function viewModeToClassName(viewMode: string): string {
  return viewMode in viewModeToViewNames ? viewMode : "";
}

function viewModeLabel(viewMode: string): string {
  return viewMode in viewModeToViewNames
    ? viewModeToViewNames[viewMode as ViewNameKey]
    : "select...";
}

function dropDownActiveClass(active: boolean): string {
  return active ? "active dropdown-item-active" : "";
}

export default function ViewModeDropDown({
  viewMode,
  handleSelect,
  disabled = false,
}: {
  viewMode: string;
  handleSelect: (viewMode: string) => void;
  disabled?: boolean;
}): JSX.Element {
  return (
    <DropDown
      disabled={disabled}
      buttonClassName="toolbar-item view-controls"
      buttonIconClassName={"icon view-mode " + viewModeToClassName(viewMode)}
      buttonLabel={viewModeLabel(viewMode)}
      buttonAriaLabel="Selection options for view mode"
    >
      {Object.keys(viewModeToViewNames).map((item) => (
        <DropDownItem
          key={item}
          className={"item view-mode " + dropDownActiveClass(viewMode === item)}
          onClick={() => handleSelect(item)}
        >
          <i className={"icon view-mode " + viewModeToClassName(item)} />
          {viewModeToViewNames[item as ViewNameKey]}
        </DropDownItem>
      ))}
    </DropDown>
  );
}
