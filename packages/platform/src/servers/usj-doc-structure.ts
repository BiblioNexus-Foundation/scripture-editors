import {
  MarkerObject,
  MarkerContent,
  Usj,
  USJ_TYPE,
  USJ_VERSION,
} from "@biblionexus-foundation/scripture-utilities";
import * as Y from "yjs";

/**
 * Defines the structure of USJ data within a YJS document
 * @param ydoc - The YJS document to initialize with USJ structure
 */
export function initializeUsjStructure(ydoc: Y.Doc): void {
  // Root USJ metadata as a shared map
  const metadata = ydoc.getMap("metadata");
  metadata.set("type", USJ_TYPE);
  metadata.set("version", USJ_VERSION);

  // Content as a shared array
  ydoc.getArray("content");
}

/** Create a USJ-structured YJS document */
export function createUsjDocument(): Y.Doc {
  const ydoc = new Y.Doc();
  initializeUsjStructure(ydoc);
  return ydoc;
}

/**
 * Loads USJ data into a YJS document
 * @param ydoc - The YJS document to load data into
 * @param usj - The USJ data to load
 */
export function loadUsjData(ydoc: Y.Doc, usj: Usj): void {
  const metadata = ydoc.getMap("metadata");
  const content = ydoc.getArray<MarkerContent>("content");

  // Set metadata
  metadata.set("type", usj.type);
  metadata.set("version", usj.version);

  // Clear existing content
  content.delete(0, content.length);

  // Load new content
  usj.content.forEach((item) => {
    content.push([item]);
  });
}

/**
 * Retrieves USJ data from a YJS document
 * @param ydoc - The YJS document to retrieve data from
 * @returns The complete USJ data structure
 * @throws An error if the metadata type or version doesn't match expected values
 */
export function getUsjData(ydoc: Y.Doc): Usj {
  const metadata = ydoc.getMap("metadata");
  const content = ydoc.getArray<MarkerContent>("content");

  // Explicitly check if metadata values match expected constants
  const type = metadata.get("type");
  const version = metadata.get("version");

  if (type !== USJ_TYPE || version !== USJ_VERSION) {
    throw new Error(`Invalid USJ metadata: type=${type}, version=${version}`);
  }

  return {
    type: USJ_TYPE,
    version: USJ_VERSION,
    content: content.toArray(),
  };
}

/**
 * Creates an observer for USJ content changes
 * @param ydoc - The YJS document to observe
 * @param onChange - Callback function that receives change events
 * @param onChange.event - The YJS array event containing change information
 * @param onChange.transaction - The YJS transaction associated with the change
 * @example
 * ```typescript
 * const ydoc = new Y.Doc();
 *
 * observeUsjChanges(ydoc, (event, transaction) => {
 *   const changes = handleUsjChanges(event, transaction);
 *   console.log('Content changed:', changes);
 *
 *   // Access additional transaction information
 *   if (transaction.local) {
 *     console.log('Change was made locally');
 *   }
 * });
 * ```
 */
export function observeUsjChanges(
  ydoc: Y.Doc,
  onChange: (event: Y.YArrayEvent<MarkerContent>, transaction: Y.Transaction) => void,
): void {
  const content = ydoc.getArray<MarkerContent>("content");
  content.observe(onChange);
}

/**
 * Type-safe wrapper for handling USJ content changes
 * @param event - The YJS array event containing change information
 * @param _transaction - The YJS transaction associated with the change (unused)
 * @returns An array of YJS-compatible marker content
 */
export function handleUsjChanges(
  event: Y.YArrayEvent<MarkerContent>,
  _transaction: Y.Transaction,
): MarkerContent[] {
  return event.target.toArray();
}

/**
 * Context information for YJS transactions
 * @example
 * ```typescript
 * const context: UsjTransactionContext = {
 *   local: true, // Indicates if the change was made locally
 *   origin: {
 *     user: 'translator1',
 *     sessionId: '123abc'
 *   } // Custom metadata about the change
 * };
 *
 * // Use the context in a YJS transaction
 * ydoc.transact(() => {
 *   // ... make changes ...
 * }, context);
 * ```
 */
export type UsjTransactionContext = {
  local: boolean;
  origin: unknown;
};

/**
 * Updates a specific marker in the USJ content
 * @param ydoc - The YJS document containing the marker to update
 * @param index - The index of the marker to update
 * @param updates - Partial marker object containing the properties to update
 * @example
 * ```typescript
 * // Update a verse marker's number
 * updateMarker(ydoc, 5, {
 *   type: 'verse',
 *   marker: 'v',
 *   number: '6'
 * });
 *
 * // Update a paragraph's alignment
 * updateMarker(ydoc, 10, {
 *   align: 'center'
 * });
 * ```
 */
export function updateMarker(ydoc: Y.Doc, index: number, updates: Partial<MarkerObject>): void {
  const content = ydoc.getArray("content");
  const currentMarker = content.get(index);

  if (typeof currentMarker === "object" && currentMarker !== null) {
    ydoc.transact(() => {
      content.delete(index, 1);
      content.insert(index, [
        {
          ...currentMarker,
          ...updates,
        },
      ]);
    });
  }
}

/**
 * Inserts a new marker at a specific position
 * @param ydoc - The YJS document to insert the marker into
 * @param index - The position at which to insert the marker
 * @param markerContent - The marker content to insert
 * @example
 * ```typescript
 * // Insert a verse marker
 * insertMarker(ydoc, 5, {
 *   type: 'verse',
 *   marker: 'v',
 *   number: '1',
 *   sid: 'GEN 1:1'
 * });
 *
 * // Insert a paragraph marker with content
 * insertMarker(ydoc, 10, {
 *   type: 'para',
 *   marker: 'p',
 *   content: ['In the beginning God created the heavens and the earth.']
 * });
 * ```
 */
export function insertMarker(ydoc: Y.Doc, index: number, markerContent: MarkerContent): void {
  const content = ydoc.getArray("content");
  ydoc.transact(() => {
    content.insert(index, [markerContent]);
  });
}

/**
 * Deletes a marker at a specific position
 * @param ydoc - The YJS document containing the marker to delete
 * @param index - The index of the marker to delete
 * @example
 * ```typescript
 * // Delete a marker
 * deleteMarker(ydoc, 5);
 *
 * // Delete multiple markers in a transaction
 * ydoc.transact(() => {
 *   deleteMarker(ydoc, 10);
 *   deleteMarker(ydoc, 11);
 * });
 * ```
 */
export function deleteMarker(ydoc: Y.Doc, index: number): void {
  const content = ydoc.getArray("content");
  ydoc.transact(() => {
    content.delete(index, 1);
  });
}
