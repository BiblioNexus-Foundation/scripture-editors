import { useScripturalComposerContext } from "@scriptural/react";
import { ScrollText } from "lucide-react";
import { useEffect, useState } from "react";

export function ButtonExpandNotes({ defaultState }: { defaultState: boolean }) {
  const { editorRef } = useScripturalComposerContext();
  const [isActive, setIsActive] = useState(defaultState);

  const handleClick = () => {
    setIsActive((current) => !current);
  };

  useEffect(() => {
    if (isActive) {
      editorRef.current?.classList.add("expand-notes");
      return;
    }
    editorRef.current?.classList.remove("expand-notes");
  }, [isActive]);

  return (
    <button
      variant="outline"
      onClick={handleClick}
      title={isActive ? "Fold All Notes" : "Unfold All Notes"}
      className={isActive ? "active" : ""}
    >
      <ScrollText size={20} />
    </button>
  );
}
