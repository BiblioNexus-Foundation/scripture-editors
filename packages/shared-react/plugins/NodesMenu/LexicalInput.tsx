import {
  useEffect,
  InputHTMLAttributes,
  useRef,
  forwardRef,
  useImperativeHandle,
  Ref,
} from "react";
import { useMenuActions } from "./Menu/useMenuActions";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COMMAND_PRIORITY_HIGH, KEY_DOWN_COMMAND } from "lexical";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  onEmpty?: () => void;
  onExit?: () => void;
  onChange?: React.Dispatch<React.SetStateAction<string>>;
};

export const LexicalInput = forwardRef<HTMLInputElement, InputProps>(BaseInput);

function BaseInput(props: InputProps, ref: Ref<HTMLInputElement>) {
  const menu = useMenuActions();
  const inputRef = useRef<HTMLInputElement>(null);
  const [editor] = useLexicalComposerContext();
  const { onChange, onEmpty, onExit, ...inputProps } = props;

  useImperativeHandle(ref, () => inputRef.current || ({} as HTMLInputElement));

  useEffect(() => {
    const unregisterCommand = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event) => {
        if (!inputRef.current) return false;

        event.preventDefault();

        switch (event.key) {
          case "ArrowDown":
            menu.moveDown();
            break;
          case "ArrowUp":
            menu.moveUp();
            break;
          case "Enter":
          case "Tab":
            menu.select();
            break;
          case "Escape":
            onExit?.();
            break;
          case "Backspace":
            if (inputRef.current.value.length === 0) {
              onEmpty?.();
            } else {
              onChange?.((prev) => prev.slice(0, -1));
            }
            break;
          default:
            if (event.key.length === 1) {
              onChange?.((prev) => prev + event.key);
            }
        }

        event.stopPropagation(); // Stop propagation after handling
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
    return () => {
      unregisterCommand();
    };
  }, [editor, onChange, onEmpty]); // Added onEmpty to dependencies

  return <input {...inputProps} ref={inputRef} tabIndex={0} />;
}
