# scripture-utilities

<div align="center">

[![Build Status][github-actions-status]][github-actions-url]
[![CodeQL][gitghub-codeql-status]][gitghub-codeql-url]
[![Github Tag][npm-version-image]][npm-version-url]

</div>

Utilities for working with Scripture data.

## Features

For USX/USJ v3.1:

- USJ to USX converter.
- USX to USJ converter.

## Install

```sh
npm install @biblionexus-foundation/scripture-utilities
```

## Usage

```ts
import { usxStringToUsj, usjToUsxString } from "@biblionexus-foundation/scripture-utilities";

const emptyUsx = '<usx version="3.1" />';
const usx = `
<?xml version="1.0" encoding="utf-8"?>
<usx version="3.1">
  <book code="PSA" style="id">World English Bible (WEB)</book>
  <para style="mt1">The Psalms</para>
  <chapter number="1" style="c" sid="PSA 1" />
  <para style="q1">
    <verse number="1" style="v" sid="PSA 1:1" />Blessed is the man who doesn’t walk in the counsel of the wicked,</para>
  <para style="q2" vid="PSA 1:1">nor stand on the path of sinners,</para>
  <para style="q2" vid="PSA 1:1">nor sit in the seat of scoffers;<verse eid="PSA 1:1" /></para>
</usx>
`;

const emptyUsj = usxStringToUsj(emptyUsx);
const usj = usxStringToUsj(usx);

const newUsx = usjToUsxString(usj);
```

## Building

Run `nx build utilities` to build the library.

## Running unit tests

Run `nx test utilities` to execute the unit tests via [Jest](https://jestjs.io).

## License

[MIT][github-license] © [BiblioNexus Foundation](https://biblionexus.org/)

<!-- define variables used above -->

[github-actions-status]: https://github.com/BiblioNexus-Foundation/scripture-utilities/actions/workflows/test-publish.yml/badge.svg
[github-actions-url]: https://github.com/BiblioNexus-Foundation/scripture-utilities/actions
[gitghub-codeql-status]: https://github.com/BiblioNexus-Foundation/scripture-editors/actions/workflows/codeql.yml/badge.svg
[gitghub-codeql-url]: https://github.com/BiblioNexus-Foundation/scripture-editors/actions/workflows/codeql.yml
[npm-version-image]: https://img.shields.io/npm/v/@biblionexus-foundation/scripture-utilities
[npm-version-url]: https://github.com/BiblioNexus-Foundation/scripture-utilities/releases
[github-license]: https://github.com/BiblioNexus-Foundation/scripture-utilities/blob/main/packages/utilities/LICENSE
