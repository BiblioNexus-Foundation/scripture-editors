/**
 * Adapted from https://github.com/facebook/lexical/blob/7717ee76e1ef211557dc5992c96c90ee8103ff52/packages/lexical-react/src/shared/useYjsCollaboration.tsx
 */

import type { InitialEditorStateType } from "@lexical/react/LexicalComposer";
import { mergeRegister } from "@lexical/utils";
import {
  Binding,
  CONNECTED_COMMAND,
  initLocalState,
  Provider,
  syncLexicalUpdateToYjs,
  syncYjsChangesToLexical,
  TOGGLE_CONNECT_COMMAND,
} from "@lexical/yjs";
import { $createParagraphNode, $getRoot, COMMAND_PRIORITY_EDITOR, LexicalEditor } from "lexical";
import { Doc, Transaction, UndoManager, YEvent } from "yjs";

export function registerYjsCollaboration(
  editor: LexicalEditor,
  id: string,
  provider: Provider,
  docMap: Map<string, Doc>,
  name: string,
  color: string,
  shouldBootstrap: boolean,
  binding: Binding,
  setDoc: (doc: Doc | undefined) => void,
  initialEditorState?: InitialEditorStateType,
  awarenessData?: object,
): () => void {
  let isReloadingDoc = false;

  const connect = () => provider.connect();

  const disconnect = () => {
    try {
      provider.disconnect();
    } catch (e) {
      // Do nothing
    }
  };

  // Register provider

  const { root } = binding;

  const onStatus = ({ status }: { status: string }) => {
    editor.dispatchCommand(CONNECTED_COMMAND, status === "connected");
  };

  const onSync = (isSynced: boolean) => {
    if (
      shouldBootstrap &&
      isSynced &&
      root.isEmpty() &&
      root._xmlText._length === 0 &&
      isReloadingDoc === false
    ) {
      initializeEditor(editor, initialEditorState);
    }

    isReloadingDoc = false;
  };

  const onYjsTreeChanges = (
    // The below `any` type is taken directly from the vendor types for YJS.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    events: Array<YEvent<any>>,
    transaction: Transaction,
  ) => {
    const origin = transaction.origin;
    if (origin !== binding) {
      const isFromUndoManger = origin instanceof UndoManager;
      syncYjsChangesToLexical(binding, provider, events, isFromUndoManger);
    }
  };

  initLocalState(provider, name, color, false, awarenessData || {});

  const onProviderDocReload = (ydoc: Doc) => {
    clearEditorSkipCollab(editor, binding);
    setDoc(ydoc);
    docMap.set(id, ydoc);
    isReloadingDoc = true;
  };

  provider.on("reload", onProviderDocReload);
  provider.on("status", onStatus);
  provider.on("sync", onSync);
  // This updates the local editor state when we receive updates from other clients
  root.getSharedType().observeDeep(onYjsTreeChanges);
  const removeListener = editor.registerUpdateListener(
    ({ prevEditorState, editorState, dirtyLeaves, dirtyElements, normalizedNodes, tags }) => {
      if (tags.has("skip-collab") === false) {
        syncLexicalUpdateToYjs(
          binding,
          provider,
          prevEditorState,
          editorState,
          dirtyElements,
          dirtyLeaves,
          normalizedNodes,
          tags,
        );
      }
    },
  );

  const connectionPromise = connect();

  const unregisterProvider = () => {
    if (isReloadingDoc === false) {
      if (connectionPromise) {
        connectionPromise.then(disconnect);
      } else {
        // Workaround for race condition in StrictMode. It's possible there
        // is a different race for the above case where connect returns a
        // promise, but we don't have an example of that in-repo.
        // It's possible that there is a similar issue with
        // TOGGLE_CONNECT_COMMAND below when the provider connect returns a
        // promise.
        // https://github.com/facebook/lexical/issues/6640
        disconnect();
      }
    }

    provider.off("sync", onSync);
    provider.off("status", onStatus);
    provider.off("reload", onProviderDocReload);
    root.getSharedType().unobserveDeep(onYjsTreeChanges);
    docMap.delete(id);
    removeListener();
  };

  const unregisterToggleConnect = editor.registerCommand(
    TOGGLE_CONNECT_COMMAND,
    (payload) => {
      const shouldConnect = payload;

      if (shouldConnect) {
        // eslint-disable-next-line no-console
        console.log("Collaboration connected!");
        connect();
      } else {
        // eslint-disable-next-line no-console
        console.log("Collaboration disconnected!");
        disconnect();
      }

      return true;
    },
    COMMAND_PRIORITY_EDITOR,
  );

  return mergeRegister(unregisterProvider, unregisterToggleConnect);
}

function initializeEditor(
  editor: LexicalEditor,
  initialEditorState?: InitialEditorStateType,
): void {
  editor.update(
    () => {
      const root = $getRoot();

      if (root.isEmpty()) {
        if (initialEditorState) {
          switch (typeof initialEditorState) {
            case "string": {
              const parsedEditorState = editor.parseEditorState(initialEditorState);
              editor.setEditorState(parsedEditorState, { tag: "history-merge" });
              break;
            }
            case "object": {
              editor.setEditorState(initialEditorState, { tag: "history-merge" });
              break;
            }
            case "function": {
              editor.update(
                () => {
                  const root1 = $getRoot();
                  if (root1.isEmpty()) {
                    initialEditorState(editor);
                  }
                },
                { tag: "history-merge" },
              );
              break;
            }
          }
        } else {
          const paragraph = $createParagraphNode();
          root.append(paragraph);
          paragraph.select();
        }
      }
    },
    {
      tag: "history-merge",
    },
  );
}

function clearEditorSkipCollab(editor: LexicalEditor, binding: Binding) {
  // reset editor state
  editor.update(
    () => {
      const root = $getRoot();
      root.clear();
      root.select();
    },
    {
      tag: "skip-collab",
    },
  );

  if (binding.cursors == null) {
    return;
  }

  const cursors = binding.cursors;
  if (cursors == null) {
    return;
  }

  const cursorsContainer = binding.cursorsContainer;
  if (cursorsContainer == null) {
    return;
  }

  // reset cursors in dom
  const cursorsArr = Array.from(cursors.values());
  for (let i = 0; i < cursorsArr.length; i++) {
    const cursor = cursorsArr[i];
    const selection = cursor.selection;

    if (selection && selection.selections != null) {
      const selections = selection.selections;

      for (let j = 0; j < selections.length; j++) {
        cursorsContainer.removeChild(selections[i]);
      }
    }
  }
}
