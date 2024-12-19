import React from "react";

export function IconButton({
  icon,
  active,
  onClick,
}: { icon: string; active: boolean } & React.JSX.IntrinsicElements["button"]) {
  return (
    <button style={{ backgroundColor: active ? "blue" : "gray" }} onClick={onClick}>
      <i>{icon}</i>
    </button>
  );
}

export default IconButton;
