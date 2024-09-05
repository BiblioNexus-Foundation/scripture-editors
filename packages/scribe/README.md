# Scripture Editor for Scribe using USJ.

<div align="center">

[![Build Status][github-actions-status]][github-actions-url]
[![CodeQL][gitghub-codeql-status]][gitghub-codeql-url]
[![Github Tag][npm-version-image]][npm-version-url]

</div>

A Scripture editor React component that works on USJ Scripture data.

## Install

```sh
npm install @biblionexus-foundation/scribe-editor
```

## Usage

**Note:** this is an [uncontrolled React component](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components).

```typescript
import { useState, useMemo, SyntheticEvent, useRef, useEffect } from "react";
import { Editor, EditorRef } from "@biblionexus-foundation/scribe-editor";
import { getViewOptions } from "@biblionexus-foundation/scribe-editor";
import { DEFAULT_VIEW_MODE } from "@biblionexus-foundation/scribe-editor";
import { UsjNodeOptions } from "@biblionexus-foundation/scribe-editor";
import { immutableNoteCallerNodeName } from "@biblionexus-foundation/scribe-editor";
import { BookCode, Usj } from "@biblionexus-foundation/scripture-utilities";

const defaultUsj: Usj = {
  type: "USJ",
  version: "0.2.1",
  content: [],
};
export interface ScriptureReference {
  bookCode: BookCode;
  chapterNum: number;
  verseNum: number;
}
const defaultScrRef: ScriptureReference = {
  /* PSA */ bookCode: "PSA",
  chapterNum: 1,
  verseNum: 1,
};
function App() {
  const [usj, setUsj] = useState<Usj | undefined>();
  const [initialRender, setInitialRender] = useState(true);
  const [scrRef, setScrRef] = useState(defaultScrRef);
  const [viewMode] = useState(DEFAULT_VIEW_MODE);

  const editorRef = useRef<EditorRef>(null!);
  const previousUsjRef = useRef<Usj | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      usj && editorRef.current?.setUsj(usj);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [usj]);

  const nodeOptions: UsjNodeOptions = {
    [immutableNoteCallerNodeName]: {
      onClick: (e: SyntheticEvent) => {
        console.log({ e });
      },
    },
  };
  const viewOptions = useMemo(() => getViewOptions(viewMode), [viewMode]);
  const onChange = async (usj: Usj) => {
    if (initialRender) {
      setInitialRender(false);
      return;
    }
  };

  useEffect(() => {
    if (scrRef) {
      console.log("scrRef", scrRef);
    }
  }, [scrRef]);

  return (
    <div>
      <Editor
        usjInput={defaultUsj}
        ref={editorRef}
        onChange={handleInputChange}
        viewOptions={viewOptions}
        nodeOptions={nodeOptions}
        scrRef={scrRef}
        setScrRef={setScrRef}
      />
    </div>
  );
}

```

## Develop in App

To develop an editor in a target application you can use [yalc](https://www.npmjs.com/package/yalc) to link the editor in without having to publish to NPM every time something changes.

1. In this monorepo, publish the editor to `yalc`, e.g.:
   ```bash
   nx devpub scribe
   ```
2. In the target application repo, link from `yalc`:
   ```bash
   yalc link @biblionexus-foundation/scribe-editor
   ```
3. In this monorepo, make changes and re-publish the editor (see step 2).
4. When you have finished developing in the target application repo, unlink from `yalc`:
   ```bash
   yalc remove @biblionexus-foundation/scribe-editor && npm i
   ```

## License

[MIT][github-license] © [BiblioNexus Foundation](https://biblionexus.org/)

<!-- define variables used above -->

[github-actions-status]: https://github.com/BiblioNexus-Foundation/scripture-editors/actions/workflows/test-publish.yml/badge.svg
[github-actions-url]: https://github.com/BiblioNexus-Foundation/scripture-editors/actions
[gitghub-codeql-status]: https://github.com/BiblioNexus-Foundation/scripture-editors/actions/workflows/codeql.yml/badge.svg
[gitghub-codeql-url]: https://github.com/BiblioNexus-Foundation/scripture-editors/actions/workflows/codeql.yml
[npm-version-image]: https://img.shields.io/npm/v/@biblionexus-foundation/scribe-editor
[npm-version-url]: https://github.com/BiblioNexus-Foundation/scripture-editors/releases
[github-license]: https://github.com/BiblioNexus-Foundation/scripture-editors/blob/main/packages/scribe/LICENSE
