import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "shared/styles/perf-editor.css";

const container = document.getElementById("app");
if (!container) {
  throw new Error("Document root element not found!");
}

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
