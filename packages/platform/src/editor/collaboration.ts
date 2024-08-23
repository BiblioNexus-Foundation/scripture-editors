/**
 * Modified from https://github.com/facebook/lexical/blob/f373759a7849f473d34960a6bf4e34b2a011e762/packages/lexical-playground/src/collaboration.ts
 */

import { Provider } from "@lexical/yjs";
import { Canon } from "@sillsdev/scripture";
import { ScriptureReference } from "platform-bible-utils";
import { useMemo } from "react";
import { WebsocketProvider } from "y-websocket";
import { Doc, XmlText } from "yjs";

const WEBSOCKET_ENDPOINT = "ws://localhost:1234";
/** TODO: Temporarily using this until editor is split per chapter */
const ALL_CHAPTERS = "1-end";

function getDocFromMap(id: string, yjsDocMap: Map<string, Doc>): Doc {
  let doc = yjsDocMap.get(id);

  if (doc === undefined) {
    doc = new Doc();
    // DEBUG
    doc.on("update", (_a, _b, yDoc) => {
      const yRoot = yDoc.get("root", XmlText).toDelta();
      console.log({ yRoot });
    });
    yjsDocMap.set(id, doc);
  } else {
    doc.load();
  }

  return doc;
}

/**
 * Creates a WebSocket provider for real-time collaboration using Yjs.
 *
 * @remarks
 * This function creates a WebSocket provider for a Yjs document, enabling real-time collaboration.
 * It uses a predefined WebSocket endpoint.
 *
 * @param id - The unique identifier for the document.
 * @param yjsDocMap - A Map containing Yjs Document instances, keyed by their IDs.
 * @returns A Provider instance for managing real-time collaboration.
 *
 * @example
 * ```typescript
 * const docMap = new Map<string, Doc>();
 * const wsProvider = createWebsocketProvider('myDocId', docMap);
 * ```
 */
export function createWebsocketProvider(id: string, yjsDocMap: Map<string, Doc>): Provider {
  const doc = getDocFromMap(id, yjsDocMap);
  const provider = new WebsocketProvider(WEBSOCKET_ENDPOINT, id, doc, {
    connect: false,
  }) as unknown as Provider;
  return provider;
}

/**
 * Generates a collaborative document ID for a Scripture project.
 *
 * @remarks
 * This function uses React's useMemo hook to memoize the generated ID based on the input parameters.
 * The generated ID follows the format: `${projectId}/${bookId}_${chapter}/${category}`.
 *
 * @param projectId - The ID of the project.
 * @param scrRef - The Scripture Reference object.
 * @param category - The category of the document. Defaults to "scripture".
 * @returns A string representing the collaborative document ID, or an empty string if required
 *   parameters are missing.
 *
 * @example
 * ```ts
 * const docId = useCollabDocId("project123", { bookNum: 1 }, "comments");
 * // Returns: "project123/GEN_1-end/comments"
 * ```
 */ export function useCollabDocId(
  projectId: string | undefined,
  scrRef: ScriptureReference | undefined,
  category = "scripture",
): string {
  return useMemo(() => {
    if (!projectId || !scrRef?.bookNum) return "";

    const bookId = Canon.bookNumberToId(scrRef.bookNum);
    // Temporarily using `ALL_CHAPTERS` until the editor is split per chapter. Then this will use
    // `scrRef.chapterNum`.
    return `${projectId}/${bookId}_${ALL_CHAPTERS}/${category}`;
  }, [category, projectId, scrRef?.bookNum]);
}
