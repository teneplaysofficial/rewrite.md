# rewrite.md

> A programmable Markdown transformer for safe rewriting, dynamic injection, and front-matter processing

[![ci](https://github.com/teneplaysofficial/rewrite.md/actions/workflows/ci.yml/badge.svg)](https://github.com/teneplaysofficial/rewrite.md)
[![npm version](https://img.shields.io/npm/v/rewrite.md.svg?logo=npm&color=brightgreen)](https://www.npmjs.com/package/rewrite.md)
[![Downloads](https://img.shields.io/npm/dt/rewrite.md?logo=npm)](https://www.npmjs.com/package/rewrite.md)

## Installation

```sh
npm install rewrite.md
# or
pnpm add rewrite.md
# or
bun add rewrite.md
```

## Usage

### `rewriteMdComment`

#### Basic Example

```ts
import { rewriteMdComment } from 'rewrite.md';

const md = `
# Project

<!-- version:start -->
0.0.0
<!-- version:end -->

## License
MIT
`;

const result = rewriteMdComment(md, {
  version: '1.2.3',
});

console.log(result);
```

**Output:**

```md
# Project

<!-- version:start -->

1.2.3

<!-- version:end -->

## License

MIT
```

#### Multiple Blocks

You can rewrite multiple sections at once:

```ts
const md = `
<!-- version:start -->0.0.0<!-- version:end -->
<!-- author:start -->unknown<!-- author:end -->
`;

const result = rewriteMdComment(md, {
  version: '2.0.0',
  author: 'TenE',
});
```

#### Custom Markers

Change the default `start` / `end` markers:

```ts
const md = `
<!-- stats:begin -->
old value
<!-- stats:finish -->
`;

const result = rewriteMdComment(
  md,
  { stats: '⭐ 120 stars' },
  {
    startMarker: 'begin',
    endMarker: 'finish',
  },
);
```

#### Buffer Support

If you pass a `Buffer`, the return type depends on `preserveType`.

```ts
const buffer = Buffer.from(`
<!-- build:start -->
pending
<!-- build:end -->
`);

const result = rewriteMdComment(buffer, { build: 'success' }, { preserveType: true });

console.log(Buffer.isBuffer(result)); // true
```

#### Real-World Example (Sync Monorepo Package List)

```ts
import fs from 'node:fs';
import { rewriteMdComment } from 'rewrite.md';

const packages = ['core', 'cli', 'plugin'];
const table = packages.map((p) => `- @myorg/${p}`).join('\n');
const readme = fs.readFileSync('README.md', 'utf8');
const updated = rewriteMdComment(readme, {
  packages: table,
});

fs.writeFileSync('README.md', updated);
```

#### Marker Format

Blocks must follow this structure:

```md
<!-- key:start -->

content to replace

<!-- key:end -->
```

- `key` corresponds to a property in the `data` object
- `start` and `end` are configurable via options
