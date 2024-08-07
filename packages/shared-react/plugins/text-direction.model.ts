import { LexicalCommand, createCommand } from "lexical";

/** Left-to-right or Right-to-left or Automatically determined from the content. */
export type TextDirection = "ltr" | "rtl" | "auto";

/** Selection option names */
export const directionToNames: { [textDirection in TextDirection]: string } = {
  ltr: "Left-to-right",
  rtl: "Right-to-left",
  auto: "Automatic",
};

export const SET_DIRECTION_COMMAND: LexicalCommand<void> = createCommand("SET_DIRECTION_COMMAND");
