/**
 * @fileoverview Tests for forbidden-imports rule
 */
import { testRule, withFilename, withOptions } from '../utils/test-utils.js';
import forbiddenImports from '../../src/rules/forbidden-imports.js';

testRule('forbidden-imports', forbiddenImports, {
  valid: [
    {
      description: 'Lower layer importing from higher layer (OK)',
      ...withFilename('import { Button } from "@shared/ui";', "src/features/auth/ui/LoginForm.tsx")
    },
    {
      description: 'Same layer import (OK)',
      ...withFilename('import { LoginByUsername } from "@features/login-by-username";', "src/features/auth/ui/LoginForm.tsx")
    },
    {
      description: 'Relative path import (outside this rule scope)',
      ...withFilename('import { api } from "../api/api";', "src/features/auth/ui/LoginForm.tsx")
    },
    {
      description: 'Windows path import (OK)',
      ...withFilename('import { Button } from "@shared/ui";', "src\\features\\auth\\ui\\LoginForm.tsx")
    },
    {
      description: 'Test file import (exception)',
      ...withFilename('import { Header } from "@widgets/Header";', "src/features/auth/ui/LoginForm.test.tsx")
    },
    {
      description: '@/shared format import (with slash)',
      ...withOptions(
        withFilename('import { Button } from "@/shared/ui";', "src/features/auth/ui/LoginForm.tsx"),
        { alias: { value: "@", withSlash: true } }
      )
    },
    {
      description: 'With folder pattern (1_features -> 5_entities)',
      ...withOptions(
        withFilename('import { User } from "@entities/user";', "src/1_features/auth/ui/LoginForm.tsx"),
        {
          folderPattern: {
            enabled: true,
            regex: "^(\\d+_)?(.*)",
            extractionGroup: 2
          }
        }
      )
    },
    {
      description: 'Custom layer configuration',
      ...withOptions(
        withFilename('import { User } from "@core/user";', "src/modules/auth/ui/LoginForm.tsx"),
        {
          layers: {
            modules: { pattern: "modules", priority: 1, allowedToImport: ["core"] },
            core: { pattern: "core", priority: 2, allowedToImport: [] }
          }
        }
      )
    },
    {
      description: 'Ignored pattern',
      ...withOptions(
        withFilename('import { AppRouter } from "@app/router";', "src/features/auth/ui/LoginForm.tsx"),
        {
          ignoreImportPatterns: ["^@app/router"]
        }
      )
    }
  ],
  invalid: [
    {
      description: 'Higher layer importing from lower layer (Forbidden)',
      code: 'import { Header } from "@widgets/Header";',
      filename: "src/features/auth/ui/LoginForm.tsx",
      errors: [{ messageId: "invalidImport" }],
    },
    {
      description: 'Entities importing from features (Forbidden)',
      code: 'import { LoginForm } from "@features/auth";',
      filename: "src/entities/user/model/user.ts",
      errors: [{ messageId: "invalidImport" }],
    },
    {
      description: 'Windows path with forbidden import',
      code: 'import { AppRouter } from "@app/router";',
      filename: "src\\entities\\user\\model\\User.ts",
      errors: [{ messageId: "invalidImport" }],
    },
    {
      description: 'With folder pattern (5_entities -> 1_features)',
      code: 'import { LoginForm } from "@features/auth";',
      filename: "src/5_entities/user/model/User.ts",
      options: [{
        folderPattern: {
          enabled: true,
          regex: "^(\\d+_)?(.*)",
          extractionGroup: 2
        }
      }],
      errors: [{ messageId: "invalidImport" }],
    },
    {
      description: '@/shared format with forbidden import',
      code: 'import { LoginForm } from "@/features/auth";',
      filename: "src/entities/user/model/User.ts",
      options: [{
        alias: { value: "@", withSlash: true }
      }],
      errors: [{ messageId: "invalidImport" }],
    },
    {
      description: 'Custom layer with forbidden import',
      code: 'import { Auth } from "@modules/auth";',
      filename: "src/core/user/model/User.ts",
      options: [{
        layers: {
          modules: { pattern: "modules", priority: 1, allowedToImport: ["core"] },
          core: { pattern: "core", priority: 2, allowedToImport: [] }
        }
      }],
      errors: [{ messageId: "invalidImport" }],
    }
  ],
});