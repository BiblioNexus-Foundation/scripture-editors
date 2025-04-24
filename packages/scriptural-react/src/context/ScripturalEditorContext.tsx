import { $getEditor, EditorState, LexicalNode } from "lexical";
import { EditorThemeClasses } from "lexical";
import { LexicalEditor } from "lexical";
import { usjNodeToSerializedLexical } from "shared/converters/usj";
import { UsjDocument } from "shared/converters/usj/core/usj";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { ScriptureReference } from "shared-react/plugins/ScriptureReferencePlugin";

export type EditorSettings = {
  [key: string]: unknown;
};

/**
 * Source tags that identify what triggered a reference change
 */
export type ReferenceChangeSource =
  | "user_navigation" // User clicked a reference navigation control
  | "editor_content" // Content changes in the editor triggered the update
  | "external_app" // External application set the reference
  | "initial_load" // Initial reference set during load
  | "sync" // Reference synced from another component
  | string; // Allow for custom source tags

/**
 * Information about a reference change event
 */
export interface ReferenceChangeEvent {
  reference: ScriptureReference | null;
  source: ReferenceChangeSource;
  metadata?: Record<string, unknown>; // Optional additional data about the change
}

export interface ScripturalEditorContextType {
  initialLexicalState: null | string | EditorState | ((editor: LexicalEditor) => void);
  scripturalInitialConfig: ScripturalInitialConfigType;
  selectedMarker: string | undefined;
  setSelectedMarker: (marker: string | undefined) => void;
  scriptureReference: ScriptureReference | null;
  setScriptureReference: (
    ref: ScriptureReference | null,
    source?: ReferenceChangeSource,
    metadata?: Record<string, unknown>,
  ) => void;
  editorRef: React.RefObject<HTMLDivElement>;
  getSettings: <T>(key: string) => T | undefined;
  updateSettings: (key: string, value: unknown) => void;
}

/**
 * Interface for scripture reference handlers
 * Both internal and external handlers implement this interface
 */
export interface ScriptureReferenceHandler {
  /**
   * Get the current reference
   */
  getReference: () => ScriptureReference | null;

  /**
   * Update the reference
   * @param ref New reference
   * @param source Tag identifying what triggered the change
   * @param metadata Optional additional data about the change
   */
  setReference: (
    ref: ScriptureReference | null,
    source?: ReferenceChangeSource,
    metadata?: Record<string, unknown>,
  ) => void;

  /**
   * Subscribe to reference changes
   * @param callback Function to call when reference changes
   * @returns Unsubscribe function
   */
  subscribe: (callback: (event: ReferenceChangeEvent) => void) => () => void;
}

/**
 * Default implementation of ScriptureReferenceHandler
 * Used internally when no external handler is provided
 */
class DefaultReferenceHandler implements ScriptureReferenceHandler {
  private reference: ScriptureReference | null;
  private subscribers: ((event: ReferenceChangeEvent) => void)[] = [];

  constructor(initialReference: ScriptureReference | null) {
    this.reference = initialReference;
  }

  getReference(): ScriptureReference | null {
    return this.reference;
  }

  setReference(
    ref: ScriptureReference | null,
    source: ReferenceChangeSource = "user_navigation",
    metadata?: Record<string, unknown>,
  ): void {
    this.reference = ref;
    this.notifySubscribers({
      reference: ref,
      source,
      metadata,
    });
  }

