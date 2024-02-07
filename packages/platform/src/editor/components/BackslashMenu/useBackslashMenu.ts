import { useEffect, useState } from "react";

/**
 * Detect if the user currently presses or releases a key.
 */

export function useBackslashMenu() {
  const [isKeyDown, setIsKeyDown] = useState(false);
  const [isKeyReleased, setIsKeyReleased] = useState(true);

  const handleKeyUp = (event: { key: string }) => {
    if (event.key === "\\") {
      setIsKeyDown(false);
      setIsKeyReleased(true);
    }
  };

  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "\\") {
      setIsKeyDown(true);
      setIsKeyReleased(false);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return { isKeyDown, isKeyReleased };
}
