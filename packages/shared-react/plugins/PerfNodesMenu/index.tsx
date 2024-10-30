import useUsfmMakersForMenu from "../PerfNodesItems/useUsfmMarkersForMenu";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ScriptureReference } from "../ScriptureReferencePlugin";
import NodesMenu from "../NodesMenu";

export default function PerfNodesMenu({
  trigger,
  scriptureReference,
  contextMarker,
}: {
  trigger: string;
  scriptureReference: ScriptureReference;
  contextMarker: string;
}) {
  const [editor] = useLexicalComposerContext();
  const { markersMenuItems } = useUsfmMakersForMenu({ editor, scriptureReference, contextMarker });

  return <NodesMenu trigger={trigger} items={markersMenuItems} />;
}
