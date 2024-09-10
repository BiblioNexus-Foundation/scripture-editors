import Editor from "./app/Editor";
import "shared/styles/perf-app.css";

function App() {
  return (
    <div className="editors">
      <div className="target-editor">
        <Editor
          {...{
            serverName: "ebible",
            organizationId: "web",
            languageCode: "en",
            versionId: "web",
            bookCode: "rev",
          }}
        />
      </div>
    </div>
  );
}

export default App;
