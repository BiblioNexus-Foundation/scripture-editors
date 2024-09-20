import Editor from "./app/Editor";
import "shared/styles/perf-app.css";

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
      <div className="editor">
        <Editor
          {...{
            serverName: "door43",
            organizationId: "idiomasPuentes",
            languageCode: "es-419",
            versionId: "tpl",
            bookCode: "rev",
          }}
        />
      </div>
    </div>
  );
}

export default App;
