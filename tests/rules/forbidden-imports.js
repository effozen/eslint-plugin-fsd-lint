/**
 * @fileoverview Tests for forbidden-imports rule
 */
import { testRule, withFilename, withOptions } from '../utils/test-utils.js';
import forbiddenImports from '../../src/rules/forbidden-imports.js';

testRule('forbidden-imports', forbiddenImports, {
  valid: [
    // Basic allowed imports
    {
      description: 'Import from allowed path (OK)',
      code: 'import { Button } from "@shared/ui/Button";',
    },
    {
      description: 'Import from allowed feature (OK)',
      code: 'import { LoginForm } from "@features/auth";',
    },
    {
      description: 'Import from allowed entity (OK)',
      code: 'import { User } from "@entities/user";',
    },

    // Node modules and third-party imports
    {
      description: 'Import from node modules (OK)',
      code: 'import React from "react";',
    },
    {
      description: 'Import from third-party library (OK)',
      code: 'import { useDispatch } from "react-redux";',
    },
    {
      description: 'Import from scoped package (OK)',
      code: 'import { something } from "@types/react";',
    },

    // Type imports
    {
      description: 'Type import from allowed path (OK)',
      code: 'import type { ButtonProps } from "@shared/ui/Button";',
    },
    {
      description: 'Type import from node modules (OK)',
      code: 'import type { FC } from "react";',
    },

    // Dynamic imports
    {
      description: 'Dynamic import from allowed path (OK)',
      code: 'const { Button } = await import("@shared/ui/Button");',
    },
    {
      description: 'Dynamic import from node modules (OK)',
      code: 'const React = await import("react");',
    },

    // Test file exceptions
    {
      description: 'Test file with forbidden import (exception)',
      ...withFilename('import { forbiddenUtil } from "@forbidden/utils";', 'src/features/auth/ui/LoginForm.test.tsx'),
    },
    {
      description: 'Test file in testing directory (exception)',
      ...withFilename('import { forbiddenUtil } from "@forbidden/utils";', 'src/features/auth/testing/service.spec.ts'),
    },

    // Custom configurations
    {
      description: 'Import with custom allowed paths',
      ...withOptions('import { something } from "@custom/path";', {
        allowedPaths: ['@custom/path'],
      }),
    },
    {
      description: 'Import with custom ignored patterns',
      ...withOptions('import { something } from "@forbidden/utils";', {
        ignoreImportPatterns: ['/utils'],
      }),
    },
    {
      description: 'Import with custom excluded layers',
      ...withOptions('import { something } from "@forbidden/utils";', {
        excludeLayers: ['utils'],
      }),
    },

    // Path variations
    {
      description: 'Windows path format (OK)',
      code: 'import { Button } from "@shared\\ui\\Button";',
    },
    {
      description: 'Unix path format (OK)',
      code: 'import { Button } from "@shared/ui/Button";',
    },
    {
      description: 'Mixed path separators (OK)',
      code: 'import { Button } from "@shared/ui\\Button";',
    },

    // Real-world scenarios
    {
      description: 'Import from hooks directory (OK)',
      code: 'import { useAuth } from "@features/auth/hooks";',
    },
    {
      description: 'Import from constants directory (OK)',
      code: 'import { API_ENDPOINTS } from "@features/auth/constants";',
    },
    {
      description: 'Import from utils directory (OK)',
      code: 'import { formatUserName } from "@entities/user/utils";',
    },
  ],

  invalid: [
    // Basic forbidden imports
    {
      description: 'Import from forbidden path (Forbidden)',
      code: 'import { forbiddenUtil } from "@forbidden/utils";',
      errors: [{ messageId: 'forbiddenImport' }],
    },
    {
      description: 'Import from forbidden feature (Forbidden)',
      code: 'import { ForbiddenFeature } from "@features/forbidden";',
      errors: [{ messageId: 'forbiddenImport' }],
    },
    {
      description: 'Import from forbidden entity (Forbidden)',
      code: 'import { ForbiddenEntity } from "@entities/forbidden";',
      errors: [{ messageId: 'forbiddenImport' }],
    },

    // Forbidden node modules
    {
      description: 'Import from forbidden node module (Forbidden)',
      code: 'import { something } from "forbidden-package";',
      errors: [{ messageId: 'forbiddenImport' }],
    },
    {
      description: 'Import from forbidden scoped package (Forbidden)',
      code: 'import { something } from "@forbidden/package";',
      errors: [{ messageId: 'forbiddenImport' }],
    },

    // Forbidden type imports
    {
      description: 'Type import from forbidden path (Forbidden)',
      code: 'import type { ForbiddenType } from "@forbidden/types";',
      errors: [{ messageId: 'forbiddenImport' }],
    },
    {
      description: 'Type import from forbidden node module (Forbidden)',
      code: 'import type { ForbiddenType } from "forbidden-package";',
      errors: [{ messageId: 'forbiddenImport' }],
    },

    // Forbidden dynamic imports
    {
      description: 'Dynamic import from forbidden path (Forbidden)',
      code: 'const { forbiddenUtil } = await import("@forbidden/utils");',
      errors: [{ messageId: 'forbiddenImport' }],
    },
    {
      description: 'Dynamic import from forbidden node module (Forbidden)',
      code: 'const { something } = await import("forbidden-package");',
      errors: [{ messageId: 'forbiddenImport' }],
    },

    // Path variations
    {
      description: 'Windows path format (Forbidden)',
      code: 'import { forbiddenUtil } from "@forbidden\\utils";',
      errors: [{ messageId: 'forbiddenImport' }],
    },
    {
      description: 'Unix path format (Forbidden)',
      code: 'import { forbiddenUtil } from "@forbidden/utils";',
      errors: [{ messageId: 'forbiddenImport' }],
    },
    {
      description: 'Mixed path separators (Forbidden)',
      code: 'import { forbiddenUtil } from "@forbidden/utils\\util";',
      errors: [{ messageId: 'forbiddenImport' }],
    },

    // Real-world scenarios
    {
      description: 'Import from forbidden hooks directory (Forbidden)',
      code: 'import { useForbidden } from "@forbidden/hooks";',
      errors: [{ messageId: 'forbiddenImport' }],
    },
    {
      description: 'Import from forbidden constants directory (Forbidden)',
      code: 'import { FORBIDDEN_CONSTANTS } from "@forbidden/constants";',
      errors: [{ messageId: 'forbiddenImport' }],
    },
    {
      description: 'Import from forbidden utils directory (Forbidden)',
      code: 'import { forbiddenUtil } from "@forbidden/utils";',
      errors: [{ messageId: 'forbiddenImport' }],
    },

    // Complex scenarios
    {
      description: 'Multiple forbidden imports (Forbidden)',
      code: `
        import { forbiddenUtil } from "@forbidden/utils";
        import { ForbiddenFeature } from "@features/forbidden";
        import { ForbiddenEntity } from "@entities/forbidden";
      `,
      errors: [{ messageId: 'forbiddenImport' }, { messageId: 'forbiddenImport' }, { messageId: 'forbiddenImport' }],
    },
    {
      description: 'Mixed imports with allowed and forbidden (Forbidden)',
      code: `
        import { Button } from "@shared/ui/Button";
        import { forbiddenUtil } from "@forbidden/utils";
        import { LoginForm } from "@features/auth";
      `,
      errors: [{ messageId: 'forbiddenImport' }],
    },
    {
      description: 'Nested forbidden imports (Forbidden)',
      code: `
        import { forbiddenUtil } from "@forbidden/utils";
        import { anotherForbidden } from "@forbidden/another";
        import { thirdForbidden } from "@forbidden/third";
      `,
      errors: [{ messageId: 'forbiddenImport' }, { messageId: 'forbiddenImport' }, { messageId: 'forbiddenImport' }],
    },
  ],
});
