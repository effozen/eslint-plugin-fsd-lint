# 🚀 eslint-plugin-fsd-lint 🚀

[![npm version](https://img.shields.io/npm/v/eslint-plugin-fsd-lint)](https://www.npmjs.com/package/eslint-plugin-fsd-lint)
[![npm downloads](https://img.shields.io/npm/dt/eslint-plugin-fsd-lint)](https://www.npmjs.com/package/eslint-plugin-fsd-lint)
[![npm bundle size](https://img.shields.io/bundlephobia/min/eslint-plugin-fsd-lint)](https://bundlephobia.com/package/eslint-plugin-fsd-lint)
[![License](https://img.shields.io/npm/l/eslint-plugin-fsd-lint)](https://github.com/effozen/eslint-plugin-fsd-lint/blob/main/LICENSE)

[English](README.md) | [한국어](README.ko.md)

> ESLint 9+와 새로운 Flat Config 시스템을 지원합니다.

## 📖 소개

`eslint-plugin-fsd-lint`는 **Feature-Sliced Design(FSD)** 아키텍처를 준수하도록 강제하는 ESLint 플러그인입니다.  
최신 **ESLint 9+** 를 완벽히 지원하고, **Flat Config** 형식을 따르기 때문에 자바스크립트와 타입스크립트 프로젝트에 매끄럽게 통합할 수 있습니다.

### ✨ 왜 이 플러그인을 사용해야 하나요?

- **Flat Config 지원**: **ESLint 9+** 및 **새로운 Flat Config 시스템**과 완벽 호환
- **엄격한 FSD 준수**: 기능 기반 프로젝트 구조에서 아키텍처 위반을 방지
- **유지보수성 향상**: 명확한 모듈 분리와 의존성 관리를 유도
- **일관된 코드 품질 보장**: import 패턴과 모범 사례를 표준화

### 🔍 Feature-Sliced Design이란?

Feature-Sliced Design(FSD)은 프론트엔드 애플리케이션을 구조화하는 현대적인 아키텍처 패턴입니다.  
본 플러그인은 **올바른 레이어 분리, import 제한, 의존성 관리** 등의 주요 FSD 원칙을 적용하고,  
규모가 커져도 유지보수가 용이한 코드베이스를 만들도록 돕습니다.

---

## 📦 설치

다음 명령어로 `eslint-plugin-fsd-lint`를 **npm** 또는 **pnpm**으로 설치할 수 있습니다:

### npm 사용 시:

```shell
npm install --save-dev eslint-plugin-fsd-lint
```

### pnpm 사용 시:

```shell
pnpm add -D eslint-plugin-fsd-lint
```

### Peer Dependencies

이 플러그인은 ESLint 9+ 버전을 필요로 합니다.

프로젝트에 ESLint가 설치되어 있는지 확인하세요:

```shell
npm install --save-dev eslint
```

> 💡 팁: 여러 패키지를 가진 모노레포 환경에서 작업 중이라면, 프로젝트 루트 레벨에 `eslint-plugin-fsd-lint`를 설치해 모든 워크스페이스에서 설정을 공유할 수 있습니다.

---

## 🚀 사용 방법 & 설정

### 🔧 Flat Config 설정 (`eslint.config.mjs`)

`eslint-plugin-fsd-lint`는 **ESLint 9+** 버전에 맞춰 **Flat Config 시스템**과 매끄럽게 동작하도록 설계되었습니다.  
프로젝트에서 사용하기 위해서는 `eslint.config.mjs`에 다음과 같은 설정을 추가하세요:

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

### 📌 권장 설정

더 엄격한 FSD 규칙을 적용하려면 기본 룰셋을 확장할 수 있습니다:

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
      'fsd/ordered-imports': 'error',
    },
  },
];
```

### 📂 예시 프로젝트 구조

다음은 FSD 원칙을 준수하는 프로젝트 구조 예시입니다:

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

> 💡 팁: 이 플러그인은 FSD 원칙에 따라 올바른 레이어 간 import를 강제합니다. 예를 들어, feature는 entities나 shared를 의존할 수 있지만, 다른 feature를 직접 import할 수는 없습니다.

---

## 🔍 지원하는 규칙(Rules)

이 플러그인은 **Feature-Sliced Design(FSD)의 모범 사례**를 강제하는 일련의 ESLint 규칙을 제공합니다.  
각 규칙은 **명확한 모듈 구조 유지, import 제약, 아키텍처 위반 방지**에 도움이 됩니다.

| 규칙(Rule)                        | 설명                                                                      |
| --------------------------------- | ------------------------------------------------------------------------- |
| **fsd/forbidden-imports**         | 상위 레이어에서의 import나 슬라이스 간 교차 import를 방지합니다.          |
| **fsd/no-relative-imports**       | 상대 경로(`../../shared/ui`) 대신 alias 사용을 강제합니다.                |
| **fsd/no-public-api-sidestep**    | Public API를 사용하지 않고 내부 모듈을 직접 import하는 것을 방지합니다.   |
| **fsd/no-cross-slice-dependency** | 기능(Feature) 슬라이스 간 직접 의존성을 금지합니다.                       |
| **fsd/no-ui-in-business-logic**   | 비즈니스 로직 레이어(e.g., entities)에서 UI를 import하지 못하도록 합니다. |
| **fsd/no-global-store-imports**   | 전역 상태(`store`)를 직접 import하지 못하도록 합니다.                     |
| **fsd/ordered-imports**           | 레이어별로 import를 그룹화하도록 강제합니다.                              |

---

## 📌 규칙 상세 & 예시

### **1️⃣ fsd/forbidden-imports**

**상위 레이어에서의 import와 슬라이스 간 교차 import를 방지합니다.**  
✅ **허용:** `features` → `entities` 또는 `shared`  
❌ **금지:** `features` → `app` 직접 import

```js
// ❌ 잘못된 예 (feature에서 app을 import)
import { config } from '../../app/config';

// ✅ 올바른 예 (feature에서 entities/shared를 import)
import { getUser } from '../../entities/user';
import { formatCurrency } from '../../shared/utils';
```

<br/>

### 2️⃣ fsd/no-relative-imports

상대 경로 import를 금지하고, 프로젝트에서 정의한 alias 사용을 강제합니다.  
✅ 허용: 프로젝트 alias 사용  
❌ 금지: ../ 또는 ./ 를 이용한 상대 경로

```javascript
// ❌ 잘못된 예 (상대 경로 사용)
import { Button } from '../shared/ui/Button';

// ✅ 올바른 예 (alias 사용)
import { Button } from '@shared/ui/Button';
```

<br/>

### 3️⃣ fsd/no-public-api-sidestep

features, widgets, entities의 내부 모듈을 직접 import하지 못하도록 합니다.  
✅ 허용: index.ts(공개 API)를 통한 import  
❌ 금지: feature 내부 파일에 직접 접근

```javascript
// ❌ 잘못된 예 (feature 내부 파일 직접 import)
import { authSlice } from '../../features/auth/slice.ts';

// ✅ 올바른 예 (공개 API를 통해 import)
import { authSlice } from '../../features/auth';
```

<br/>

### 4️⃣ fsd/no-cross-slice-dependency

기능(Feature) 슬라이스 간 직접 의존성을 방지합니다.  
✅ 허용: feature는 entities나 shared를 통해서만 간접적으로 소통  
❌ 금지: 서로 다른 feature 간의 직접 import

```javascript
// ❌ 잘못된 예 (다른 feature를 직접 import)
import { processPayment } from '../../features/payment';

// ✅ 올바른 예 (entities/shared를 중간에 사용)
import { PaymentEntity } from '../../entities/payment';
```

<br/>

### 5️⃣ fsd/no-ui-in-business-logic

비즈니스 로직 레이어(예: entities)에서 UI를 import하지 못하도록 합니다.  
✅ 허용: UI는 widgets나 pages 내에서만 사용  
❌ 금지: entities에서 UI 컴포넌트 import

```javascript
// ❌ 잘못된 예 (entity에서 widget import)
import { ProfileCard } from '../../widgets/ProfileCard';

// ✅ 올바른 예 (widget에서 entity 데이터를 사용)
import { getUser } from '../../entities/user';
```

<br/>

### 6️⃣ fsd/no-global-store-imports

전역 상태(store)를 직접 import하지 못하도록 합니다.  
✅ 허용: useStore 또는 useSelector와 같은 훅 사용  
❌ 금지: store 객체를 직접 import

```javascript
// ❌ 잘못된 예 (store 직접 import)
import { store } from '../../app/store';

// ✅ 올바른 예 (훅 사용)
import { useStore } from 'zustand';
import { useSelector } from 'react-redux';
```

<br/>

### 7️⃣ fsd/ordered-imports

레이어별로 import를 그룹화하도록 강제합니다.  
✅ 허용: 레이어별로 import 정렬  
❌ 금지: 무작위 순서의 import

```javascript
// ❌ 잘못된 예 (임의의 순서로 import)
import { processPayment } from '../features/payment';
import { getUser } from '../entities/user';
import { formatCurrency } from '../shared/utils';
import { loginUser } from '../features/auth';
import { Header } from '../widgets/Header';
import { useStore } from '../app/store';

// ✅ 올바른 예 (레이어별 그룹화)
import { useStore } from '../app/store'; // App

import { loginUser } from '../features/auth'; // Features
import { processPayment } from '../features/payment';

import { getUser } from '../entities/user'; // Entities

import { formatCurrency } from '../shared/utils'; // Shared

import { Header } from '../widgets/Header'; // Widgets
```

> 💡 팁: `npx eslint --fix` 명령을 사용하면, FSD 레이어 규칙에 따라 import를 자동 정렬할 수 있습니다.

---

## 🛠 자동 수정(Auto-fix) 지원

`eslint-plugin-fsd-lint` 내 일부 규칙은 ESLint의 `--fix` 옵션을 통해 **자동으로 수정**될 수 있습니다.  
이를 통해 개발자들은 **수동으로 코드를 수정하지 않아도** 빠르게 규칙 위반을 해결할 수 있습니다.

### ✅ 자동 수정이 지원되는 규칙

다음 규칙은 자동 수정을 지원합니다:

| 규칙(Rule)              | 설명                                                                      |
| ----------------------- | ------------------------------------------------------------------------- |
| **fsd/ordered-imports** | Feature-Sliced Design(FSD) 레이어 기준으로 import 순서를 자동 정렬합니다. |

### 🔧 ESLint에서 `--fix` 사용하기

프로젝트의 특정 파일에 대한 자동 수정을 적용하려면 다음과 같이 실행하세요:

```shell
npx eslint --fix your-file.js
```

프로젝트 내 모든 파일에 대해 자동 수정을 적용하려면:

```shell
npx eslint --fix .
```

### 📌 자동 수정 전후 예시

❌ 수정 전 (`fsd/ordered-imports` 위반)

```javascript
import { processPayment } from '../features/payment';
import { getUser } from '../entities/user';
import { formatCurrency } from '../shared/utils';
import { loginUser } from '../features/auth';
import { Header } from '../widgets/Header';
import { useStore } from '../app/store';
```

<br/>

✅ 수정 후 (`npx eslint --fix` 적용됨)

```javascript
import { useStore } from '../app/store'; // App

import { loginUser } from '../features/auth'; // Features
import { processPayment } from '../features/payment';

import { getUser } from '../entities/user'; // Entities

import { formatCurrency } from '../shared/utils'; // Shared

import { Header } from '../widgets/Header'; // Widgets
```

> 💡 팁: `fsd/ordered-imports` 규칙은 FSD 레이어를 기준으로 깔끔하고 구조적인 import 순서를 유지합니다.

---

## 🤝 컨트리뷰션(기여)

`eslint-plugin-fsd-lint`를 개선하기 위한 모든 기여를 환영합니다!  
새로운 규칙 제안이나 개선 사항이 있다면 자유롭게 Pull Request를 보내주세요.

자세한 내용은 [기여 가이드](CONTRIBUTING.md)를 참고하세요.

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스로 배포됩니다.  
자세한 내용은 [LICENSE](LICENSE.md) 파일을 참고하세요.

<br/>

<br/>
