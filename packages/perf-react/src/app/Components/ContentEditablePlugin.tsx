import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

export function ContentEditablePlugin() {
  const [editor] = useLexicalComposerContext();
  return (
    <RichTextPlugin
      contentEditable={
        <div className="editor" id={editor.getKey()}>
          <ContentEditable className="contentEditable" spellCheck={false} />
        </div>
      }
      placeholder={<div className="placeholder">Enter some text...</div>}
      ErrorBoundary={LexicalErrorBoundary}
    />
  );
}

export default ContentEditablePlugin;
