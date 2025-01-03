// import { usxStringToUsj } from "@biblionexus-foundation/scripture-utilities";
import "shared/styles/perf-app.css";
// import { BSB_REV_USX } from "shared/data/BSB-REV.usx";
import Editor from "./editor/Editor";
import { UsjDocument } from "shared/converters/usj/core/usj";
import titUsj from "shared/data/tit.usj.json";

function App() {
  // const usj = usxStringToUsj(BSB_REV_USX) as UsjDocument;
  const usj = titUsj as UsjDocument;

  return usj ? <Editor usj={usj} bookCode="TIT" onSave={(usj) => console.log({ usj })} /> : null;
}

export default App;
