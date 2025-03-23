/**
 * @fileoverview Tests for no-public-api-sidestep rule
 */
import { testRule, withFilename, withOptions } from '../utils/test-utils.js';
import noPublicApiSidestep from '../../src/rules/no-public-api-sidestep.js';

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
      description: 'Test file with direct import (exception)',
      ...withFilename('import { userReducer } from "@entities/user/model/slice";', "src/features/auth/ui/LoginForm.test.tsx")
    },
    {
      description: 'Custom public API files',
      ...withOptions(
        'import { userModel } from "@entities/user/public.ts";',
        {
          publicApiFiles: ['public.ts', 'api.ts']
        }
      )
    },
    {
      description: 'Custom restricted layers',
      ...withOptions(
        'import { userReducer } from "@entities/user/model/slice";',
        {
          layers: ['features', 'widgets'] // entities not restricted
        }
      )
    },
    {
      description: 'Ignored import patterns',
      ...withOptions(
        'import { userTypes } from "@entities/user/model/types";',
        {
          ignoreImportPatterns: ['/model/types']
        }
      )
    }
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
      description: 'With @/features format (Forbidden)',
      code: 'import { LoginForm } from "@/features/auth/ui/LoginForm";',
      options: [{
        alias: { value: "@", withSlash: true }
      }],
      errors: [{ messageId: "noDirectImport" }],
    },
    {
      description: 'With folder pattern (Forbidden)',
      code: 'import { userReducer } from "@entities/user/model/slice";',
      options: [{
        folderPattern: {
          enabled: true,
          regex: "^(\\d+_)?(.*)",
          extractionGroup: 2
        }
      }],
      errors: [{ messageId: "noDirectImport" }],
    }
  ],
});