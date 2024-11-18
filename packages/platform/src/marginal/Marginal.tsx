import { Usj } from "@biblionexus-foundation/scripture-utilities";
import React, {
  JSX,
  PropsWithChildren,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { LoggerBasic } from "shared-react/plugins/logger-basic.model";
import { Comments } from "./comments/commenting";
import CommentPlugin from "./comments/CommentPlugin";
import useCommentStoreRef from "./comments/use-comment-store-ref.hook";
import useMissingCommentsProps from "./comments/use-missing-comments-props.hook";
import { createWebsocketProvider, useCollabDocId } from "../editor/collaboration";
import Editor, { EditorProps, EditorRef } from "../editor/Editor";

/** Forward reference for the editor. */
export type MarginalRef = EditorRef & {
  /** Set the comments to accompany USJ Scripture. */
  setComments?(comments: Comments): void;
};

export type MarginalProps<TLogger extends LoggerBasic> = Omit<
  EditorProps<TLogger>,
  "onUsjChange"
> & {
  /** Callback function when comments have changed. */
  onCommentChange?: (comments: Comments | undefined) => void;
  /** Callback function when USJ Scripture data has changed. */
  onUsjChange?: (usj: Usj, comments: Comments | undefined) => void;
};

/**
 * Scripture Editor for USJ with comments in the margin. Created for use in [Platform](https://platform.bible).
 * @see https://github.com/usfm-bible/tcdocs/blob/usj/grammar/usj.js
 *
 * @param props.ref - Forward reference for the editor.
 * @param props.defaultUsj - Initial Scripture data in USJ format.
 * @param props.scrRef - Scripture reference that links the general cursor location in the
 *   Scripture.
 * @param props.onScrRefChange - Callback function when the Scripture reference changes in the
 *   editor as the cursor moves.
 * @param props.onSelectionChange - Callback function when the cursor selection changes.
 * @param props.onCommentChange - Callback function when comments have changed.
 * @param props.onUsjChange - Callback function when USJ Scripture data has changed.
 * @param props.options - Options to configure the editor.
 * @param props.logger - Logger instance.
 * @returns the editor element.
 */
const Marginal = forwardRef(function Marginal<TLogger extends LoggerBasic>(
  props: MarginalProps<TLogger>,
  ref: React.ForwardedRef<MarginalRef>,
): JSX.Element {
  const editorRef = useRef<EditorRef>(null);
  const hasCommentsBeenSetRef = useRef(true);
  const commentContainerRef = useRef<HTMLDivElement>(null);
  const [toolbarEndRef, setToolbarEndRef] = useState<React.RefObject<HTMLElement> | null>(null);
  const { children, onCommentChange, onUsjChange, ...editorProps } = props as PropsWithChildren<
    MarginalProps<TLogger>
  >;
  const { projectId, scrRef } = props as PropsWithChildren<MarginalProps<TLogger>>;
  const docId = useCollabDocId(projectId, scrRef, "comments");
  const [commentStoreRef, setCommentStoreRef] = useCommentStoreRef();
  useMissingCommentsProps(editorProps, commentStoreRef);

  useImperativeHandle(ref, () => ({
    focus() {
      editorRef.current?.focus();
    },
    getUsj() {
      return editorRef.current?.getUsj();
    },
    setUsj(usj) {
      editorRef.current?.setUsj(usj);
    },
    getSelection() {
      return editorRef.current?.getSelection();
    },
    setSelection(selection) {
      editorRef.current?.setSelection(selection);
    },
    addAnnotation(selection, type, id) {
      editorRef.current?.addAnnotation(selection, type, id);
    },
    removeAnnotation(type, id) {
      editorRef.current?.removeAnnotation(type, id);
    },
    setComments(comments) {
      commentStoreRef.current?.setComments(comments);
      hasCommentsBeenSetRef.current = true;
    },
    get toolbarEndRef() {
      return toolbarEndRef;
    },
  }));

  const handleUsjChange = useCallback(
    (usj: Usj) => {
      if (!onUsjChange) return;

      const comments = commentStoreRef.current?.getComments();
      onUsjChange(usj, comments);
    },
    [commentStoreRef, onUsjChange],
  );

  const handleCommentChange = useCallback(() => {
    if (!onCommentChange || hasCommentsBeenSetRef.current) {
      hasCommentsBeenSetRef.current = false;
      return;
    }

    const comments = commentStoreRef.current?.getComments();
    onCommentChange(comments);
  }, [commentStoreRef, hasCommentsBeenSetRef, onCommentChange]);

  useEffect(() => {
    // The refs aren't defined until after the first render so we don't include the showComments
    // button until this is set.
    setToolbarEndRef(editorRef.current?.toolbarEndRef ?? null);
    return () => setToolbarEndRef(null);
  }, []);

  return (
    <Editor ref={editorRef} onUsjChange={handleUsjChange} {...editorProps}>
      <CommentPlugin
        providerFactory={docId ? createWebsocketProvider : undefined}
        setCommentStore={setCommentStoreRef}
        onChange={handleCommentChange}
        showCommentsContainerRef={toolbarEndRef}
        commentContainerRef={commentContainerRef}
        logger={editorProps.logger}
      />
      <div ref={commentContainerRef} className="comment-container"></div>
    </Editor>
  );
});

export default Marginal;
