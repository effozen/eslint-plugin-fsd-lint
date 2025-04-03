/**
 * @fileoverview Tests for no-ui-in-business-logic rule
 */
import { testRule, withFilename, withOptions } from '../utils/test-utils.js';
import noUiInBusinessLogic from '../../src/rules/no-ui-in-business-logic.js';

testRule('no-ui-in-business-logic', noUiInBusinessLogic, {
  valid: [
    // UI layer imports
    {
      description: 'Entity UI layer importing from shared (OK)',
      ...withFilename('import { Button } from "@shared/ui";', 'src/entities/user/ui/UserCard.tsx'),
    },
    {
      description: 'Widget importing from entity (OK)',
      ...withFilename('import { User } from "@entities/user";', 'src/widgets/Header/ui/Header.tsx'),
    },
    {
      description: 'Feature UI importing from widget (OK)',
      ...withFilename('import { Sidebar } from "@widgets/Sidebar";', 'src/features/auth/ui/LoginForm.tsx'),
    },
    {
      description: 'Page importing from widget (OK)',
      ...withFilename('import { Header } from "@widgets/Header";', 'src/pages/profile/ui/ProfilePage.tsx'),
    },
    {
      description: 'Entity UI component importing from widget (OK - UI can import UI)',
      ...withFilename('import { Header } from "@widgets/Header";', 'src/entities/user/ui/UserProfile.tsx'),
    },
    {
      description: 'Feature UI importing from entity UI (OK - UI can import UI)',
      ...withFilename('import { UserCard } from "@entities/user/ui/UserCard";', 'src/features/auth/ui/LoginForm.tsx'),
    },
    {
      description: 'Page UI importing from feature UI (OK - UI can import UI)',
      ...withFilename('import { LoginForm } from "@features/auth/ui/LoginForm";', 'src/pages/login/ui/LoginPage.tsx'),
    },

    // Business logic layer imports
    {
      description: 'Entity importing from shared (OK)',
      ...withFilename('import { classNames } from "@shared/lib/classNames";', 'src/entities/user/model/user.ts'),
    },
    {
      description: 'Entity importing from another entity (OK)',
      ...withFilename('import { Article } from "@entities/article";', 'src/entities/user/model/user.ts'),
    },
    {
      description: 'Feature importing from entity (OK)',
      ...withFilename('import { User } from "@entities/user";', 'src/features/auth/model/authService.ts'),
    },
    {
      description: 'Feature importing from shared (OK)',
      ...withFilename('import { api } from "@shared/api/base";', 'src/features/auth/model/authService.ts'),
    },
    {
      description: 'Feature importing from another feature (OK)',
      ...withFilename('import { profileService } from "@features/profile";', 'src/features/auth/model/authService.ts'),
    },

    // Type imports
    {
      description: 'Type import unrelated to business logic (OK)',
      ...withFilename('import type { HeaderProps } from "@widgets/Header";', 'src/entities/user/model/user.ts'),
    },
    {
      description: 'Type import from UI component (OK)',
      ...withFilename('import type { ButtonProps } from "@shared/ui/button";', 'src/entities/user/model/user.ts'),
    },
    {
      description: 'Type import from feature UI (OK)',
      ...withFilename(
        'import type { LoginFormProps } from "@features/auth/ui/LoginForm";',
        'src/features/profile/model/profileService.ts'
      ),
    },
    {
      description: 'Type import from entity UI (OK)',
      ...withFilename(
        'import type { UserCardProps } from "@entities/user/ui/UserCard";',
        'src/features/auth/model/authService.ts'
      ),
    },

    // Test file exceptions
    {
      description: 'Test file importing from widget to entity (exception)',
      ...withFilename('import { Header } from "@widgets/Header";', 'src/entities/user/model/user.test.ts'),
    },
    {
      description: 'Test file importing from feature UI to entity (exception)',
      ...withFilename(
        'import { LoginForm } from "@features/auth/ui/LoginForm";',
        'src/entities/user/model/user.test.ts'
      ),
    },
    {
      description: 'Test file importing from entity UI to entity (exception)',
      ...withFilename(
        'import { UserCard } from "@entities/user/ui/UserCard";',
        'src/entities/profile/model/profile.test.ts'
      ),
    },
    {
      description: 'Test file in testing directory (exception)',
      ...withFilename('import { Header } from "@widgets/Header";', 'src/entities/user/testing/user.test.ts'),
    },
    {
      description: 'Spec file importing from UI (exception)',
      ...withFilename('import { Header } from "@widgets/Header";', 'src/entities/user/model/user.spec.ts'),
    },

    // Custom configurations
    {
      description: 'Custom business logic layer definition',
      ...withOptions(withFilename('import { Header } from "@widgets/Header";', 'src/domain/user/model/user.ts'), {
        businessLogicLayers: ['domain'],
        uiLayers: ['widgets', 'pages'],
      }),
    },
    {
      description: 'Custom UI layer definition',
      ...withOptions(withFilename('import { Header } from "@components/Header";', 'src/entities/user/model/user.ts'), {
        businessLogicLayers: ['entities', 'features'],
        uiLayers: ['components', 'pages'],
      }),
    },
    {
      description: 'Ignored import patterns',
      ...withOptions(withFilename('import { Header } from "@widgets/Header";', 'src/entities/user/model/user.ts'), {
        ignoreImportPatterns: ['/Header'],
      }),
    },

    // Path variations
    {
      description: 'Windows path with valid import',
      ...withFilename('import { Article } from "@entities/article";', 'src\\entities\\user\\model\\user.ts'),
    },
    {
      description: 'Unix path with valid import',
      ...withFilename('import { Article } from "@entities/article";', 'src/entities/user/model/user.ts'),
    },
    {
      description: 'Mixed path separators (OK)',
      ...withFilename('import { Article } from "@entities/article";', 'src/entities/user\\model\\user.ts'),
    },

    // Dynamic imports
    {
      description: 'Dynamic import from shared (OK)',
      ...withFilename('const { Button } = await import("@shared/ui/button");', 'src/entities/user/ui/UserCard.tsx'),
    },
    {
      description: 'Dynamic import from entity (OK)',
      ...withFilename('const { User } = await import("@entities/user");', 'src/widgets/Header/ui/Header.tsx'),
    },
    {
      description: 'Dynamic import from widget (OK)',
      ...withFilename('const { Header } = await import("@widgets/Header");', 'src/features/auth/ui/LoginForm.tsx'),
    },

    // Real-world scenarios
    {
      description: 'Import from hooks directory (OK)',
      ...withFilename('import { useUser } from "@entities/user/hooks";', 'src/features/auth/ui/LoginForm.tsx'),
    },
    {
      description: 'Import from constants directory (OK)',
      ...withFilename(
        'import { API_ENDPOINTS } from "@features/auth/constants";',
        'src/features/profile/ui/ProfilePage.tsx'
      ),
    },
    {
      description: 'Import from utils directory (OK)',
      ...withFilename('import { formatUserName } from "@entities/user/utils";', 'src/features/auth/ui/LoginForm.tsx'),
    },
  ],

  invalid: [
    // Entity layer imports
    {
      description: 'Entity model importing from widget (Forbidden)',
      code: 'import { Header } from "@widgets/Header";',
      filename: 'src/entities/user/model/user.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Entity API importing from widget (Forbidden)',
      code: 'import { Sidebar } from "@widgets/Sidebar/ui/Sidebar";',
      filename: 'src/entities/article/api/articleApi.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Entity lib importing from widget (Forbidden)',
      code: 'import { ProfileCard } from "@widgets/ProfileCard";',
      filename: 'src/entities/user/lib/userHelpers.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Entity selectors importing from widget (Forbidden)',
      code: 'import { Navbar } from "@widgets/Navbar";',
      filename: 'src/entities/user/model/selectors.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Entity hooks importing from widget (Forbidden)',
      code: 'import { Header } from "@widgets/Header";',
      filename: 'src/entities/user/hooks/useUser.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Entity constants importing from widget (Forbidden)',
      code: 'import { Header } from "@widgets/Header";',
      filename: 'src/entities/user/constants.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Entity utils importing from widget (Forbidden)',
      code: 'import { Header } from "@widgets/Header";',
      filename: 'src/entities/user/utils/formatters.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },

    // Feature layer imports
    {
      description: 'Feature model importing from widget (Forbidden)',
      code: 'import { Header } from "@widgets/Header";',
      filename: 'src/features/auth/model/authService.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Feature API importing from widget (Forbidden)',
      code: 'import { Sidebar } from "@widgets/Sidebar/ui/Sidebar";',
      filename: 'src/features/auth/api/authApi.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Feature lib importing from widget (Forbidden)',
      code: 'import { ProfileCard } from "@widgets/ProfileCard";',
      filename: 'src/features/auth/lib/validators.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Feature selectors importing from widget (Forbidden)',
      code: 'import { Navbar } from "@widgets/Navbar";',
      filename: 'src/features/auth/model/selectors.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Feature hooks importing from widget (Forbidden)',
      code: 'import { Header } from "@widgets/Header";',
      filename: 'src/features/auth/hooks/useAuth.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Feature constants importing from widget (Forbidden)',
      code: 'import { Header } from "@widgets/Header";',
      filename: 'src/features/auth/constants.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Feature utils importing from widget (Forbidden)',
      code: 'import { Header } from "@widgets/Header";',
      filename: 'src/features/auth/utils/formatters.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },

    // Cross-layer imports
    {
      description: 'Entity importing from feature UI (Forbidden)',
      code: 'import { LoginForm } from "@features/auth/ui/LoginForm";',
      filename: 'src/entities/user/model/user.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Entity importing from page UI (Forbidden)',
      code: 'import { ProfilePage } from "@pages/profile/ui/ProfilePage";',
      filename: 'src/entities/user/model/user.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Feature importing from page UI (Forbidden)',
      code: 'import { ProfilePage } from "@pages/profile/ui/ProfilePage";',
      filename: 'src/features/auth/model/authService.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Feature importing from entity UI (Forbidden)',
      code: 'import { UserCard } from "@entities/user/ui/UserCard";',
      filename: 'src/features/auth/model/authService.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },

    // Path variations
    {
      description: 'Windows path with forbidden import',
      code: 'import { Header } from "@widgets/Header";',
      filename: 'src\\entities\\user\\model\\user.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Unix path with forbidden import',
      code: 'import { Header } from "@widgets/Header";',
      filename: 'src/entities/user/model/user.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Mixed path separators (Forbidden)',
      code: 'import { Header } from "@widgets/Header";',
      filename: 'src/entities/user\\model\\user.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },

    // Folder pattern variations
    {
      description: 'With folder pattern',
      code: 'import { Header } from "@widgets/Header";',
      filename: 'src/5_entities/user/model/user.ts',
      options: [
        {
          folderPattern: {
            enabled: true,
            regex: '^(\\d+_)?(.*)',
            extractionGroup: 2,
          },
        },
      ],
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'With custom folder pattern',
      code: 'import { Header } from "@widgets/Header";',
      filename: 'src/entities/user/model/user.ts',
      options: [
        {
          folderPattern: {
            enabled: true,
            regex: '^(.*)',
            extractionGroup: 1,
          },
        },
      ],
      errors: [{ messageId: 'noCrossUI' }],
    },

    // Custom configurations
    {
      description: 'With custom business and UI layers',
      code: 'import { Header } from "@ui/Header";',
      filename: 'src/logic/user/model/user.ts',
      options: [
        {
          businessLogicLayers: ['logic'],
          uiLayers: ['ui'],
        },
      ],
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'With custom business logic layers',
      code: 'import { Header } from "@widgets/Header";',
      filename: 'src/domain/user/model/user.ts',
      options: [
        {
          businessLogicLayers: ['domain', 'core'],
          uiLayers: ['widgets', 'pages'],
        },
      ],
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'With custom UI layers',
      code: 'import { Header } from "@components/Header";',
      filename: 'src/entities/user/model/user.ts',
      options: [
        {
          businessLogicLayers: ['entities', 'features'],
          uiLayers: ['components', 'screens'],
        },
      ],
      errors: [{ messageId: 'noCrossUI' }],
    },

    // Dynamic imports
    {
      description: 'Dynamic import from widget (Forbidden)',
      code: 'const { Header } = await import("@widgets/Header");',
      filename: 'src/entities/user/model/user.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Dynamic import from feature UI (Forbidden)',
      code: 'const { LoginForm } = await import("@features/auth/ui/LoginForm");',
      filename: 'src/entities/user/model/user.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Dynamic import from page UI (Forbidden)',
      code: 'const { ProfilePage } = await import("@pages/profile/ui/ProfilePage");',
      filename: 'src/features/auth/model/authService.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Dynamic import with type assertion (Forbidden)',
      code: 'const { Header } = await import("@widgets/Header") as { Header: typeof Header };',
      filename: 'src/entities/user/model/user.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },

    // Type imports (when not allowed)
    {
      description: 'Type import from widget (Forbidden when not allowed)',
      ...withOptions('import type { HeaderProps } from "@widgets/Header";', { allowTypeImports: false }),
      filename: 'src/entities/user/model/user.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Type import from feature UI (Forbidden when not allowed)',
      ...withOptions('import type { LoginFormProps } from "@features/auth/ui/LoginForm";', { allowTypeImports: false }),
      filename: 'src/entities/user/model/user.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Type import from page UI (Forbidden when not allowed)',
      ...withOptions('import type { ProfilePageProps } from "@pages/profile/ui/ProfilePage";', {
        allowTypeImports: false,
      }),
      filename: 'src/features/auth/model/authService.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },

    // Real-world scenarios
    {
      description: 'Import from hooks directory in UI (Forbidden)',
      code: 'import { useUser } from "@entities/user/model/hooks";',
      filename: 'src/features/auth/model/authService.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Import from styles in UI (Forbidden)',
      code: 'import styles from "@features/auth/ui/styles.module.css";',
      filename: 'src/entities/user/model/user.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },
    {
      description: 'Import from config in UI (Forbidden)',
      code: 'import { API_CONFIG } from "@features/auth/config";',
      filename: 'src/entities/user/model/user.ts',
      errors: [{ messageId: 'noCrossUI' }],
    },

    // Complex scenarios
    {
      description: 'Multiple UI imports (Forbidden)',
      code: `
        import { Header } from "@widgets/Header";
        import { LoginForm } from "@features/auth/ui/LoginForm";
        const { ProfilePage } = await import("@pages/profile/ui/ProfilePage");
      `,
      filename: 'src/entities/user/model/user.ts',
      errors: [{ messageId: 'noCrossUI' }, { messageId: 'noCrossUI' }, { messageId: 'noCrossUI' }],
    },
  ],
});
