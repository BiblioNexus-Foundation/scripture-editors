import {
  useCallback,
  useEffect,
  InputHTMLAttributes,
  useRef,
  forwardRef,
  useImperativeHandle,
  Ref,
} from "react";
import { useMenuActions } from "./useMenuActions";

export const MenuInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  BaseInput,
);

function BaseInput(props: InputHTMLAttributes<HTMLInputElement>, ref: Ref<HTMLInputElement>) {
  const menu = useMenuActions();
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => inputRef.current || ({} as HTMLInputElement));

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          menu.moveDown();
          break;
        case "ArrowUp":
          event.preventDefault();
          menu.moveUp();
          break;
        case "Enter":
        case "Tab":
          event.preventDefault();
          menu.select();
          break;
      }
    },
    [menu],
  );

  useEffect(() => {
    const input = inputRef.current;
    console.log("CONTAINER", input);
    if (input) {
      input.addEventListener("keydown", handleKeyDown);
      console.log("REGISTER KEYDOWN LISTENER");
      return () => {
        console.log("UNREGISTER KEYDOWN LISTENER");
        input.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [handleKeyDown]);

  return <input {...props} ref={inputRef} tabIndex={0} />;
}
