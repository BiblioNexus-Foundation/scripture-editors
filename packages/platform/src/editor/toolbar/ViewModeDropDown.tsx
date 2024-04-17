import { JSX } from "react";
import DropDown, { DropDownItem } from "./DropDown";
import { viewModeToViewNames, ViewNameKey } from "./view-mode.model";

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
      {Object.keys(viewModeToViewNames).map((itemViewMode) => (
        <DropDownItem
          key={itemViewMode}
          className={"item view-mode " + dropDownActiveClass(viewMode === itemViewMode)}
          onClick={() => handleSelect(itemViewMode)}
        >
          <i className={"icon view-mode " + viewModeToClassName(itemViewMode)} />
          {viewModeToViewNames[itemViewMode as ViewNameKey]}
        </DropDownItem>
      ))}
    </DropDown>
  );
}