  subscribe(callback: (event: ReferenceChangeEvent) => void): () => void {
    this.subscribers.push(callback);
    // Immediately notify with current value
    callback({
      reference: this.reference,
      source: "initial_load",
    });

    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  private notifySubscribers(event: ReferenceChangeEvent): void {
    this.subscribers.forEach((callback) => callback(event));
  }
}

export type ScripturalInitialConfigType = {
  bookCode: string;
  usj?: UsjDocument;
  initialLexicalState?: null | string | EditorState | ((editor: LexicalEditor) => void);
  onError: (error: Error, _editor: LexicalEditor) => void;
  editable?: boolean;
  theme?: EditorThemeClasses;
  nodes?: LexicalNode[];
  initialSettings?: EditorSettings;
  scriptureReferenceHandler?: ScriptureReferenceHandler;
  initialScriptureReference?: ScriptureReference | null;
};

const ScripturalEditorContext = createContext<ScripturalEditorContextType | undefined>(undefined);

export function ScripturalEditorProvider({
  children,
  initialConfig,
}: {
  children: ReactNode;
  initialConfig: ScripturalInitialConfigType;
}) {
  if (initialConfig.usj && initialConfig.initialLexicalState) {
    throw new Error("Cannot provide both usj and lexicalState");
  }
  const [lexicalState, setLexicalState] = useState<
    string | EditorState | ((editor: LexicalEditor) => void)
  >(initialConfig.initialLexicalState ?? "");
  const [selectedMarker, setSelectedMarker] = useState<string>();

  // Default reference if no initial reference provided
  const defaultReference: ScriptureReference = {
    book: initialConfig.bookCode,
    chapter: 1,
    verse: 1,
  };

  // Create reference handler instance (internal or external)
  const referenceHandlerRef = useRef<ScriptureReferenceHandler>(
    initialConfig.scriptureReferenceHandler ||
      new DefaultReferenceHandler(initialConfig.initialScriptureReference ?? defaultReference),
  );

  // React state that reflects the current reference
  const [currentReference, setCurrentReference] = useState<ScriptureReference | null>(
    referenceHandlerRef.current.getReference(),
  );

  // Set up subscription to reference handler
  useEffect(() => {
    // If the handler changes (unlikely after initial setup), update the ref
    if (initialConfig.scriptureReferenceHandler) {
      referenceHandlerRef.current = initialConfig.scriptureReferenceHandler;
    }

    // Subscribe to reference changes from the handler
    const unsubscribe = referenceHandlerRef.current.subscribe((event) => {
      setCurrentReference(event.reference);
    });

    return unsubscribe;
  }, [initialConfig.scriptureReferenceHandler]);

  // Function to update reference through the handler
  const setScriptureReference = useCallback(
    (
      ref: ScriptureReference | null,
      source: ReferenceChangeSource = "user_navigation",
      metadata?: Record<string, unknown>,
    ): void => {
      referenceHandlerRef.current.setReference(ref, source, metadata);
    },
    [],
  );

  const [settings, setSettings] = useState<EditorSettings>(initialConfig.initialSettings ?? {});

  const getSettings = useCallback(
    function <T>(key: string): T | undefined {
      return settings[key] as T;
    },
    [settings],
  );

  const updateSettings = useCallback((key: string, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const editorRef = useRef<HTMLDivElement>(null);

  const convertToLexicalState = useCallback(
    (usjDoc: UsjDocument) => {
      try {
        const { result: lexicalState } = usjNodeToSerializedLexical(usjDoc);
        if (!lexicalState) {
          throw new Error("Failed to convert USJ to Lexical state");
        }
        return JSON.stringify({ root: lexicalState });
      } catch (error) {
        initialConfig.onError(error as Error, $getEditor());
        return JSON.stringify({
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: null,
                format: "",
                indent: 0,
                type: "block",
                version: 1,
                attributes: {
                  "data-code": initialConfig.bookCode,
                  "data-marker": "id",
                  "data-type": "book",
                },
                tag: "p",
              },
            ],
          },
        });
      }
    },
    [initialConfig.onError],
  );
  useEffect(() => {
    if (initialConfig.initialLexicalState) {
      return;
    }
    try {
      const usjDoc = initialConfig.usj ?? createEmptyUsj(initialConfig.bookCode);
      const lexicalState2 = convertToLexicalState(usjDoc);
      setLexicalState(lexicalState2);
    } catch (error) {
      initialConfig.onError(error as Error, $getEditor());
    }
  }, [
    initialConfig.usj,
    initialConfig.bookCode,
    initialConfig.initialLexicalState,
    convertToLexicalState,
  ]);

  return (
    <ScripturalEditorContext.Provider
      value={{
        initialLexicalState: lexicalState,
        scripturalInitialConfig: initialConfig,
        selectedMarker,
        setSelectedMarker,
        scriptureReference: currentReference,
        setScriptureReference,
        editorRef,
        getSettings,
        updateSettings,
      }}
    >
      {children}
    </ScripturalEditorContext.Provider>
  );
}

export function useScripturalComposerContext() {
  const context = useContext(ScripturalEditorContext);
  if (context === undefined) {
    throw new Error("useScripturalComposerContext must be used within an ScripturalEditorProvider");
  }
  return context;
}

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
