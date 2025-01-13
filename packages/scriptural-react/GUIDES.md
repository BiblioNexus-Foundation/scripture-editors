# Guides

This document contains tutorials and best practices for using the `@scriptural/react` package.

## Table of Contents

- [Guides](#guides)
  - [Table of Contents](#table-of-contents)
  - [Creating Settings Plugins](#creating-settings-plugins)
    - [Font Size Plugin Example](#font-size-plugin-example)
    - [Best Practices for Settings Plugins](#best-practices-for-settings-plugins)

## Creating Settings Plugins

This tutorial shows how to create a font size settings plugin and integrate it into the toolbar.

### Font Size Plugin Example

1. First, create the types and defaults for the font size settings:

```typescript
// plugins/FontSizePlugin/types.ts
export interface FontSizeSettings {
  fontSize: number;
}

export const FONT_SIZE_SETTINGS = {
  fontSize: "fontSize.size",
} as const;

export const DEFAULT_FONT_SIZE_SETTINGS: FontSizeSettings = {
  fontSize: 16,
};

export const FONT_SIZE_OPTIONS = [12, 14, 16, 18, 20, 24] as const;
```

2. Create a hook to manage the font size settings:

```typescript
// plugins/FontSizePlugin/useFontSizeSettings.ts
import { useCallback } from "react";
import { useScripturalComposerContext } from "@scriptural/react";
import { FONT_SIZE_SETTINGS, DEFAULT_FONT_SIZE_SETTINGS } from "./types";

export function useFontSizeSettings() {
  const { getSettings, updateSettings } = useScripturalComposerContext();

  const fontSize = getSettings(FONT_SIZE_SETTINGS.fontSize) ?? DEFAULT_FONT_SIZE_SETTINGS.fontSize;

  const setFontSize = useCallback(
    (size: number) => {
      updateSettings(FONT_SIZE_SETTINGS.fontSize, size);
    },
    [updateSettings],
  );

  return {
    fontSize,
    setFontSize,
  };
}
```

3. Create a toolbar button component for font size:

```typescript
// plugins/FontSizePlugin/FontSizeButton.tsx
import { useEffect } from 'react';
import { useFontSizeSettings } from './useFontSizeSettings';
import { FONT_SIZE_OPTIONS } from './types';

export function FontSizeButton() {
  const { fontSize, setFontSize } = useFontSizeSettings();

  // Apply font size to editor
  useEffect(() => {
    const editor = document.querySelector('.contentEditable');
    if (editor) {
      editor.style.fontSize = `${fontSize}px`;
    }
  }, [fontSize]);

  return (
    <div className="toolbar-button-with-dropdown">
      <button className="toolbar-button">
        <i>format_size</i>
        <span>{fontSize}px</span>
      </button>
      <div className="toolbar-dropdown">
        {FONT_SIZE_OPTIONS.map((size) => (
          <button
            key={size}
            onClick={() => setFontSize(size)}
            className={fontSize === size ? 'active' : ''}
          >
            {size}px
          </button>
        ))}
      </div>
    </div>
  );
}
```

4. Add styles for the font size button:

```css
/* styles/scriptural-editor.css */
.toolbar-button-with-dropdown {
  position: relative;
  display: inline-block;
}

.toolbar-button-with-dropdown .toolbar-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-button-with-dropdown .toolbar-button span {
  font-size: 0.8rem;
}

.toolbar-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.toolbar-button-with-dropdown:hover .toolbar-dropdown {
  display: flex;
  flex-direction: column;
}

.toolbar-dropdown button {
  padding: 8px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
}

.toolbar-dropdown button:hover {
  background: #f5f5f5;
}

.toolbar-dropdown button.active {
  background: #e0e0e0;
}
```

5. Add the font size button to the toolbar:

```typescript
// plugins/ToolbarPlugin/index.tsx
import { FontSizeButton } from '../FontSizePlugin/FontSizeButton';

export function ToolbarDefault({ onSave }: { onSave?: ScripturalToolbarSettings["onSave"] }) {
  return (
    <ToolbarContainer>
      <ToolbarSection>
        <HistoryButtons />
        <hr />
        <SaveButton onSave={onSave} />
        <hr />
        <ViewButton />
        <FormatButton />
        <FontSizeButton /> {/* Add the font size button */}
        <EnhancedCursorToggleButton />
        <hr />
      </ToolbarSection>
      <ToolbarSection>
        <ContextMenuTriggerButton />
        <MarkerInfo />
        <ScriptureReferenceInfo />
        <hr />
      </ToolbarSection>
      <ToolbarMarkerSections />
    </ToolbarContainer>
  );
}
```

6. Initialize the settings in your editor:

```typescript
import { ScripturalEditorComposer } from '@scriptural/react';
import { DEFAULT_FONT_SIZE_SETTINGS } from './plugins/FontSizePlugin/types';

function Editor() {
  const initialConfig = {
    // ... other config options ...
    initialSettings: {
      ...DEFAULT_FONT_SIZE_SETTINGS,
      // Override default if needed
      "fontSize.size": 18,
    },
  };

  return (
    <ScripturalEditorComposer initialConfig={initialConfig}>
      <ToolbarDefault />
      {/* Other plugins */}
    </ScripturalEditorComposer>
  );
}
```

### Best Practices for Settings Plugins

1. **Namespacing**: Use descriptive, namespaced keys for settings to avoid conflicts:

   ```typescript
   const SETTINGS = {
     fontSize: "fontSize.size",
     fontFamily: "fontSize.family",
   };
   ```

2. **Type Safety**: Define interfaces for your settings:

   ```typescript
   interface Settings {
     fontSize: number;
     fontFamily: string;
   }
   ```

3. **Default Values**: Always provide sensible defaults:

   ```typescript
   const DEFAULT_SETTINGS = {
     fontSize: 16,
     fontFamily: "Arial",
   };
   ```

4. **UI Integration**: Follow the toolbar's design patterns:

   - Use Material Icons for consistency
   - Follow the existing button styles
   - Use dropdowns for multiple options
   - Add appropriate hover states and active indicators

5. **Performance**: Use `useCallback` for functions and `useEffect` for side effects:

   ```typescript
   const setFontSize = useCallback(
     (size: number) => {
       updateSettings(SETTINGS.fontSize, size);
     },
     [updateSettings],
   );

   useEffect(() => {
     // Apply settings changes
   }, [settingValue]);
   ```
