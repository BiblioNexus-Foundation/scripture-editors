import Editor from "./app/Editor";
import "shared/styles/perf-app.css";
import "shared/styles/nodes-menu.css";

function App() {
  return (
    <div className="editors">
      <div className="editor">
        <Editor
          {...{
            serverName: "dbl",
            organizationId: "bfbs",
            languageCode: "fra",
            versionId: "lsg",
            bookCode: "rev",
          }}
        />
      </div>
    </div>
  );
}

export default App;
