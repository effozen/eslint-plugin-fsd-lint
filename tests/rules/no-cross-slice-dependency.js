/**
 * @fileoverview Tests for no-cross-slice-dependency rule
 */
import { testRule, withFilename, withOptions } from '../utils/test-utils.js';
import noCrossSliceDependency from '../../src/rules/no-cross-slice-dependency.js';

testRule('no-cross-slice-dependency', noCrossSliceDependency, {
  valid: [
    // Basic imports from lower layers
    {
      description: 'Feature importing from entity (OK)',
      code: 'import { User } from "@entities/user";',
    },
    {
      description: 'Widget importing from entity (OK)',
      code: 'import { User } from "@entities/user";',
    },
    {
      description: 'Page importing from widget (OK)',
      code: 'import { Header } from "@widgets/header";',
    },
    {
      description: 'Feature importing from shared (OK)',
      code: 'import { Button } from "@shared/ui/button";',
    },
    {
      description: 'Entity importing from shared (OK)',
      code: 'import { api } from "@shared/api/base";',
    },
    {
      description: 'Widget importing from shared (OK)',
      code: 'import { theme } from "@shared/config/theme";',
    },

    // Relative path imports within same slice
    {
      description: 'Relative import within same slice (OK)',
      code: 'import { Button } from "./Button";',
    },
    {
      description: 'Relative import within same feature (OK)',
      code: 'import { LoginForm } from "../ui/LoginForm";',
    },
    {
      description: 'Relative import within same entity (OK)',
      code: 'import { userReducer } from "./slice";',
    },
    {
      description: 'Deep nested relative path within same slice (OK)',
      code: 'import { formatData } from "../../../lib/helpers";',
    },
    {
      description: 'Relative import to sibling component (OK)',
      code: 'import { Input } from "../Input";',
    },
    {
      description: 'Relative import to parent slice (OK)',
      code: 'import { authReducer } from "../model/slice";',
    },

    // Test file exceptions
    {
      description: 'Test file with cross-slice import (exception)',
      ...withFilename(
        'import { userReducer } from "@entities/user/model/slice";',
        'src/features/auth/ui/LoginForm.test.tsx'
      ),
    },
    {
      description: 'Test file with multiple cross-slice imports (exception)',
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
      description: 'Custom excluded layers',
      ...withOptions('import { userReducer } from "@entities/user/model/slice";', {
        excludeLayers: ['entities'],
      }),
    },
    {
      description: 'Features only mode',
      ...withOptions('import { userReducer } from "@entities/user/model/slice";', {
        featuresOnly: true,
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
      ...withOptions('import { userReducer } from "@domain/user/model/slice";', {
        layerDefinitions: {
          domain: ['domain'],
          application: ['application'],
          infrastructure: ['infrastructure'],
        },
      }),
    },
    {
      description: 'Custom slice definitions',
      ...withOptions('import { userReducer } from "@domain/user/model/slice";', {
        sliceDefinitions: {
          domain: ['domain'],
          application: ['application'],
          infrastructure: ['infrastructure'],
        },
      }),
    },

    // Type imports
    {
      description: 'Type import with allowTypeImports (OK)',
      ...withOptions('import type { UserState } from "@entities/user/model/types";', {
        allowTypeImports: true,
      }),
    },
    {
      description: 'Type import from public API (OK)',
      code: 'import type { User } from "@entities/user";',
    },
    {
      description: 'Type import from index file (OK)',
      code: 'import type { LoginFormProps } from "@features/auth/index";',
    },
    {
      description: 'Type import from shared (OK)',
      code: 'import type { ButtonProps } from "@shared/ui/button";',
    },
    {
      description: 'Type import from widget (OK)',
      code: 'import type { HeaderProps } from "@widgets/header";',
    },

    // Dynamic imports
    {
      description: 'Dynamic import from lower layer (OK)',
      code: 'const { User } = await import("@entities/user");',
    },
    {
      description: 'Dynamic import from shared (OK)',
      code: 'const { Button } = await import("@shared/ui/button");',
    },
    {
      description: 'Dynamic import with type assertion (OK)',
      code: 'const { User } = await import("@entities/user") as { User: typeof User };',
    },
    {
      description: 'Dynamic import with destructuring (OK)',
      code: 'const { User, userReducer } = await import("@entities/user");',
    },
    {
      description: 'Dynamic import with default import (OK)',
      code: 'const User = await import("@entities/user");',
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
      code: 'import { classNames } from "@shared/lib/classNames";',
    },
    {
      description: 'Import from config directory (OK)',
      code: 'import { API_CONFIG } from "@shared/config/api";',
    },
    {
      description: 'Import from types directory (OK)',
      code: 'import { UserType } from "@entities/user/types";',
    },
  ],

  invalid: [
    // Feature to feature imports
    {
      description: 'Feature importing from another feature (Forbidden)',
      code: 'import { authService } from "@features/auth/model/service";',
      filename: 'src/features/profile/model/profileService.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },
    {
      description: 'Feature importing UI from another feature (Forbidden)',
      code: 'import { LoginForm } from "@features/auth/ui/LoginForm";',
      filename: 'src/features/profile/ui/ProfilePage.tsx',
      errors: [{ messageId: 'noFeatureDependency' }],
    },
    {
      description: 'Feature importing API from another feature (Forbidden)',
      code: 'import { loginRequest } from "@features/auth/api/authApi";',
      filename: 'src/features/profile/api/profileApi.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },
    {
      description: 'Feature importing hooks from another feature (Forbidden)',
      code: 'import { useAuth } from "@features/auth/hooks/useAuth";',
      filename: 'src/features/profile/hooks/useProfile.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },
    {
      description: 'Feature importing constants from another feature (Forbidden)',
      code: 'import { AUTH_ENDPOINTS } from "@features/auth/constants";',
      filename: 'src/features/profile/constants.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },
    {
      description: 'Feature importing utils from another feature (Forbidden)',
      code: 'import { formatAuthData } from "@features/auth/utils/formatters";',
      filename: 'src/features/profile/utils/formatters.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },
    {
      description: 'Feature importing lib from another feature (Forbidden)',
      code: 'import { authHelpers } from "@features/auth/lib/helpers";',
      filename: 'src/features/profile/lib/helpers.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },
    {
      description: 'Feature importing config from another feature (Forbidden)',
      code: 'import { AUTH_CONFIG } from "@features/auth/config";',
      filename: 'src/features/profile/config.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },
    {
      description: 'Feature importing types from another feature (Forbidden)',
      code: 'import { AuthState } from "@features/auth/types";',
      filename: 'src/features/profile/types.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },

    // Entity to entity imports
    {
      description: 'Entity importing from another entity (Forbidden)',
      code: 'import { userReducer } from "@entities/user/model/slice";',
      filename: 'src/entities/profile/model/profileSlice.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Entity importing UI from another entity (Forbidden)',
      code: 'import { UserCard } from "@entities/user/ui/UserCard";',
      filename: 'src/entities/profile/ui/ProfileCard.tsx',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Entity importing API from another entity (Forbidden)',
      code: 'import { fetchUserById } from "@entities/user/api/userApi";',
      filename: 'src/entities/profile/api/profileApi.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Entity importing hooks from another entity (Forbidden)',
      code: 'import { useUser } from "@entities/user/hooks/useUser";',
      filename: 'src/entities/profile/hooks/useProfile.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Entity importing constants from another entity (Forbidden)',
      code: 'import { USER_ENDPOINTS } from "@entities/user/constants";',
      filename: 'src/entities/profile/constants.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Entity importing utils from another entity (Forbidden)',
      code: 'import { formatUserData } from "@entities/user/utils/formatters";',
      filename: 'src/entities/profile/utils/formatters.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Entity importing lib from another entity (Forbidden)',
      code: 'import { userHelpers } from "@entities/user/lib/helpers";',
      filename: 'src/entities/profile/lib/helpers.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Entity importing config from another entity (Forbidden)',
      code: 'import { USER_CONFIG } from "@entities/user/config";',
      filename: 'src/entities/profile/config.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Entity importing types from another entity (Forbidden)',
      code: 'import { UserState } from "@entities/user/types";',
      filename: 'src/entities/profile/types.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },

    // Widget to widget imports
    {
      description: 'Widget importing from another widget (Forbidden)',
      code: 'import { Header } from "@widgets/header/ui/Header";',
      filename: 'src/widgets/footer/ui/Footer.tsx',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Widget importing model from another widget (Forbidden)',
      code: 'import { headerReducer } from "@widgets/header/model/slice";',
      filename: 'src/widgets/footer/model/footerSlice.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Widget importing API from another widget (Forbidden)',
      code: 'import { fetchHeaderData } from "@widgets/header/api/headerApi";',
      filename: 'src/widgets/footer/api/footerApi.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Widget importing hooks from another widget (Forbidden)',
      code: 'import { useHeader } from "@widgets/header/hooks/useHeader";',
      filename: 'src/widgets/footer/hooks/useFooter.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Widget importing constants from another widget (Forbidden)',
      code: 'import { HEADER_ENDPOINTS } from "@widgets/header/constants";',
      filename: 'src/widgets/footer/constants.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Widget importing utils from another widget (Forbidden)',
      code: 'import { formatHeaderData } from "@widgets/header/utils/formatters";',
      filename: 'src/widgets/footer/utils/formatters.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Widget importing lib from another widget (Forbidden)',
      code: 'import { headerHelpers } from "@widgets/header/lib/helpers";',
      filename: 'src/widgets/footer/lib/helpers.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Widget importing config from another widget (Forbidden)',
      code: 'import { HEADER_CONFIG } from "@widgets/header/config";',
      filename: 'src/widgets/footer/config.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Widget importing types from another widget (Forbidden)',
      code: 'import { HeaderState } from "@widgets/header/types";',
      filename: 'src/widgets/footer/types.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },

    // Higher to lower layer imports
    {
      description: 'Entity importing from feature (Forbidden)',
      code: 'import { authService } from "@features/auth/model/service";',
      filename: 'src/entities/user/model/userService.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Widget importing from feature (Forbidden)',
      code: 'import { LoginForm } from "@features/auth/ui/LoginForm";',
      filename: 'src/widgets/header/ui/Header.tsx',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Entity importing from widget (Forbidden)',
      code: 'import { Header } from "@widgets/header/ui/Header";',
      filename: 'src/entities/user/ui/UserCard.tsx',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Entity importing from page (Forbidden)',
      code: 'import { ProfilePage } from "@pages/profile/ui/ProfilePage";',
      filename: 'src/entities/user/ui/UserCard.tsx',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Widget importing from page (Forbidden)',
      code: 'import { ProfilePage } from "@pages/profile/ui/ProfilePage";',
      filename: 'src/widgets/header/ui/Header.tsx',
      errors: [{ messageId: 'noSliceDependency' }],
    },

    // Dynamic imports
    {
      description: 'Dynamic import from another feature (Forbidden)',
      code: 'const { authService } = await import("@features/auth/model/service");',
      filename: 'src/features/profile/model/profileService.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },
    {
      description: 'Dynamic import from another entity (Forbidden)',
      code: 'const { userReducer } = await import("@entities/user/model/slice");',
      filename: 'src/entities/profile/model/profileSlice.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Dynamic import from another widget (Forbidden)',
      code: 'const { Header } = await import("@widgets/header/ui/Header");',
      filename: 'src/widgets/footer/ui/Footer.tsx',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Dynamic import with type assertion (Forbidden)',
      code: 'const { authService } = await import("@features/auth/model/service") as { authService: typeof authService };',
      filename: 'src/features/profile/model/profileService.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },
    {
      description: 'Dynamic import with destructuring (Forbidden)',
      code: 'const { authService, loginReducer } = await import("@features/auth/model/service");',
      filename: 'src/features/profile/model/profileService.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },
    {
      description: 'Dynamic import with default import (Forbidden)',
      code: 'const authService = await import("@features/auth/model/service");',
      filename: 'src/features/profile/model/profileService.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },

    // Type imports (when not allowed)
    {
      description: 'Type import from another feature (Forbidden)',
      ...withOptions('import type { AuthState } from "@features/auth/model/types";', {
        allowTypeImports: false,
      }),
      filename: 'src/features/profile/model/profileTypes.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },
    {
      description: 'Type import from another entity (Forbidden)',
      ...withOptions('import type { UserState } from "@entities/user/model/types";', {
        allowTypeImports: false,
      }),
      filename: 'src/entities/profile/model/profileTypes.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Type import from another widget (Forbidden)',
      ...withOptions('import type { HeaderState } from "@widgets/header/model/types";', {
        allowTypeImports: false,
      }),
      filename: 'src/widgets/footer/model/footerTypes.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Type import from higher layer (Forbidden)',
      ...withOptions('import type { AuthState } from "@features/auth/model/types";', {
        allowTypeImports: false,
      }),
      filename: 'src/entities/user/model/userTypes.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },

    // Circular dependencies
    {
      description: 'Circular dependency between features (Forbidden)',
      code: `
        // In profile feature
        import { authService } from "@features/auth/model/service";
        // In auth feature
        import { profileService } from "@features/profile/model/service";
      `,
      filename: 'src/features/profile/model/profileService.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },
    {
      description: 'Circular dependency between entities (Forbidden)',
      code: `
        // In profile entity
        import { userReducer } from "@entities/user/model/slice";
        // In user entity
        import { profileReducer } from "@entities/profile/model/slice";
      `,
      filename: 'src/entities/profile/model/profileSlice.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Circular dependency between widgets (Forbidden)',
      code: `
        // In footer widget
        import { Header } from "@widgets/header/ui/Header";
        // In header widget
        import { Footer } from "@widgets/footer/ui/Footer";
      `,
      filename: 'src/widgets/footer/ui/Footer.tsx',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Circular dependency between layers (Forbidden)',
      code: `
        // In entity
        import { authService } from "@features/auth/model/service";
        // In feature
        import { userReducer } from "@entities/user/model/slice";
      `,
      filename: 'src/entities/user/model/userService.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },

    // Real-world scenarios
    {
      description: 'Direct import from hooks (Forbidden)',
      code: 'import { useUser } from "@entities/user/model/hooks";',
      filename: 'src/entities/profile/model/profileHooks.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
    {
      description: 'Direct import from styles (Forbidden)',
      code: 'import styles from "@features/auth/ui/styles.module.css";',
      filename: 'src/features/profile/ui/ProfilePage.tsx',
      errors: [{ messageId: 'noFeatureDependency' }],
    },
    {
      description: 'Direct import from config (Forbidden)',
      code: 'import { API_CONFIG } from "@features/auth/config";',
      filename: 'src/features/profile/config/profileConfig.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },
    {
      description: 'Direct import from lib (Forbidden)',
      code: 'import { authHelpers } from "@features/auth/lib/helpers";',
      filename: 'src/features/profile/lib/helpers.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },
    {
      description: 'Direct import from utils (Forbidden)',
      code: 'import { formatAuthData } from "@features/auth/utils/formatters";',
      filename: 'src/features/profile/utils/formatters.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },
    {
      description: 'Direct import from types (Forbidden)',
      code: 'import { AuthState } from "@features/auth/types";',
      filename: 'src/features/profile/types.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },
    {
      description: 'Direct import from constants (Forbidden)',
      code: 'import { AUTH_ENDPOINTS } from "@features/auth/constants";',
      filename: 'src/features/profile/constants.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },

    // Complex scenarios
    {
      description: 'Multiple cross-slice imports (Forbidden)',
      code: `
        import { userReducer } from "@entities/user/model/slice";
        import { LoginForm } from "@features/auth/ui/LoginForm";
        const { authService } = await import("@features/auth/model/service");
      `,
      filename: 'src/features/profile/model/profileService.ts',
      errors: [
        { messageId: 'noSliceDependency' },
        { messageId: 'noFeatureDependency' },
        { messageId: 'noFeatureDependency' },
      ],
    },
    {
      description: 'Mixed imports with valid and invalid (Forbidden)',
      code: `
        import { User } from "@entities/user";
        import { authService } from "@features/auth/model/service";
        import { Button } from "@shared/ui/button";
      `,
      filename: 'src/features/profile/model/profileService.ts',
      errors: [{ messageId: 'noFeatureDependency' }],
    },
    {
      description: 'Nested imports (Forbidden)',
      code: `
        import { userService } from "@entities/user";
        // userService internally imports from @features/auth
      `,
      filename: 'src/features/profile/model/profileService.ts',
      errors: [{ messageId: 'noSliceDependency' }],
    },
  ],
});
