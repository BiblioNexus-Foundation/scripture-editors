import React, { JSX, PropsWithChildren, forwardRef } from "react";
import { LoggerBasic } from "shared-react/plugins/logger-basic.model";
import CommentPlugin from "./comments/CommentPlugin";
import Editor, { EditorProps, EditorRef } from "../editor/Editor";

/**
 * Scripture Editor for USJ with comments in the margin. Created for use in Platform.Bible.
 * @see https://github.com/usfm-bible/tcdocs/blob/usj/grammar/usj.js
 *
 * @param props.ref - Forward reference for the editor.
 * @param props.defaultUsj - Default USJ Scripture data.
 * @param props.scrRef - Scripture reference that controls the cursor in the Scripture.
 * @param props.setScrRef - Scripture reference set callback function when the reference changes in
 *   the editor as the cursor moves.
 * @param props.options - Options to configure the editor.
 * @param props.onChange - Callback function when USJ Scripture data has changed.
 * @param props.logger - Logger instance.
 * @returns the editor element.
 */
const Marginal = forwardRef(function Marginal<TLogger extends LoggerBasic>(
  props: EditorProps<TLogger>,
  ref: React.ForwardedRef<EditorRef>,
): JSX.Element {
  const { children, ...propsWithoutChildren } = props as PropsWithChildren<EditorProps<TLogger>>;
  return (
    <Editor ref={ref} {...propsWithoutChildren}>
      <CommentPlugin />
    </Editor>
  );
});

export default Marginal;
