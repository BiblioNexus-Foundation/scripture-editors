import { useEffect } from "react";
import { MarkNodeName } from "shared-react/nodes/scripture/usj/usj-node-options.model";
import { LoggerBasic } from "shared/adaptors/logger-basic.model";
import { CommentStore, Comments } from "./commenting";
import { EditorProps } from "../../editor/Editor";

function addMissingComments(
  usjCommentIds: string[],
  commentStoreRef: React.MutableRefObject<CommentStore | undefined>,
) {
  const comments = commentStoreRef.current?.getComments() ?? [];
  const commentIds = comments?.map((comment) => comment.id);

  // Add a comment thread for each comment milestone pair that don't have a corresponding comment thread.
  const newComments: Comments = usjCommentIds.map((id) => {
    const indexOfIdInComments = commentIds.findIndex((cid) => cid === id);
    if (indexOfIdInComments !== undefined && indexOfIdInComments >= 0)
      // comment found, return it.
      return comments[indexOfIdInComments];

    return {
      comments: [
        {
          author: "unknown",
          content: "Comment not found",
          deleted: false,
          id: "",
          timeStamp: 0,
          type: "comment",
        },
      ],
      id,
      quote: "",
      type: "thread",
    };
  });

  // Add any comments with no corresponding comment milestone pair.
  comments.forEach((comment) => {
    if (!usjCommentIds.includes(comment.id)) newComments.push(comment);
  });

  if (newComments) commentStoreRef.current?.setComments(newComments);
}

/**
 * Includes an `addMissingComments` method to the `MarkNodeOptions` props so missing comments are
 * added when adapting USJ to editor state. Comments are sorted into the USJ milestone order.
 * @param editorProps - Editor props.
 * @param commentStoreRef - Comment store ref.
 */
export default function useMissingCommentsProps<TLogger extends LoggerBasic>(
  editorProps: EditorProps<TLogger>,
  commentStoreRef: React.MutableRefObject<CommentStore | undefined>,
) {
  useEffect(() => {
    if (!editorProps.options) editorProps.options = {};
    if (!editorProps.options.nodes) editorProps.options.nodes = {};
    if (!editorProps.options.nodes[MarkNodeName]) editorProps.options.nodes[MarkNodeName] = {};
    editorProps.options.nodes[MarkNodeName].addMissingComments = (usjCommentIds: string[]) => {
      addMissingComments(usjCommentIds, commentStoreRef);
    };
  }, [commentStoreRef, editorProps]);
}
