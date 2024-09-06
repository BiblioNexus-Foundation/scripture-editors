import Editor from "./app/Editor";
import "shared/styles/perf-app.css";

function App() {
  return (
    <div className="editors">
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
