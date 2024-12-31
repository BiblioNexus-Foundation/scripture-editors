import { EditorState, LexicalNode } from "lexical";
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

export interface ScripturalEditorContextType {
  initialLexicalState: null | string | EditorState | ((editor: LexicalEditor) => void);
  scripturalInitialConfig: ScripturalInitialConfigType;
  selectedMarker: string | undefined;
  setSelectedMarker: (marker: string | undefined) => void;
  scriptureReference: ScriptureReference | null;
  setScriptureReference: (ref: ScriptureReference | null) => void;
  editorRef: React.RefObject<HTMLDivElement>;
  getSettings: <T>(key: string) => T | undefined;
  updateSettings: (key: string, value: unknown) => void;
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
  const [scriptureReference, setScriptureReference] = useState<ScriptureReference | null>({
    book: initialConfig.bookCode,
    chapter: 1,
    verse: 1,
  });

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

  useEffect(() => {
    const usj = initialConfig.usj;
    if (usj) {
      (async () => {
        const { result: lexicalState } = usjNodeToSerializedLexical(usj);
        if (!lexicalState) {
          throw new Error("Failed to convert usj to lexical state", {
            cause: usj,
          });
        }
        setLexicalState(JSON.stringify({ root: lexicalState }));
      })();
    }
  }, [initialConfig.usj]);

  return (
    <ScripturalEditorContext.Provider
      value={{
        initialLexicalState: lexicalState,
        scripturalInitialConfig: initialConfig,
        selectedMarker,
        setSelectedMarker,
        scriptureReference,
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
