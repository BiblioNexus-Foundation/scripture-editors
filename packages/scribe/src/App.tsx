import { useUsfm2Usj } from "./hooks/useUsfm2Usj";
import { Editor } from "./components/Editor";
import { Usj } from "shared/converters/usj/usj.model";

function App() {
  const { usj } = useUsfm2Usj();
  console.log({ usj });
  const onChange = (usj: Usj) => console.log({ usj });
  return (
    <div className="flex-center m-2 flex h-editor justify-center p-8">
      <div className="w-2/3 overflow-y-auto rounded-md border-2 border-secondary">
        <Editor usj={usj} onChange={onChange} />
      </div>
    </div>
  );
}
export default App;
