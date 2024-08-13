import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { COMMAND_PRIORITY_NORMAL, DROP_COMMAND, KEY_DOWN_COMMAND, PASTE_COMMAND } from "lexical";
import { useEffect } from "react";
import { LoggerBasic } from "./logger-basic.model";

/**
 * This plugin prevents the backslash key from being typed, or pasted or dragged.
 * Later this plugin will open the command menu to insert USJ elements.
 * @returns `null`. This plugin has no DOM presence.
 */
export default function CommandMenuPlugin({ logger }: { logger?: LoggerBasic }): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      // When the backslash key is typed.
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event: KeyboardEvent) => {
          if (event.key !== "\\") return false;

          event.preventDefault();
          return true;
        },
        COMMAND_PRIORITY_NORMAL,
      ),

      // When the backslash character is pasted into the editor.
      editor.registerCommand(
        PASTE_COMMAND,
        (event: ClipboardEvent) => {
          const text = event.clipboardData?.getData("text/plain");
          if (!text || !text.includes("\\")) return false;

          logger?.info("CommandMenuPlugin: paste containing backslash ignored.");
          event.preventDefault();
          return true;
        },
        COMMAND_PRIORITY_NORMAL,
      ),

      // When the backslash character is dragged into the editor.
      editor.registerCommand(
        DROP_COMMAND,
        (event: DragEvent) => {
          const text = event.dataTransfer?.getData("text/plain");
          if (!text || !text.includes("\\")) return false;

          logger?.info("CommandMenuPlugin: drag containing backslash ignored.");
          event.preventDefault();
          return true;
        },
        COMMAND_PRIORITY_NORMAL,
      ),
    );
  }, [editor]);

  return null;
}
