/**
 * @fileoverview Tests for forbidden-imports rule
 */
import { testRule, withFilename } from '../utils/test-utils';
import forbiddenImports from '../../src/rules/forbidden-imports';

testRule('forbidden-imports', forbiddenImports, {
  valid: [
    {
      description: 'Lower layer importing from shared (OK)',
      ...withFilename('import { Button } from "@shared/ui";', "src/features/auth/ui/LoginForm.tsx")
    },
    {
      description: 'Lower layer importing from entities (OK)',
      ...withFilename('import { User } from "@entities/user";', "src/features/auth/model/login.ts")
    },
    {
      description: 'Lower layer importing from features (OK)',
      ...withFilename('import { LoginForm } from "@features/auth";', "src/widgets/Header/ui/Header.tsx")
    },
    {
      description: 'Lower layer importing from widgets (OK)',
      ...withFilename('import { Header } from "@widgets/Header";', "src/pages/profile/ui/ProfilePage.tsx")
    },
    {
      description: 'Lower layer importing from pages (OK)',
      ...withFilename('import { ProfilePage } from "@pages/profile";', "src/processes/router/ui/AppRouter.tsx")
    },
    {
      description: 'Lower layer importing from processes (OK)',
      ...withFilename('import { Router } from "@processes/router";', "src/app/App.tsx")
    },
    {
      description: 'Same layer imports (OK)',
      ...withFilename('import { LoginByUsername } from "@features/login-by-username";', "src/features/auth/ui/LoginForm.tsx")
    },
    {
      description: 'Non-absolute path imports (OK - not regulated by this rule)',
      ...withFilename('import { api } from "../api/api";', "src/features/auth/ui/LoginForm.tsx")
    },
  ],
  invalid: [
    {
      description: 'Features importing from widgets (Forbidden)',
      code: 'import { Header } from "@widgets/Header";',
      filename: "src/features/auth/ui/LoginForm.tsx",
      errors: [{ messageId: "invalidImport" }],
    },
    {
      description: 'Features importing from pages (Forbidden)',
      code: 'import { ProfilePage } from "@pages/profile";',
      filename: "src/features/auth/model/login.ts",
      errors: [{ messageId: "invalidImport" }],
    },
    {
      description: 'Widgets importing from app (Forbidden)',
      code: 'import { AppRouter } from "@app/router";',
      filename: "src/widgets/Sidebar/ui/Sidebar.tsx",
      errors: [{ messageId: "invalidImport" }],
    },
    {
      description: 'Entities importing from processes (Forbidden)',
      code: 'import { AuthProcess } from "@processes/auth";',
      filename: "src/entities/user/model/User.ts",
      errors: [{ messageId: "invalidImport" }],
    },
    {
      description: 'Shared importing from entities (Forbidden)',
      code: 'import { User } from "@entities/user";',
      filename: "src/shared/api/api-provider.ts",
      errors: [{ messageId: "invalidImport" }],
    },
    {
      description: 'Multiple forbidden imports',
      code: `
        import { User } from "@entities/user";
        import { AppRouter } from "@app/router";
      `,
      filename: "src/shared/api/api-provider.ts",
      errors: [
        { messageId: "invalidImport" },
        { messageId: "invalidImport" }
      ],
    },
  ],
});