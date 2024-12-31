import { LexicalNode } from "lexical";
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

interface ScripturalEditorContextType {
  initialLexicalState: string;
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
  usj: UsjDocument;
  onError: (error: Error, _editor: LexicalEditor) => void;
  editable?: boolean;
  theme?: EditorThemeClasses;
  nodes?: LexicalNode[];
  initialSettings?: EditorSettings;
};

export type EditorSettings = {
  [key: string]: unknown;
};

const ScripturalEditorContext = createContext<ScripturalEditorContextType | undefined>(undefined);

export function ScripturalEditorProvider({
  children,
  initialConfig,
}: {
  children: ReactNode;
  initialConfig: ScripturalInitialConfigType;
}) {
  const [lexicalState, setLexicalState] = useState("");
  const [selectedMarker, setSelectedMarker] = useState<string>();
  const [scriptureReference, setScriptureReference] = useState<ScriptureReference | null>({
    book: initialConfig.bookCode,
    chapter: 1,
    verse: 1,
  });
  const editorRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<EditorSettings>(initialConfig.initialSettings ?? {});

  useEffect(() => {
    (async () => {
      const { result: lexicalState } = usjNodeToSerializedLexical(initialConfig.usj);
      console.log({ lexicalState });
      setLexicalState(JSON.stringify({ root: lexicalState }));
    })();
  }, [initialConfig.usj]);

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
