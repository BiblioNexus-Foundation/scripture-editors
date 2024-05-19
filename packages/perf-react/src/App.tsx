import Editor from "./app/Editor";
import "shared/styles/perf-app.css";

function App() {
  return (
    <div className="editors">
      <div className="source-editor">
        <Editor
          editable={false}
          {...{
            serverName: "dbl",
            organizationId: "bfbs",
            languageCode: "fra",
            versionId: "lsg",
            bookCode: "tit",
          }}
        />
      </div>
      <div className="target-editor">
        <Editor
          {...{
            serverName: "dbl",
            organizationId: "bfbs",
            languageCode: "fra",
            versionId: "tpl",
            bookCode: "tit",
          }}
        />
      </div>
    </div>
  );
}

export default App;
