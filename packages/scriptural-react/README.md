# @scriptural/react

> **Note**: Scriptural is currently in alpha stage. The API may undergo significant changes before the first stable release. While we encourage testing and feedback, it is not yet recommended for production use.

A React-based Bible editor component library built on top of [Lexical](https://lexical.dev/). This package provides components, hooks, and utilities for creating scripture editing applications.

## Installation

```bash
npm install @scriptural/react
```

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
