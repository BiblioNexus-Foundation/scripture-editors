import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { forwardRef } from "react";

export const ContentEditablePlugin = forwardRef<HTMLDivElement>((_props, ref) => {
  const [editor] = useLexicalComposerContext();
  return (
    <RichTextPlugin
      contentEditable={
        <div className="editor" ref={ref} id={editor.getKey()}>
          <ContentEditable className="contentEditable" spellCheck={false} />
        </div>
      }
      placeholder={<div className="placeholder">Enter some text...</div>}
      ErrorBoundary={LexicalErrorBoundary}
    />
  );
});

export default ContentEditablePlugin;
