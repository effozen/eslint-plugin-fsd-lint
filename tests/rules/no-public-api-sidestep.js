/**
 * @fileoverview Tests for no-public-api-sidestep rule
 */
import { testRule } from '../utils/test-utils';
import noPublicApiSidestep from '../../src/rules/no-public-api-sidestep';

testRule('no-public-api-sidestep', noPublicApiSidestep, {
  valid: [
    {
      description: 'Entity import through public API (OK)',
      code: 'import { UserCard } from "@entities/user";'
    },
    {
      description: 'Feature import through public API (OK)',
      code: 'import { LoginForm } from "@features/auth";'
    },
    {
      description: 'Widget import through public API (OK)',
      code: 'import { Sidebar } from "@widgets/Sidebar";'
    },
    {
      description: 'Relative path import within same slice (OK)',
      code: 'import { Button } from "../Button";'
    },
    {
      description: 'Import from non-restricted layer (OK)',
      code: 'import { theme } from "@shared/config/theme";'
    },
    {
      description: 'Import from index.ts file (OK)',
      code: 'import { User } from "@entities/user/index";'
    },
    {
      description: 'Import from index.tsx file (OK)',
      code: 'import { LoginForm } from "@features/auth/index.tsx";'
    },
    {
      description: 'Only index is allowed, not index.types etc. (Not OK)',
      code: 'import { userTypes } from "@entities/user/index.types";',
      errors: [{ messageId: "noDirectImport" }],
    },
  ],
  invalid: [
    {
      description: 'Direct import from entity model (Forbidden)',
      code: 'import { userReducer } from "@entities/user/model/slice";',
      errors: [{ messageId: "noDirectImport" }],
    },
    {
      description: 'Direct import from feature UI (Forbidden)',
      code: 'import { LoginForm } from "@features/auth/ui/LoginForm";',
      errors: [{ messageId: "noDirectImport" }],
    },
    {
      description: 'Direct import from widget component (Forbidden)',
      code: 'import { Sidebar } from "@widgets/Sidebar/ui/Sidebar";',
      errors: [{ messageId: "noDirectImport" }],
    },
    {
      description: 'Direct import from entity API (Forbidden)',
      code: 'import { fetchUserById } from "@entities/user/api/userApi";',
      errors: [{ messageId: "noDirectImport" }],
    },
    {
      description: 'Direct import from feature constants (Forbidden)',
      code: 'import { LOGIN_FEATURE_KEY } from "@features/auth/model/consts";',
      errors: [{ messageId: "noDirectImport" }],
    },
    {
      description: 'Direct import from widget utilities (Forbidden)',
      code: 'import { formatTitle } from "@widgets/Header/lib/formatTitle";',
      errors: [{ messageId: "noDirectImport" }],
    },
    {
      description: 'Multiple direct imports (Forbidden)',
      code: `
        import { userReducer } from "@entities/user/model/slice";
        import { LoginForm } from "@features/auth/ui/LoginForm";
      `,
      errors: [
        { messageId: "noDirectImport" },
        { messageId: "noDirectImport" }
      ],
    },
  ],
});