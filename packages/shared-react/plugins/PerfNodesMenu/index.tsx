import useUsfmMakersForMenu from "../PerfTypeahead/useUsfmMarkersForMenu";
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

  console.log({ markersMenuItems });

  return <NodesMenu trigger={trigger} items={markersMenuItems} />;
}
