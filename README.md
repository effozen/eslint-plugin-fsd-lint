# 🚀 eslint-plugin-fsd-lint

[![npm version](https://img.shields.io/npm/v/eslint-plugin-fsd-lint)](https://www.npmjs.com/package/eslint-plugin-fsd-lint)
[![npm downloads](https://img.shields.io/npm/dt/eslint-plugin-fsd-lint)](https://www.npmjs.com/package/eslint-plugin-fsd-lint)
[![npm bundle size](https://img.shields.io/bundlephobia/min/eslint-plugin-fsd-lint)](https://bundlephobia.com/package/eslint-plugin-fsd-lint)
[![License](https://img.shields.io/npm/l/eslint-plugin-fsd-lint)](https://github.com/effozen/eslint-plugin-fsd-lint/blob/main/LICENSE)

[English](README.md) | [한국어](README.ko.md)

> ESLint 9 plugin for enforcing Feature-Sliced Design rules with Flat Config support.

## Overview

`eslint-plugin-fsd-lint` helps you keep a Feature-Sliced Design codebase predictable as it grows.
It focuses on the rules that usually start drifting first:

- layer boundaries
- public API discipline
- same-layer slice isolation
- relative import hygiene
- UI/business-logic separation
- stable import ordering

It is built for modern ESLint setups and works with:

- ESLint 9+
- Flat Config
- JavaScript and TypeScript projects
- Windows and Unix-style paths
- both `@shared/...` and `@/shared/...` aliases
- custom folder naming like `1_app`, `2_pages`, `5_features`
- custom source roots through `rootPath`

---

## Installation

Install the plugin and make sure ESLint 9+ is available in your project.

```shell
npm install --save-dev eslint eslint-plugin-fsd-lint
```

Or with pnpm:

```shell
pnpm add -D eslint eslint-plugin-fsd-lint
```

---

## Quick Start

### Recommended Preset

Use the built-in preset if you want sensible defaults with minimal setup.

```js
import fsdPlugin from 'eslint-plugin-fsd-lint';

export default [
  fsdPlugin.configs.recommended,
];
```

### Strict Preset

Use `strict` when you want all architectural checks to fail the build.

```js
import fsdPlugin from 'eslint-plugin-fsd-lint';

export default [
  fsdPlugin.configs.strict,
];
```

### Base Preset

Use `base` if you are gradually adopting FSD rules in an existing codebase.

```js
import fsdPlugin from 'eslint-plugin-fsd-lint';

export default [
  fsdPlugin.configs.base,
];
```

### Manual Configuration

Use manual configuration when you want fine-grained control over each rule.

```js
import fsdPlugin from 'eslint-plugin-fsd-lint';

export default [
  {
    plugins: {
      fsd: fsdPlugin,
    },
    rules: {
      'fsd/forbidden-imports': 'error',
      'fsd/no-relative-imports': 'error',
      'fsd/no-public-api-sidestep': 'error',
      'fsd/no-cross-slice-dependency': 'error',
      'fsd/no-ui-in-business-logic': 'error',
      'fsd/no-global-store-imports': 'error',
      'fsd/ordered-imports': 'warn',
    },
  },
];
```

---

## What The Rules Enforce

- **Layer direction**: higher layers cannot import from lower-priority layers they should not know about.
- **Slice isolation**: one slice cannot reach directly into another slice in the same layer.
- **Public APIs**: other slices should import through `index.ts`, `index.js`, or allowed segment-level public entry points.
- **Stable imports**: cross-slice and cross-layer imports should use aliases instead of brittle relative paths.
- **Business logic purity**: model/api/lib code should not pull UI code into places where it does not belong.
- **Readable import blocks**: FSD imports are grouped in a predictable order.

---

## Common Configuration Options

Several rules support the same core options.

| Option | Purpose | Example |
| --- | --- | --- |
| `alias` | Defines the import alias format for your project. | `{ value: '@', withSlash: false }` |
| `rootPath` | Tells the plugin where the FSD tree starts in the absolute file path. Useful for monorepos or nested apps. | `'/apps/web/src/'` |
| `folderPattern` | Supports numbered or customized layer directory names. | `{ enabled: true, regex: '^(\\d+_)?(.*)', extractionGroup: 2 }` |
| `testFilesPatterns` | Allows test files to bypass specific architectural rules. | `['**/*.test.*', '**/*.spec.*']` |
| `ignoreImportPatterns` | Skips selected import paths for a rule. | `['/types$', '^virtual:']` |

### `rootPath` Example

If your project does not start directly at `/src/`, set `rootPath` so file-path based rules can still resolve the current layer and slice correctly.

```js
import fsdPlugin from 'eslint-plugin-fsd-lint';

export default [
  {
    plugins: {
      fsd: fsdPlugin,
    },
    rules: {
      'fsd/forbidden-imports': ['error', { rootPath: '/apps/storefront/src/' }],
      'fsd/no-cross-slice-dependency': ['error', { rootPath: '/apps/storefront/src/' }],
      'fsd/no-ui-in-business-logic': ['error', { rootPath: '/apps/storefront/src/' }],
    },
  },
];
```

Typical `rootPath` values:

- `'/src/'`
- `'/apps/web/src/'`
- `'/packages/admin/src/'`
- `'/src/root/'`

The value should match a stable segment inside the absolute path ESLint sees for your files.

---

## Advanced Configuration

```js
import fsdPlugin from 'eslint-plugin-fsd-lint';

export default [
  {
    plugins: {
      fsd: fsdPlugin,
    },
    rules: {
      'fsd/forbidden-imports': [
        'error',
        {
          rootPath: '/apps/web/src/',
          alias: {
            value: '@',
            withSlash: false,
          },
          folderPattern: {
            enabled: true,
            regex: '^(\\d+_)?(.*)',
            extractionGroup: 2,
          },
        },
      ],
      'fsd/no-cross-slice-dependency': [
        'error',
        {
          rootPath: '/apps/web/src/',
          featuresOnly: false,
          allowTypeImports: true,
        },
      ],
      'fsd/no-ui-in-business-logic': [
        'error',
        {
          rootPath: '/apps/web/src/',
          businessLogicLayers: ['model', 'api', 'lib'],
          uiLayers: ['ui', 'widgets', 'features'],
        },
      ],
      'fsd/no-relative-imports': [
        'error',
        {
          allowSameSlice: true,
          allowTypeImports: false,
        },
      ],
    },
  },
];
```

---

## Example Project Structure

```text
src/
├── app/
│   ├── providers/
│   ├── store/
│   └── index.ts
├── processes/
├── pages/
│   └── login/
│       ├── ui/
│       └── index.ts
├── widgets/
│   └── header/
│       ├── ui/
│       └── index.ts
├── features/
│   └── auth/
│       ├── api/
│       ├── lib/
│       ├── model/
│       ├── ui/
│       └── index.ts
├── entities/
│   └── user/
│       ├── model/
│       ├── ui/
│       └── index.ts
└── shared/
    ├── api/
    ├── config/
    ├── lib/
    └── ui/
```

Numbered folders also work when `folderPattern` is enabled:

```text
src/
├── 1_app/
├── 2_pages/
├── 3_widgets/
├── 4_features/
├── 5_entities/
└── 6_shared/
```

---

## Rules

| Rule | What it protects | Key options |
| --- | --- | --- |
| `fsd/forbidden-imports` | Layer direction and invalid layer-to-layer imports | `alias`, `rootPath`, `folderPattern`, `ignoreImportPatterns` |
| `fsd/no-relative-imports` | Relative imports across slices or layers | `allowSameSlice`, `allowTypeImports`, `ignoreImportPatterns` |
| `fsd/no-public-api-sidestep` | Direct access to internal modules | `publicApi`, `ignoreImportPatterns` |
| `fsd/no-cross-slice-dependency` | Direct dependencies between slices in the same layer | `rootPath`, `featuresOnly`, `allowTypeImports`, `excludeLayers` |
| `fsd/no-ui-in-business-logic` | UI imports inside model/api/lib code | `rootPath`, `uiLayers`, `businessLogicLayers`, `allowTypeImports` |
| `fsd/no-global-store-imports` | Direct store imports | `ignoreImportPatterns` |
| `fsd/ordered-imports` | Stable FSD import ordering | no options |

---

## Rule Examples

### `fsd/forbidden-imports`

```js
// features/auth/model/service.ts

// ✅ allowed
import { getUser } from '@entities/user';
import { Button } from '@shared/ui/Button';

// ❌ forbidden
import { LoginPage } from '@pages/login';
```

### `fsd/no-relative-imports`

```js
// features/auth/ui/LoginForm.tsx

// ✅ same-slice relative import
import { validateCredentials } from '../lib/validation';

// ❌ cross-layer relative import
import { store } from '../../../app/store';

// ✅ cross-layer alias import
import { store } from '@app/store';
```

### `fsd/no-public-api-sidestep`

```js
// ✅ public API import
import { authModel } from '@features/auth';

// ✅ segment-level public import
import { userModel } from '@entities/user/model';

// ❌ deep internal file import
import { authSlice } from '@features/auth/model/slice';
```

### `fsd/no-cross-slice-dependency`

```js
// features/auth/model/service.ts

// ❌ direct dependency on another feature slice
import { profileService } from '@features/profile/model/service';

// ✅ dependency through lower layer
import { getProfile } from '@entities/profile';
```

### `fsd/no-ui-in-business-logic`

```js
// entities/user/model/user.ts

// ❌ business logic importing UI
import { Header } from '@widgets/header';

// ✅ business logic importing data or helpers
import { formatDate } from '@shared/lib/date';
```

### `fsd/no-global-store-imports`

```js
// ❌ direct store import
import { store } from '@app/store';

// ✅ use app wiring, hooks, or selectors instead
import { useSelector } from 'react-redux';
```

### `fsd/ordered-imports`

```js
// Before
import { processPayment } from '@features/payment';
import { getUser } from '@entities/user';
import { formatCurrency } from '@shared/lib/currency';
import { useStore } from '@app/store';

// After --fix
import { useStore } from '@app/store';

import { processPayment } from '@features/payment';

import { getUser } from '@entities/user';

import { formatCurrency } from '@shared/lib/currency';
```

---

## Auto-fix Support

`fsd/ordered-imports` supports ESLint auto-fix.

```shell
npx eslint --fix .
```

---

## Troubleshooting

### My app lives inside a monorepo package

Use `rootPath` on rules that rely on the current file path:

```js
'fsd/forbidden-imports': ['error', { rootPath: '/packages/web/src/' }],
'fsd/no-cross-slice-dependency': ['error', { rootPath: '/packages/web/src/' }],
'fsd/no-ui-in-business-logic': ['error', { rootPath: '/packages/web/src/' }],
```

### I use `@/shared/...` instead of `@shared/...`

```js
'fsd/forbidden-imports': ['error', {
  alias: {
    value: '@',
    withSlash: true,
  },
}]
```

### I use numbered layer directories

```js
'fsd/forbidden-imports': ['error', {
  folderPattern: {
    enabled: true,
    regex: '^(\\d+_)?(.*)',
    extractionGroup: 2,
  },
}]
```

---

## Development

```shell
npm run lint
npm test
```

---

## Contributing

Issues and pull requests are welcome. Please include tests and documentation updates for any new rule or behavior change.
