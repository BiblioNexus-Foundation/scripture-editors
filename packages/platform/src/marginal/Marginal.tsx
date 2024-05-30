import React, {
  JSX,
  PropsWithChildren,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import { Usj } from "shared/converters/usj/usj.model";
import { LoggerBasic } from "shared-react/plugins/logger-basic.model";
import { Comments } from "./comments/commenting";
import CommentPlugin from "./comments/CommentPlugin";
import useCommentStoreRef from "./comments/use-comment-store-ref.hook";
import useMissingCommentsProps from "./comments/use-missing-comments-props.hook";
import Editor, { EditorProps, EditorRef } from "../editor/Editor";

/** Forward reference for the editor. */
export type MarginalRef = EditorRef & {
  /** Set the comments to accompany USJ Scripture. */
  setComments?(comments: Comments): void;
};

export type MarginalProps<TLogger extends LoggerBasic> = Omit<EditorProps<TLogger>, "onChange"> & {
  /** Callback function when USJ Scripture data has changed. */
  onChange?: (usj: Usj, comments: Comments | undefined) => void;
};

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
  props: MarginalProps<TLogger>,
  ref: React.ForwardedRef<MarginalRef>,
): JSX.Element {
  const editorRef = useRef<EditorRef>(null);
  const { children, onChange, ...editorProps } = props as PropsWithChildren<MarginalProps<TLogger>>;
  const [commentStoreRef, setCommentStoreRef] = useCommentStoreRef();
  useMissingCommentsProps(editorProps, commentStoreRef);

  useImperativeHandle(ref, () => ({
    focus() {
      editorRef.current?.focus();
    },
    setUsj(usj) {
      editorRef.current?.setUsj(usj);
    },
    addAnnotation(selection, type, id) {
      editorRef.current?.addAnnotation(selection, type, id);
    },
    removeAnnotation(type, id) {
      editorRef.current?.removeAnnotation(type, id);
    },
    setComments(comments) {
      commentStoreRef.current?.setComments(comments);
    },
  }));

  const handleChange = useCallback(
    (usj: Usj) => {
      const comments = commentStoreRef.current?.getComments();
      onChange?.(usj, comments);
    },
    [commentStoreRef, onChange],
  );

  return (
    <Editor ref={editorRef} onChange={handleChange} {...editorProps}>
      <CommentPlugin setCommentStore={setCommentStoreRef} logger={editorProps.logger} />
    </Editor>
  );
});

export default Marginal;
