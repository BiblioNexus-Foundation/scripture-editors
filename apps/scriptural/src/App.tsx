import { usxStringToUsj } from "@biblionexus-foundation/scripture-utilities";
import "shared/styles/perf-app.css";
import { BSB_REV_USX } from "shared/data/BSB-REV.usx";
import Editor from "./editor/Editor";
import { UsjDocument } from "shared/converters/usj/core/usj";

function App() {
  const usj = usxStringToUsj(BSB_REV_USX) as UsjDocument;
  console.log({ usj });

  return usj ? <Editor usj={usj} /> : null;
}

export default App;
