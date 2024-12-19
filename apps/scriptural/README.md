# A PoC for assembling Lexical, PERF, Epitelete and Proskomma

```mermaid
---
title: ScriptureData—Editor flow
---
graph TD
  A[(DB)] --> B([USFM])
  B --> A
  B --> C[Proskomma]
  C --> |Proskomma is only being used to convert USFM to PERF|P([PERF])
  P --> E
  E --> |Epitelete can export USFM but not import it|B
  F[Editor-PERF adapter] -- Transforms PERF --> G[Editor]
  G -- Transforms Editor Format --> F

  E[(epiteleteStore)]
  E -- Epitelete runs operations on PERF --> F
  F -- Epitelete runs operations on PERF --> E
```

## TODO

Low hanging:

- Reorganize conversion code.
- Make Lexical's custom OnChange plugin fire only when there are changes.

Epics:

- Save snapshots to epitelete (onChange with debounce and special handling, or using JSON path)
- Create Plugins for grafts and marks (verses, chapter, headings ,introduction, footnote, etc.)
- Support start translating from a blank editor.

[![Edit in CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/github/codesandbox/codesandbox-template-vite-react/main)

[Configuration](https://codesandbox.io/docs/projects/learn/setting-up/tasks) `.codesandbox/tasks.json` has been added to optimize it for [CodeSandbox](https://codesandbox.io/dashboard).

## Resources

- [CodeSandbox — Docs](https://codesandbox.io/docs/learn)
- [CodeSandbox — Discord](https://discord.gg/Ggarp3pX5H)
- [Vite — GitHub](https://github.com/vitejs/vite)
- [Vite — Docs](https://vitejs.dev/guide/)
