# 🚀 eslint-plugin-fsd-lint 🚀

[![npm version](https://img.shields.io/npm/v/eslint-plugin-fsd-lint)](https://www.npmjs.com/package/eslint-plugin-fsd-lint)
[![npm downloads](https://img.shields.io/npm/dt/eslint-plugin-fsd-lint)](https://www.npmjs.com/package/eslint-plugin-fsd-lint)
[![npm bundle size](https://img.shields.io/bundlephobia/min/eslint-plugin-fsd-lint)](https://bundlephobia.com/package/eslint-plugin-fsd-lint)
[![License](https://img.shields.io/npm/l/eslint-plugin-fsd-lint)](https://github.com/effozen/eslint-plugin-fsd-lint/blob/main/LICENSE)

[English](README.md) | [한국어](README.ko.md)

> It supports ESLint 9+ and the new Flat Config system.

## 📖 Introduction

`eslint-plugin-fsd-lint` is an ESLint plugin that enforces best practices for Feature-Sliced Design (FSD) architecture.  
It is fully **compatible with ESLint 9+** and follows the modern **Flat Config format**, ensuring seamless integration into modern JavaScript and TypeScript projects.

### ✨ Why use this plugin?
- **Flat Config support**: Fully compatible with **ESLint 9+** and the **new Flat Config system**.
- **Strict FSD compliance**: Prevents architectural violations in feature-based project structures.
- **Improves maintainability**: Encourages clear module separation and dependency control.
- **Ensures consistent code quality**: Standardizes import patterns and best practices.

### 🔍 What is Feature-Sliced Design?
Feature-Sliced Design (FSD) is a modern architecture pattern that provides a structured approach to organizing frontend applications.  
This plugin enforces key FSD principles such as **proper layer separation, import restrictions, and dependency management**,  
helping developers build scalable and maintainable codebases.

---

## 📦 Installation

You can install `eslint-plugin-fsd-lint` via **npm** or **pnpm**:

### Using npm:
```shell
npm install --save-dev eslint-plugin-fsd-lint
```

### Using pnpm:
```shell
pnpm add -D eslint-plugin-fsd-lint
```

### Peer Dependencies
This plugin requires ESLint 9+ to work properly.

Make sure you have ESLint installed in your project:
```shell
npm install --save-dev eslint
```

> 💡 Tip: If you're using a monorepo with multiple packages, install eslint-plugin-fsd-lint at the root level to share the configuration across all workspaces.

---

## 🚀 Usage & Configuration

### 🔧 Flat Config Setup (`eslint.config.mjs`)
`eslint-plugin-fsd-lint` is designed for **ESLint 9+** and works seamlessly with the **Flat Config system**.  
To use it in your project, add the following configuration to your `eslint.config.mjs`:

```js
import fsdPlugin from "eslint-plugin-fsd-lint";

export default [
  {
    plugins: {
      fsd: fsdPlugin,
    },
    rules: {
      "fsd/forbidden-imports": "error",
      "fsd/no-relative-imports": "error",
      "fsd/no-public-api-sidestep": "error",
      "fsd/no-cross-slice-dependency": "error",
      "fsd/no-ui-in-business-logic": "error",
      "fsd/no-global-store-imports": "error",
      "fsd/ordered-imports": "warn"
    },
  },
];
```

### 📌 Recommended Configurations
For a stricter FSD enforcement, you can extend the default rule set:

```js
import fsdPlugin from "eslint-plugin-fsd-lint";

export default [
  {
    plugins: {
      fsd: fsdPlugin,
    },
    rules: {
      "fsd/forbidden-imports": "error",
      "fsd/no-relative-imports": "error",
      "fsd/no-public-api-sidestep": "error",
      "fsd/no-cross-slice-dependency": "error",
      "fsd/no-ui-in-business-logic": "error",
      "fsd/no-global-store-imports": "error",
      "fsd/ordered-imports": "error"
    },
  },
];
```

### 📂 Example Project Structure
Here’s how an FSD-compliant project might look:
```plaintext
src/
├── app/
│   ├── providers/
│   ├── store.js
│   ├── index.js
│
├── processes/
│   ├── auth/
│   ├── onboarding/
│
├── pages/
│   ├── HomePage/
│   ├── ProfilePage/
│
├── widgets/
│   ├── Navbar/
│   ├── Sidebar/
│
├── features/
│   ├── login/
│   ├── registration/
│
├── entities/
│   ├── user/
│   ├── post/
│
├── shared/
│   ├── ui/
│   ├── utils/

```

> 💡 Tip: The plugin enforces correct layer imports according to FSD principles. For example, a feature can depend on entities and shared, but cannot directly import another feature.

---

## 🔍 Supported Rules

This plugin provides a set of ESLint rules that enforce **Feature-Sliced Design (FSD) best practices**.  
Each rule helps maintain a **clear module structure, enforce import constraints, and prevent architectural violations**.

| Rule | Description |
|------|------------|
| **fsd/forbidden-imports** | Prevents imports from higher layers and cross-imports between slices. |
| **fsd/no-relative-imports** | Enforces alias usage instead of relative imports (`../../shared/ui`). |
| **fsd/no-public-api-sidestep** | Prevents direct imports from internal modules, enforcing public API usage. |
| **fsd/no-cross-slice-dependency** | Disallows direct dependencies between feature slices. |
| **fsd/no-ui-in-business-logic** | Prevents UI imports inside business logic layers (e.g., `entities`). |
| **fsd/no-global-store-imports** | Forbids direct imports of global state (`store`). |
| **fsd/ordered-imports** | Enforces import grouping by layer. |

---

## 📌 Rule Details & Examples

### **1️⃣ fsd/forbidden-imports**
**Prevents imports from higher layers and cross-imports between slices.**  
✅ **Allowed:** `features` can import from `entities` or `shared`  
❌ **Not Allowed:** `features` importing directly from `app`

```js
// ❌ Incorrect (feature importing from app)
import { config } from "../../app/config";

// ✅ Correct (feature importing from entities/shared)
import { getUser } from "../../entities/user";
import { formatCurrency } from "../../shared/utils";
```

<br/>

### 2️⃣ fsd/no-relative-imports
Disallows relative imports and enforces alias usage.
✅ Allowed: Using project-defined aliases
❌ Not Allowed: Using ../ or ./

```javascript
// ❌ Incorrect (relative import)
import { Button } from "../shared/ui/Button";

// ✅ Correct (alias import)
import { Button } from "@shared/ui/Button";

```

<br/>

### 3️⃣ fsd/no-public-api-sidestep
Prevents direct imports from internal modules of features, widgets, or entities.
✅ Allowed: Importing from index.ts (public API)
❌ Not Allowed: Importing a feature’s internal file

```javascript
// ❌ Incorrect (direct internal import)
import { authSlice } from "../../features/auth/slice.ts";

// ✅ Correct (importing via public API)
import { authSlice } from "../../features/auth";
```

<br/>

### 4️⃣ fsd/no-cross-slice-dependency
Prevents direct dependencies between feature slices.
✅ Allowed: features should communicate via entities or shared
❌ Not Allowed: Direct imports between different features

```javascript
// ❌ Incorrect (feature importing from another feature)
import { processPayment } from "../../features/payment";

// ✅ Correct (using entities/shared as an intermediary)
import { PaymentEntity } from "../../entities/payment";
```

<br/>

### 5️⃣ fsd/no-ui-in-business-logic
Prevents UI imports inside business logic layers (e.g., entities).
✅ Allowed: UI should only be used inside widgets or pages
❌ Not Allowed: entities importing UI components

```javascript
// ❌ Incorrect (entity importing widget)
import { ProfileCard } from "../../widgets/ProfileCard";

// ✅ Correct (widget using entity data)
import { getUser } from "../../entities/user";

```

<br/>

### 6️⃣ fsd/no-global-store-imports
Forbids direct imports of global state (store).
✅ Allowed: Using useStore or useSelector
❌ Not Allowed: Direct imports of the store

```javascript
// ❌ Incorrect (direct import of store)
import { store } from "../../app/store";

// ✅ Correct (using hooks)
import { useStore } from "zustand";
import { useSelector } from "react-redux";

```

<br/>

### 7️⃣ fsd/ordered-imports
Enforces import grouping by layer.
✅ Allowed: Grouping imports by layer
❌ Not Allowed: Mixed import order

```javascript
// ❌ Incorrect (random import order)
import { processPayment } from "../features/payment";
import { getUser } from "../entities/user";
import { formatCurrency } from "../shared/utils";
import { loginUser } from "../features/auth";
import { Header } from "../widgets/Header";
import { useStore } from "../app/store";

// ✅ Correct (layered grouping)
import { useStore } from "../app/store";  // App

import { loginUser } from "../features/auth";  // Features
import { processPayment } from "../features/payment";

import { getUser } from "../entities/user";  // Entities

import { formatCurrency } from "../shared/utils";  // Shared

import { Header } from "../widgets/Header";  // Widgets

```

> 💡 Tip: Use `npx eslint --fix` to automatically reorder imports according to FSD layers.

---

## 🛠 Auto-fix Support

Certain rules in `eslint-plugin-fsd-lint` support **automatic fixing** using ESLint's `--fix` option.  
This allows developers to quickly resolve violations **without manual code adjustments**.

### ✅ Rules Supporting Auto-fix
The following rules can be automatically fixed:

| Rule | Description |
|------|------------|
| **fsd/ordered-imports** | Automatically sorts imports based on Feature-Sliced Design (FSD) layers. |

### 🔧 Using `--fix` in ESLint
To apply automatic fixes to your project, simply run:

```shell
npx eslint --fix your-file.js
```

Or, to fix all files in your project:
```shell
npx eslint --fix .
```

### 📌 Example Before & After Auto-fix
❌ Before (fsd/ordered-imports violation)
```javascript
import { processPayment } from "../features/payment";
import { getUser } from "../entities/user";
import { formatCurrency } from "../shared/utils";
import { loginUser } from "../features/auth";
import { Header } from "../widgets/Header";
import { useStore } from "../app/store";

```
<br/>

✅ After (npx eslint --fix applied)
```javascript
import { useStore } from "../app/store";  // App

import { loginUser } from "../features/auth";  // Features
import { processPayment } from "../features/payment";

import { getUser } from "../entities/user";  // Entities

import { formatCurrency } from "../shared/utils";  // Shared

import { Header } from "../widgets/Header";  // Widgets

```

> 💡 Tip: `fsd/ordered-imports` ensures a clean and structured import order based on FSD layers.

---

## 🤝 Contributing

We welcome contributions to improve `eslint-plugin-fsd-lint`!  
If you have an idea for a new rule or an improvement, feel free to submit a Pull Request.

Check out our [contribution guide](CONTRIBUTING.md).

---

## 📝 License

This project is licensed under the MIT License.
See the [LICENSE](LICENSE.md) file for details.

<br/>

<br/>