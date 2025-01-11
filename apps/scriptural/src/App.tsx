import "./App.css";
import { Editor } from "./Editor";
import * as usj from "./tit.edit.json";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import AppBar from "./app/AppBar";
import { useResponsive } from "./utils/useResponsive";
import { UsjDocument } from "@scriptural/react/internal-packages/shared/converters/usj/core/usj";

function App() {
  const isVertical = useResponsive(600);
  return (
    <>
      <AppBar />
      <PanelGroup
        className="workspace"
        autoSaveId="example"
        style={{ height: "90dvh" }}
        direction={isVertical ? "vertical" : "horizontal"}
      >
        <Panel defaultSize={50}>
          <Editor usj={usj as UsjDocument} editable={false} bookCode={"TIT"} />
        </Panel>
        <PanelResizeHandle className="resizable-handle" />
        <Panel defaultSize={50}>
          <Editor
            usj={createEmptyUsj("TIT")}
            editable={true}
            bookCode={"TIT"}
            onSave={(newUsj: UsjDocument) => {
              alert(
                "[👨‍🔧] This button just logs the new USJ content to the console.\nCreate your own implementation of `onSave` on the App.tsx file. 😉",
              );
              console.log({ newUsj });
              //E.g. clear temp editorState from localStorage and store newUsj to localStorage
            }}
            onHistoryChange={(history) => {
              if (history.editorChanged && !history.tags.has("history-merge")) {
                console.log(history.editorState.toJSON());
                //E.g. update temp editorState in localStorage
              }
            }}
          />
        </Panel>
      </PanelGroup>
    </>
  );
}

export default App;

function createEmptyUsj(bookCode: string): UsjDocument {
  return {
    content: [
      {
        code: bookCode,
        content: [""],
        marker: "id",
        type: "book",
      },
      {
        marker: "c",
        number: "1",
        type: "chapter",
      },
    ],
    type: "USJ",
    version: "3.0",
  };
}
