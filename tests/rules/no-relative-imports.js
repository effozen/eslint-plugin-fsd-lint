/**
 * @fileoverview Tests for no-relative-imports rule
 */
import { testRule, withFilename, withOptions } from '../utils/test-utils.js';
import noRelativeImports from '../../src/rules/no-relative-imports.js';

testRule('no-relative-imports', noRelativeImports, {
  valid: [
    // Basic relative imports within same slice
    {
      description: 'Relative import within same slice (OK)',
      ...withFilename('import { Button } from "./Button";', 'src/shared/ui/Input/Input.tsx'),
    },
    {
      description: 'Parent directory import within same slice (OK)',
      ...withFilename('import { loginReducer } from "../model/slice";', 'src/features/auth/ui/LoginForm.tsx'),
    },
    {
      description: 'Current directory file import (OK)',
      ...withFilename('import { styles } from "./styles.css";', 'src/features/auth/ui/LoginForm.tsx'),
    },
    {
      description: 'Deep nested relative path within same slice (OK)',
      ...withFilename(
        'import { formatData } from "../../../lib/helpers";',
        'src/entities/article/ui/components/ArticleList/ArticleItem/ArticleItem.tsx'
      ),
    },
    {
      description: 'Relative import to sibling component (OK)',
      ...withFilename('import { Input } from "../Input";', 'src/shared/ui/Button/Button.tsx'),
    },
    {
      description: 'Relative import to parent slice (OK)',
      ...withFilename('import { authReducer } from "../model/slice";', 'src/features/auth/ui/LoginForm.tsx'),
    },

    // Absolute path imports
    {
      description: 'Absolute path import to different slice (OK)',
      ...withFilename('import { User } from "@entities/user";', 'src/features/auth/ui/LoginForm.tsx'),
    },
    {
      description: 'Absolute path import to shared layer (OK)',
      ...withFilename('import { Button } from "@shared/ui/button";', 'src/features/auth/ui/LoginForm.tsx'),
    },
    {
      description: 'Absolute path import to feature layer (OK)',
      ...withFilename('import { LoginForm } from "@features/auth";', 'src/widgets/header/ui/Header.tsx'),
    },
    {
      description: 'Absolute path import to entity layer (OK)',
      ...withFilename('import { User } from "@entities/user";', 'src/widgets/header/ui/Header.tsx'),
    },
    {
      description: 'Absolute path import to widget layer (OK)',
      ...withFilename('import { Header } from "@widgets/header";', 'src/pages/home/ui/HomePage.tsx'),
    },

    // Non-slice imports
    {
      description: 'Relative path import in path without slices (OK)',
      ...withFilename('import { setupTests } from "../setupTests";', 'src/app/App.test.tsx'),
    },
    {
      description: 'Node module import (OK)',
      ...withFilename('import React from "react";', 'src/features/auth/ui/LoginForm.tsx'),
    },
    {
      description: 'Third-party library import (OK)',
      ...withFilename('import { useDispatch } from "react-redux";', 'src/features/auth/ui/LoginForm.tsx'),
    },
    {
      description: 'CSS module import (OK)',
      ...withFilename('import styles from "./styles.module.css";', 'src/features/auth/ui/LoginForm.tsx'),
    },
    {
      description: 'JSON import (OK)',
      ...withFilename('import config from "./config.json";', 'src/features/auth/ui/LoginForm.tsx'),
    },

    // Type imports
    {
      description: 'Type import (OK, same rules apply)',
      ...withFilename('import type { ButtonProps } from "./Button.types";', 'src/shared/ui/Button/Button.tsx'),
    },
    {
      description: 'Type import from parent directory (OK)',
      ...withFilename('import type { LoginFormProps } from "../types";', 'src/features/auth/ui/LoginForm.tsx'),
    },
    {
      description: 'Type import from absolute path (OK)',
      ...withFilename('import type { User } from "@entities/user";', 'src/features/auth/ui/LoginForm.tsx'),
    },

    // Test file exceptions
    {
      description: 'Test file with relative import to another slice (exception)',
      ...withFilename(
        'import { articleMock } from "../../article/model/mock";',
        'src/entities/user/model/user.test.ts'
      ),
    },
    {
      description: 'Test file with multiple relative imports (exception)',
      ...withFilename(
        `import { userMock } from "../../user/model/mock";
         import { authMock } from "../../../auth/model/mock";`,
        'src/entities/profile/model/profile.test.ts'
      ),
    },
    {
      description: 'Test file in testing directory (exception)',
      ...withFilename(
        'import { userMock } from "../../user/model/mock";',
        'src/entities/profile/testing/profile.test.ts'
      ),
    },
    {
      description: 'Spec file with relative import (exception)',
      ...withFilename(
        'import { userMock } from "../../user/model/mock";',
        'src/entities/profile/model/profile.spec.ts'
      ),
    },

    // Path variations
    {
      description: 'Windows path with relative import within same slice (OK)',
      ...withFilename('import { buttonStyles } from "../styles";', 'src\\shared\\ui\\Button\\Button.tsx'),
    },
    {
      description: 'Unix path with relative import within same slice (OK)',
      ...withFilename('import { buttonStyles } from "../styles";', 'src/shared/ui/Button/Button.tsx'),
    },
    {
      description: 'Mixed path separators (OK)',
      ...withFilename('import { buttonStyles } from "../styles";', 'src/shared/ui/Button\\Button.tsx'),
    },

    // Custom configurations
    {
      description: 'Relative import between slices with allowBetweenSlices option (OK)',
      ...withOptions(
        withFilename('import { User } from "../../entities/user/model/user";', 'src/features/auth/ui/LoginForm.tsx'),
        { allowBetweenSlices: true }
      ),
    },
    {
      description: 'Relative import with custom ignored patterns (OK)',
      ...withOptions(
        withFilename('import { User } from "../../entities/user/model/user";', 'src/features/auth/ui/LoginForm.tsx'),
        { ignoreImportPatterns: ['/model/user'] }
      ),
    },
    {
      description: 'Relative import with custom excluded layers (OK)',
      ...withOptions(
        withFilename('import { User } from "../../entities/user/model/user";', 'src/features/auth/ui/LoginForm.tsx'),
        { excludeLayers: ['entities'] }
      ),
    },

    // Dynamic imports
    {
      description: 'Dynamic import within same slice (OK)',
      ...withFilename('const { Button } = await import("./Button");', 'src/shared/ui/Input/Input.tsx'),
    },
    {
      description: 'Dynamic import from parent directory (OK)',
      ...withFilename('const { loginReducer } = await import("../model/slice");', 'src/features/auth/ui/LoginForm.tsx'),
    },
    {
      description: 'Dynamic import from absolute path (OK)',
      ...withFilename('const { User } = await import("@entities/user");', 'src/features/auth/ui/LoginForm.tsx'),
    },

    // Real-world scenarios
    {
      description: 'Import from hooks directory (OK)',
      ...withFilename('import { useAuth } from "../hooks/useAuth";', 'src/features/auth/ui/LoginForm.tsx'),
    },
    {
      description: 'Import from constants directory (OK)',
      ...withFilename('import { API_ENDPOINTS } from "../constants";', 'src/features/auth/ui/LoginForm.tsx'),
    },
    {
      description: 'Import from utils directory (OK)',
      ...withFilename('import { formatUserName } from "../utils/formatters";', 'src/entities/user/ui/UserCard.tsx'),
    },
  ],

  invalid: [
    // Feature layer imports
    {
      description: 'Relative path import to different feature slice (Forbidden)',
      code: 'import { User } from "../../entities/user/model/user";',
      filename: 'src/features/auth/ui/LoginForm.tsx',
      errors: [{ messageId: 'noRelativePath' }],
    },
    {
      description: 'Relative path import to another feature slice (Forbidden)',
      code: 'import { ProfileForm } from "../../profile/ui/ProfileForm";',
      filename: 'src/features/auth/ui/LoginForm.tsx',
      errors: [{ messageId: 'noRelativePath' }],
    },
    {
      description: 'Relative path import to feature model (Forbidden)',
      code: 'import { authReducer } from "../../auth/model/slice";',
      filename: 'src/features/profile/ui/ProfilePage.tsx',
      errors: [{ messageId: 'noRelativePath' }],
    },

    // Entity layer imports
    {
      description: 'Relative path import to different entity slice (Forbidden)',
      code: 'import { Article } from "../../article/model/article";',
      filename: 'src/entities/user/model/user.ts',
      errors: [{ messageId: 'noRelativePath' }],
    },
    {
      description: 'Relative path import to entity UI (Forbidden)',
      code: 'import { UserCard } from "../../user/ui/UserCard";',
      filename: 'src/entities/profile/ui/ProfileCard.tsx',
      errors: [{ messageId: 'noRelativePath' }],
    },
    {
      description: 'Relative path import to entity API (Forbidden)',
      code: 'import { fetchUserById } from "../../user/api/userApi";',
      filename: 'src/entities/profile/api/profileApi.ts',
      errors: [{ messageId: 'noRelativePath' }],
    },

    // Widget layer imports
    {
      description: 'Relative path import to different widget slice (Forbidden)',
      code: 'import { Header } from "../../header/ui/Header";',
      filename: 'src/widgets/footer/ui/Footer.tsx',
      errors: [{ messageId: 'noRelativePath' }],
    },
    {
      description: 'Relative path import to widget model (Forbidden)',
      code: 'import { headerReducer } from "../../header/model/slice";',
      filename: 'src/widgets/footer/model/footerSlice.ts',
      errors: [{ messageId: 'noRelativePath' }],
    },
    {
      description: 'Relative path import to widget API (Forbidden)',
      code: 'import { fetchHeaderData } from "../../header/api/headerApi";',
      filename: 'src/widgets/footer/api/footerApi.ts',
      errors: [{ messageId: 'noRelativePath' }],
    },

    // Cross-layer imports
    {
      description: 'Relative path import to different layer (Forbidden)',
      code: 'import { LoginForm } from "../../../features/auth/ui/LoginForm";',
      filename: 'src/widgets/Header/ui/Header.tsx',
      errors: [{ messageId: 'noRelativePath' }],
    },
    {
      description: 'Relative path import to higher layer (Forbidden)',
      code: 'import { ProfilePage } from "../../pages/profile/ui/ProfilePage";',
      filename: 'src/features/auth/ui/LoginForm.tsx',
      errors: [{ messageId: 'noRelativePath' }],
    },
    {
      description: 'Relative path import to lower layer (Forbidden)',
      code: 'import { Button } from "../../shared/ui/Button";',
      filename: 'src/features/auth/ui/LoginForm.tsx',
      errors: [{ messageId: 'noRelativePath' }],
    },
    {
      description: 'Relative path import from entity to feature (Forbidden)',
      code: 'import { authService } from "../../auth/model/service";',
      filename: 'src/entities/user/model/userService.ts',
      errors: [{ messageId: 'noRelativePath' }],
    },
    {
      description: 'Relative path import from widget to entity (Forbidden)',
      code: 'import { User } from "../../user/model/user";',
      filename: 'src/widgets/header/ui/Header.tsx',
      errors: [{ messageId: 'noRelativePath' }],
    },

    // Path variations
    {
      description: 'Multi-level relative path to different slice (Forbidden)',
      code: 'import { User } from "../../../../entities/user/model/user";',
      filename: 'src/features/auth/ui/components/LoginButton.tsx',
      errors: [{ messageId: 'noRelativePath' }],
    },
    {
      description: 'Windows path with forbidden relative import',
      code: 'import { userModel } from "..\\..\\entities\\user\\model\\user";',
      filename: 'src\\features\\auth\\ui\\LoginForm.tsx',
      errors: [{ messageId: 'noRelativePath' }],
    },
    {
      description: 'Mixed path separators (Forbidden)',
      code: 'import { userModel } from "..\\../entities/user/model/user";',
      filename: 'src/features/auth/ui/LoginForm.tsx',
      errors: [{ messageId: 'noRelativePath' }],
    },

    // Folder pattern variations
    {
      description: 'With folder pattern (Forbidden)',
      code: 'import { User } from "../../5_entities/user/model/user";',
      filename: 'src/1_features/auth/ui/LoginForm.tsx',
      options: [
        {
          folderPattern: {
            enabled: true,
            regex: '^(\\d+_)?(.*)',
            extractionGroup: 2,
          },
        },
      ],
      errors: [{ messageId: 'noRelativePath' }],
    },
    {
      description: 'With custom folder pattern (Forbidden)',
      code: 'import { User } from "../../entities/user/model/user";',
      filename: 'src/features/auth/ui/LoginForm.tsx',
      options: [
        {
          folderPattern: {
            enabled: true,
            regex: '^(.*)',
            extractionGroup: 1,
          },
        },
      ],
      errors: [{ messageId: 'noRelativePath' }],
    },

    // Dynamic imports
    {
      description: 'Dynamic import to different slice (Forbidden)',
      code: 'const { User } = await import("../../entities/user/model/user");',
      filename: 'src/features/auth/ui/LoginForm.tsx',
      errors: [{ messageId: 'noRelativePath' }],
    },
    {
      description: 'Dynamic import to different layer (Forbidden)',
      code: 'const { LoginForm } = await import("../../../features/auth/ui/LoginForm");',
      filename: 'src/widgets/Header/ui/Header.tsx',
      errors: [{ messageId: 'noRelativePath' }],
    },
    {
      description: 'Dynamic import with type assertion (Forbidden)',
      code: 'const { User } = await import("../../entities/user/model/user") as { User: typeof User };',
      filename: 'src/features/auth/ui/LoginForm.tsx',
      errors: [{ messageId: 'noRelativePath' }],
    },

    // Type imports
    {
      description: 'Type import to different slice (Forbidden)',
      code: 'import type { UserState } from "../../entities/user/model/types";',
      filename: 'src/features/auth/ui/LoginForm.tsx',
      errors: [{ messageId: 'noRelativePath' }],
    },
    {
      description: 'Type import to different layer (Forbidden)',
      code: 'import type { LoginFormProps } from "../../../features/auth/ui/LoginForm";',
      filename: 'src/widgets/Header/ui/Header.tsx',
      errors: [{ messageId: 'noRelativePath' }],
    },

    // Real-world scenarios
    {
      description: 'Import from hooks directory in different slice (Forbidden)',
      code: 'import { useUser } from "../../user/model/hooks";',
      filename: 'src/entities/profile/model/profileHooks.ts',
      errors: [{ messageId: 'noRelativePath' }],
    },
    {
      description: 'Import from styles in different slice (Forbidden)',
      code: 'import styles from "../../auth/ui/styles.module.css";',
      filename: 'src/features/profile/ui/ProfilePage.tsx',
      errors: [{ messageId: 'noRelativePath' }],
    },
    {
      description: 'Import from config in different slice (Forbidden)',
      code: 'import { API_CONFIG } from "../../auth/config";',
      filename: 'src/features/profile/config/profileConfig.ts',
      errors: [{ messageId: 'noRelativePath' }],
    },

    // Complex scenarios
    {
      description: 'Multiple relative imports to different slices (Forbidden)',
      code: `
        import { userReducer } from "../../user/model/slice";
        import { LoginForm } from "../../auth/ui/LoginForm";
        const { authService } = await import("../../auth/model/service");
      `,
      filename: 'src/features/profile/model/profileService.ts',
      errors: [{ messageId: 'noRelativePath' }, { messageId: 'noRelativePath' }, { messageId: 'noRelativePath' }],
    },
  ],
});
