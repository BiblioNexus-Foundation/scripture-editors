# @scriptural/react

> **Note**: Scriptural is currently in alpha stage. The API may undergo significant changes before the first stable release. While we encourage testing and feedback, it is not yet recommended for production use.

A React-based Bible editor component library built on top of [Lexical](https://lexical.dev/). This package provides components, hooks, and utilities for creating scripture editing applications.

## Installation

```bash
npm install @scriptural/react
```

## Quick Start

Here's a simple example of creating a scripture editor:

```tsx
import React from "react";
import { ScripturalEditorComposer, ToolbarDefault } from "@scriptural/react";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import "@scriptural/react/styles/scriptural-editor.css";

// Sample USJ data (normally you'd load this from a file or API)
const sampleUsj = {
  type: "USJ",
  version: "0.2.1",
  content: [
    {
      type: "chapter",
      marker: "c",
      number: "1",
    },
    {
      type: "para",
      marker: "p",
      content: [
        {
          type: "verse",
          marker: "v",
          number: "1",
        },
        "In the beginning...",
      ],
    },
  ],
};

function SimpleEditor() {
  const handleSave = (usj) => {
    console.log("Saving USJ:", usj);
  };

  const handleError = (error) => {
    console.error("Editor error:", error);
  };

  const handleHistoryChange = (editorState) => {
    // Called whenever the history state changes (e.g., after undo/redo)
    console.log("History changed:", editorState);
  };

  const initialConfig = {
    bookCode: "GEN",
    usj: sampleUsj,
    onError: handleError,
    editable: true,
    initialSettings: {
      "toolbar.enhancedCursorPosition": true,
      "toolbar.contextMenuTriggerKey": "\\",
    },
  };

  return (
    <div className="editor-container">
      <ScripturalEditorComposer initialConfig={initialConfig}>
        <ToolbarDefault onSave={handleSave} />
        <HistoryPlugin onChange={handleHistoryChange} />
      </ScripturalEditorComposer>
    </div>
  );
}

export default SimpleEditor;
```

Add some basic styles:

```css
.editor-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.contentEditable {
  min-height: 400px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
```

This creates a basic scripture editor with:

- A toolbar with standard editing actions
- Built-in scripture reference tracking
- Built-in context menu for inserting scripture elements (triggered with `\`)
- Built-in enhanced cursor positioning
- Basic error handling
- Save functionality

The `ScripturalEditorComposer` component automatically includes several essential plugins:

- `ContentEditablePlugin` for basic editing
- `ScripturalHandlersPlugin` for handling scripture-specific interactions
- `ScriptureReferencePlugin` for tracking references
- `ChapterVerseUpdatePlugin` for managing chapter and verse updates

Additional plugins like `HistoryPlugin` for undo/redo and `CursorHandlerPlugin` for enhanced cursor positioning can be added as needed. See our [GUIDES.md](./GUIDES.md) for examples of adding these plugins.

For more advanced examples and customization options, see our [GUIDES.md](./GUIDES.md).

## Requirements

- React >= 18.3.1
- React DOM >= 18.3.1

## Features

- Rich text editing capabilities specifically designed for biblical content
- Scripture reference tracking
- Marker management for biblical text formatting
- Customizable toolbar with common editing actions
- Support for verse blocks and formatting markers
- Context menu for quick marker insertion
- History management (undo/redo)
- Enhanced cursor positioning

## Extending Lexical

Scriptural is built on top of Meta's [Lexical](https://lexical.dev/) framework, extending it with scripture-specific functionality. Here's how Scriptural enhances Lexical:

### Custom Nodes

Scriptural adds scripture-specific nodes to Lexical's node system:

- `ScriptureElementNode`: Base node for scripture elements
- `InlineNode`
- `BlockNode`

### Plugin Types

You can create several types of plugins for Scriptural:

1. **Scripture Marker Plugins**

   - Handle USFM markers and formatting
   - Example: Creating custom markers for specific Bible translations
   - See: [Creating Settings Plugins](./GUIDES.md)

2. **Toolbar Plugins**

   - Add new functionality to the editor toolbar
   - Example: Font size control, custom formatting options
   - See: [Font Size Plugin Example](./GUIDES.md#font-size-plugin-example)

3. **Context Menu Plugins**

   - Extend the right-click context menu
   - Add quick actions for scripture editing
   - Based on Lexical's `FloatingTextFormatToolbarPlugin`

4. **Reference Tracking Plugins**
   - Track and manage scripture references
   - Handle chapter and verse navigation
   - Example: The built-in `ScriptureReferencePlugin`

### Lexical Integration

Scriptural uses several Lexical concepts that you should be familiar with:

1. **Editor State**

   - Scriptural extends Lexical's EditorState with scripture-specific data
   - Uses Lexical's immutable state management
   - [Lexical State Documentation](https://lexical.dev/docs/concepts/editor-state)

2. **Commands**

   - Custom commands for scripture operations
   - Built on Lexical's command system
   - [Lexical Commands Documentation](https://lexical.dev/docs/concepts/commands)

3. **Node Transform**
   - Scripture-specific node transformations
   - Handles USFM to Lexical node conversion
   - [Lexical Nodes Documentation](https://lexical.dev/docs/concepts/nodes)

For more information on Lexical concepts, visit the [Lexical Documentation](https://lexical.dev/docs/intro).

## Main Components

### ScripturalEditorComposer

The main component that sets up the editor environment:

```tsx
import { ScripturalEditorComposer } from "@scriptural/react";

function Editor({ usj, onSave }) {
  const initialConfig = {
    bookCode: "GEN",
    usj,
    onError: (error) => console.error(error),
    editable: true,
    onSave,
  };

  return (
    <ScripturalEditorComposer initialConfig={initialConfig}>
      {/* Editor plugins and content */}
    </ScripturalEditorComposer>
  );
}
```

For complete API documentation, see [API.md](./API.md).
For tutorials and guides, see [GUIDES.md](./GUIDES.md).

## License

MIT - See [LICENSE](./LICENSE) for more details.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.
