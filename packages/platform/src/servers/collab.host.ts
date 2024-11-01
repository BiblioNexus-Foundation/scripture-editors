import { Usj } from "@biblionexus-foundation/scripture-utilities";
import { createHeadlessEditor } from "@lexical/headless";
import { registerRichText } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import { createBinding } from "@lexical/yjs";
import { Canon } from "@sillsdev/scripture";
import { CreateEditorArgs, EditorState, LexicalEditor } from "lexical";
import { createInterface } from "readline";
import WebSocket from "ws";
import { Doc } from "yjs";
import { WEB_RUT_USJ } from "shared/data/WEB-RUT.usx";
import { TypedMarkNode } from "shared/nodes/features/TypedMarkNode";
import scriptureUsjNodes from "shared/nodes/scripture/usj";
import { ImmutableNoteCallerNode } from "shared-react/nodes/scripture/usj/ImmutableNoteCallerNode";
import { ImmutableVerseNode } from "shared-react/nodes/scripture/usj/ImmutableVerseNode";
import { registerYjsCollaboration } from "./yjs-collab.plugin";
import editorUsjAdaptor from "../editor/adaptors/editor-usj.adaptor";
import usjEditorAdaptor from "../editor/adaptors/usj-editor.adaptor";
import { DEFAULT_VIEW_MODE, getViewOptions } from "../editor/adaptors/view-options.utils";
import { createWebsocketProvider, getCollabDocId } from "../editor/collaboration";

// Inputs for this host - `const` for now.
const projectId = "projectId";
const scrRef = { bookNum: Canon.bookIdToNumber("RUT"), chapterNum: 1, verseNum: 1 };
const initialUsj = WEB_RUT_USJ as Usj;
const viewMode = DEFAULT_VIEW_MODE;
const logger = console;

logger.info("[Collab Host] is starting...");

const editorConfig: CreateEditorArgs = {
  namespace: "headlessCollabEditor",
  theme: {},
  editable: true,
  // NOTE: This is critical for collaboration plugin to set editor state to undefined.
  editorState: undefined,
  // Handling of errors during update
  onError(error) {
    throw error;
  },
  nodes: [TypedMarkNode, ImmutableNoteCallerNode, ImmutableVerseNode, ...scriptureUsjNodes],
};

if (typeof global.WebSocket === "undefined") {
  global.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket;
}

const docId = getCollabDocId(projectId, scrRef);
const yjsDocMap = new Map();
const provider = createWebsocketProvider(docId, yjsDocMap);

let doc: Doc = yjsDocMap.get(docId);
const setDoc = (newDoc: Doc | undefined) => {
  if (newDoc) doc = newDoc;
};

logger.info("[Collab Host] docId:", docId);

let editor: LexicalEditor | undefined;
let unregister: () => void | undefined;

let shouldBootstrap = false;
let initialEditorState: EditorState | undefined;

try {
  editor = createHeadlessEditor(editorConfig);
  const unregisterRichText = registerRichText(editor);

  if (initialUsj) {
    usjEditorAdaptor.initialize({}, logger);
    usjEditorAdaptor.reset();
    const viewOptions = getViewOptions(viewMode);
    const serializedEditorState = usjEditorAdaptor.serializeEditorState(initialUsj, viewOptions);
    initialEditorState = editor.parseEditorState(serializedEditorState);
    shouldBootstrap = true;
    logger.info("[Collab Host] doc created for", docId);
  }
  const binding = createBinding(editor, provider, docId, doc || yjsDocMap.get(docId), yjsDocMap);
  const unregisterYjsCollaboration = registerYjsCollaboration(
    editor,
    docId,
    provider,
    yjsDocMap,
    "Collab Host",
    "rgb(0, 0, 0)",
    shouldBootstrap,
    binding,
    setDoc,
    initialEditorState,
  );

  editorUsjAdaptor.initialize(logger);
  const unregisterOnChange = editor.registerUpdateListener(({ editorState, prevEditorState }) => {
    // Get the current editor state
    const currentState = editorState.toJSON();
    const previousState = prevEditorState.toJSON();

    // Check if the root node's children have changed
    if (currentState.root.children !== previousState.root.children) {
      const usj = editorUsjAdaptor.deserializeEditorState(editorState);
      logger.info("[Collab Host] Editor content has changed! USJ:", usj);
    }
  });
  unregister = mergeRegister(unregisterRichText, unregisterYjsCollaboration, unregisterOnChange);
} catch (error) {
  logger.error(error);
  throw error;
}

const isWindows = process.platform === "win32";
const signals = ["SIGINT", "SIGTERM", "SIGQUIT"];
signals.forEach((signal) => {
  process.on(signal as NodeJS.Signals, () => {
    logger.info(`[Collab Host] Received ${signal}. Performing cleanup...`);
    if (unregister) unregister();
    logger.info("[Collab Host] Cleanup completed. Exiting...");
    process.exit(0);
  });
});

if (isWindows) {
  createInterface({
    input: process.stdin,
    output: process.stdout,
  }).on("SIGINT", () => {
    process.emit("SIGINT");
  });
}

logger.info("[Collab Host] editor is created.");
