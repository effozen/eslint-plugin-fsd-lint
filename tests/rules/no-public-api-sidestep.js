/**
 * @fileoverview Tests for no-public-api-sidestep rule
 */
import { testRule, withFilename, withOptions } from '../utils/test-utils.js';
import noPublicApiSidestep from '../../src/rules/no-public-api-sidestep.js';

testRule('no-public-api-sidestep', noPublicApiSidestep, {
  valid: [
    // Basic public API imports
    {
      description: 'Entity import through public API (OK)',
      code: 'import { UserCard } from "@entities/user";',
    },
    {
      description: 'Feature import through public API (OK)',
      code: 'import { LoginForm } from "@features/auth";',
    },
    {
      description: 'Widget import through public API (OK)',
      code: 'import { Sidebar } from "@widgets/Sidebar";',
    },
    {
      description: 'Page import through public API (OK)',
      code: 'import { HomePage } from "@pages/home";',
    },

    // Relative path imports
    {
      description: 'Relative path import within same slice (OK)',
      code: 'import { Button } from "../Button";',
    },
    {
      description: 'Relative path import within same directory (OK)',
      code: 'import { Button } from "./Button";',
    },
    {
      description: 'Relative path import with multiple levels (OK)',
      code: 'import { Button } from "../../../shared/ui/Button";',
    },
    {
      description: 'Relative path import to parent slice (OK)',
      code: 'import { Button } from "../../shared/ui/Button";',
    },
    {
      description: 'Relative path import to sibling component (OK)',
      code: 'import { Button } from "./Button/Button";',
    },

    // Non-restricted layers
    {
      description: 'Import from non-restricted layer (OK)',
      code: 'import { theme } from "@shared/config/theme";',
    },
    {
      description: 'Import from shared UI components (OK)',
      code: 'import { Button } from "@shared/ui/Button";',
    },
    {
      description: 'Import from shared utilities (OK)',
      code: 'import { formatDate } from "@shared/lib/date";',
    },
    {
      description: 'Import from shared hooks (OK)',
      code: 'import { useTheme } from "@shared/hooks/useTheme";',
    },
    {
      description: 'Import from shared constants (OK)',
      code: 'import { API_URL } from "@shared/constants/api";',
    },

    // Index file imports
    {
      description: 'Import from index.ts file (OK)',
      code: 'import { User } from "@entities/user/index";',
    },
    {
      description: 'Import from index.tsx file (OK)',
      code: 'import { LoginForm } from "@features/auth/index.tsx";',
    },
    {
      description: 'Import from index.js file (OK)',
      code: 'import { Sidebar } from "@widgets/Sidebar/index.js";',
    },
    {
      description: 'Import from index file with extension (OK)',
      code: 'import { User } from "@entities/user/index.ts";',
    },
    {
      description: 'Import from index file without extension (OK)',
      code: 'import { User } from "@entities/user/index";',
    },

    // Test file exceptions
    {
      description: 'Test file with direct import (exception)',
      ...withFilename(
        'import { userReducer } from "@entities/user/model/slice";',
        'src/features/auth/ui/LoginForm.test.tsx'
      ),
    },
    {
      description: 'Test file with multiple direct imports (exception)',
      ...withFilename(
        `import { userReducer } from "@entities/user/model/slice";
         import { authService } from "@features/auth/model/service";`,
        'src/features/auth/ui/LoginForm.spec.ts'
      ),
    },
    {
      description: 'Test file in testing directory (exception)',
      ...withFilename(
        'import { userReducer } from "@entities/user/model/slice";',
        'src/features/auth/testing/service.spec.ts'
      ),
    },
    {
      description: 'Test file with dynamic import (exception)',
      ...withFilename(
        'const { userReducer } = await import("@entities/user/model/slice");',
        'src/features/auth/ui/LoginForm.test.tsx'
      ),
    },
    {
      description: 'Test file with type import (exception)',
      ...withFilename(
        'import type { UserState } from "@entities/user/model/types";',
        'src/features/auth/ui/LoginForm.test.tsx'
      ),
    },

    // Custom configurations
    {
      description: 'Custom public API files',
      ...withOptions('import { userModel } from "@entities/user/public.ts";', {
        publicApiFiles: ['public.ts', 'api.ts'],
      }),
    },
    {
      description: 'Custom restricted layers',
      ...withOptions('import { userReducer } from "@entities/user/model/slice";', {
        layers: ['features', 'widgets'], // entities not restricted
      }),
    },
    {
      description: 'Ignored import patterns',
      ...withOptions('import { userTypes } from "@entities/user/model/types";', {
        ignoreImportPatterns: ['/model/types'],
      }),
    },
    {
      description: 'Custom layer definitions',
      ...withOptions('import { userService } from "@entities/user/service";', {
        layers: {
          entities: ['model', 'ui'],
          features: ['model', 'ui', 'api'],
          widgets: ['model', 'ui'],
        },
      }),
    },
    {
      description: 'Custom slice definitions',
      ...withOptions('import { userService } from "@entities/user/service";', {
        slices: {
          entities: ['user', 'profile'],
          features: ['auth', 'profile'],
          widgets: ['header', 'footer'],
        },
      }),
    },

    // Alias formats
    {
      description: 'Import with @entities format (OK)',
      code: 'import { User } from "@entities/user";',
    },
    {
      description: 'Import with @/entities format (OK)',
      code: 'import { User } from "@/entities/user";',
      options: [
        {
          alias: { value: '@', withSlash: true },
        },
      ],
    },
    {
      description: 'Import with custom alias format (OK)',
      code: 'import { User } from "#entities/user";',
      options: [
        {
          alias: { value: '#', withSlash: false },
        },
      ],
    },
    {
      description: 'Import with multiple aliases (OK)',
      code: 'import { User } from "~entities/user";',
      options: [
        {
          alias: { value: '~', withSlash: false },
        },
      ],
    },

    // Dynamic imports
    {
      description: 'Dynamic import through public API (OK)',
      code: 'const { User } = await import("@entities/user");',
    },
    {
      description: 'Dynamic import from index file (OK)',
      code: 'const { LoginForm } = await import("@features/auth/index");',
    },
    {
      description: 'Dynamic import with type assertion (OK)',
      code: 'const { User } = await import("@entities/user") as { User: typeof User };',
    },
    {
      description: 'Dynamic import with destructuring (OK)',
      code: 'const { default: User } = await import("@entities/user");',
    },
    {
      description: 'Dynamic import with default import (OK)',
      code: 'const User = await import("@entities/user").then(m => m.default);',
    },

    // Type imports
    {
      description: 'Type import from public API (OK)',
      code: 'import type { User } from "@entities/user";',
    },
    {
      description: 'Type import from index file (OK)',
      code: 'import type { LoginFormProps } from "@features/auth/index";',
    },
    {
      description: 'Type import with allowTypeImports (OK)',
      ...withOptions('import type { UserState } from "@entities/user/model/types";', {
        allowTypeImports: true,
      }),
    },
    {
      description: 'Type import from shared (OK)',
      code: 'import type { Theme } from "@shared/types/theme";',
    },
    {
      description: 'Type import from widget (OK)',
      code: 'import type { SidebarProps } from "@widgets/Sidebar";',
    },

    // Real-world scenarios
    {
      description: 'Import from hooks directory (OK)',
      code: 'import { useUser } from "@entities/user/hooks";',
    },
    {
      description: 'Import from constants directory (OK)',
      code: 'import { API_ENDPOINTS } from "@features/auth/constants";',
    },
    {
      description: 'Import from utils directory (OK)',
      code: 'import { formatUserName } from "@entities/user/utils";',
    },
    {
      description: 'Import from lib directory (OK)',
      code: 'import { formatDate } from "@shared/lib/date";',
    },
    {
      description: 'Import from config directory (OK)',
      code: 'import { theme } from "@shared/config/theme";',
    },
    {
      description: 'Import from types directory (OK)',
      code: 'import type { User } from "@entities/user/types";',
    },
  ],

  invalid: [
    // Direct model imports
    {
      description: 'Direct import from entity model (Forbidden)',
      code: 'import { userReducer } from "@entities/user/model/slice";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from feature model (Forbidden)',
      code: 'import { authReducer } from "@features/auth/model/slice";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from widget model (Forbidden)',
      code: 'import { sidebarReducer } from "@widgets/Sidebar/model/slice";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from page model (Forbidden)',
      code: 'import { homeReducer } from "@pages/home/model/slice";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from model directory (Forbidden)',
      code: 'import { userModel } from "@entities/user/model";',
      errors: [{ messageId: 'noDirectImport' }],
    },

    // Direct UI imports
    {
      description: 'Direct import from feature UI (Forbidden)',
      code: 'import { LoginForm } from "@features/auth/ui/LoginForm";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from entity UI (Forbidden)',
      code: 'import { UserCard } from "@entities/user/ui/UserCard";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from widget UI (Forbidden)',
      code: 'import { Sidebar } from "@widgets/Sidebar/ui/Sidebar";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from page UI (Forbidden)',
      code: 'import { HomePage } from "@pages/home/ui/HomePage";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from UI directory (Forbidden)',
      code: 'import { Button } from "@entities/user/ui";',
      errors: [{ messageId: 'noDirectImport' }],
    },

    // Direct API imports
    {
      description: 'Direct import from entity API (Forbidden)',
      code: 'import { fetchUserById } from "@entities/user/api/userApi";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from feature API (Forbidden)',
      code: 'import { loginRequest } from "@features/auth/api/authApi";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from widget API (Forbidden)',
      code: 'import { fetchSidebarData } from "@widgets/Sidebar/api/sidebarApi";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from page API (Forbidden)',
      code: 'import { fetchHomeData } from "@pages/home/api/homeApi";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from API directory (Forbidden)',
      code: 'import { userApi } from "@entities/user/api";',
      errors: [{ messageId: 'noDirectImport' }],
    },

    // Direct constant imports
    {
      description: 'Direct import from feature constants (Forbidden)',
      code: 'import { LOGIN_FEATURE_KEY } from "@features/auth/model/consts";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from entity constants (Forbidden)',
      code: 'import { USER_ROLES } from "@entities/user/constants";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from widget constants (Forbidden)',
      code: 'import { SIDEBAR_WIDTH } from "@widgets/Sidebar/constants";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from page constants (Forbidden)',
      code: 'import { HOME_PAGE_KEY } from "@pages/home/constants";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from constants directory (Forbidden)',
      code: 'import { userConstants } from "@entities/user/constants";',
      errors: [{ messageId: 'noDirectImport' }],
    },

    // Direct utility imports
    {
      description: 'Direct import from feature utilities (Forbidden)',
      code: 'import { validatePassword } from "@features/auth/lib/validators";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from entity utilities (Forbidden)',
      code: 'import { formatUserName } from "@entities/user/lib/formatters";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from widget utilities (Forbidden)',
      code: 'import { formatSidebarTitle } from "@widgets/Sidebar/lib/formatters";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from page utilities (Forbidden)',
      code: 'import { formatHomeTitle } from "@pages/home/lib/formatters";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from utils directory (Forbidden)',
      code: 'import { userUtils } from "@entities/user/utils";',
      errors: [{ messageId: 'noDirectImport' }],
    },

    // Direct hook imports
    {
      description: 'Direct import from feature hooks (Forbidden)',
      code: 'import { useAuth } from "@features/auth/hooks/useAuth";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from entity hooks (Forbidden)',
      code: 'import { useUser } from "@entities/user/hooks/useUser";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from widget hooks (Forbidden)',
      code: 'import { useSidebar } from "@widgets/Sidebar/hooks/useSidebar";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from page hooks (Forbidden)',
      code: 'import { useHome } from "@pages/home/hooks/useHome";',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct import from hooks directory (Forbidden)',
      code: 'import { userHooks } from "@entities/user/hooks";',
      errors: [{ messageId: 'noDirectImport' }],
    },

    // Direct type imports (when not allowed)
    {
      description: 'Direct type import from model (Forbidden)',
      ...withOptions('import type { UserState } from "@entities/user/model/types";', {
        allowTypeImports: false,
      }),
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct type import from UI (Forbidden)',
      ...withOptions('import type { UserCardProps } from "@entities/user/ui/UserCard";', {
        allowTypeImports: false,
      }),
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct type import from API (Forbidden)',
      ...withOptions('import type { UserApiResponse } from "@entities/user/api/userApi";', {
        allowTypeImports: false,
      }),
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct type import from constants (Forbidden)',
      ...withOptions('import type { UserRoles } from "@entities/user/constants";', {
        allowTypeImports: false,
      }),
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Direct type import from utils (Forbidden)',
      ...withOptions('import type { UserUtils } from "@entities/user/utils";', {
        allowTypeImports: false,
      }),
      errors: [{ messageId: 'noDirectImport' }],
    },

    // Dynamic imports (when not allowed)
    {
      description: 'Dynamic import from model (Forbidden)',
      code: 'const { userReducer } = await import("@entities/user/model/slice");',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Dynamic import from UI (Forbidden)',
      code: 'const { LoginForm } = await import("@features/auth/ui/LoginForm");',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Dynamic import from API (Forbidden)',
      code: 'const { fetchUserById } = await import("@entities/user/api/userApi");',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Dynamic import with type assertion (Forbidden)',
      code: 'const { userReducer } = await import("@entities/user/model/slice") as { userReducer: typeof userReducer };',
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Dynamic import with destructuring (Forbidden)',
      code: 'const { default: userReducer } = await import("@entities/user/model/slice");',
      errors: [{ messageId: 'noDirectImport' }],
    },

    // Complex scenarios
    {
      description: 'Multiple direct imports (Forbidden)',
      code: `
        import { userReducer } from "@entities/user/model/slice";
        import { LoginForm } from "@features/auth/ui/LoginForm";
        import { fetchUserById } from "@entities/user/api/userApi";
      `,
      errors: [{ messageId: 'noDirectImport' }, { messageId: 'noDirectImport' }, { messageId: 'noDirectImport' }],
    },
    {
      description: 'Mixed imports with valid and invalid (Forbidden)',
      code: `
        import { User } from "@entities/user";
        import { userReducer } from "@entities/user/model/slice";
        import { LoginForm } from "@features/auth";
      `,
      errors: [{ messageId: 'noDirectImport' }],
    },
    {
      description: 'Nested imports (Forbidden)',
      code: `
        import { userReducer } from "@entities/user/model/slice";
        import { authReducer } from "@features/auth/model/slice";
        import { sidebarReducer } from "@widgets/Sidebar/model/slice";
      `,
      errors: [{ messageId: 'noDirectImport' }, { messageId: 'noDirectImport' }, { messageId: 'noDirectImport' }],
    },
  ],
});
