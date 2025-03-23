/**
 * @fileoverview Tests for no-cross-slice-dependency rule
 */
import { testRule, withFilename, withOptions } from '../utils/test-utils.js';
import noCrossSliceDependency from '../../src/rules/no-cross-slice-dependency.js';

testRule('no-cross-slice-dependency', noCrossSliceDependency, {
  valid: [
    // Features layer tests (original functionality)
    {
      description: 'Import within the same feature slice (OK)',
      ...withFilename('import { loginReducer } from "../model/slice";', "src/features/auth/ui/LoginForm.tsx")
    },
    {
      description: 'Import from different layer (OK)',
      ...withFilename('import { Button } from "@shared/ui";', "src/features/auth/ui/LoginForm.tsx")
    },
    {
      description: 'Import from entities layer (OK)',
      ...withFilename('import { User } from "@entities/user";', "src/features/auth/ui/LoginForm.tsx")
    },
    {
      description: 'Relative import within same slice (OK)',
      ...withFilename('import { loginActions } from "./actions";', "src/features/auth/model/slice.ts")
    },
    {
      description: 'Relative import to parent directory within same slice (OK)',
      ...withFilename('import { authTypes } from "../types";', "src/features/auth/model/slice.ts")
    },
    {
      description: 'Import in non-feature layer with featuresOnly enabled (OK)',
      ...withOptions(
        withFilename('import { ProfileCard } from "@entities/profile";', "src/entities/user/model/user.ts"),
        { featuresOnly: true }
      )
    },
    {
      description: 'Windows path with valid import within same slice (OK)',
      ...withFilename('import { loginReducer } from "../model/slice";', "src\\features\\auth\\ui\\LoginForm.tsx")
    },
    {
      description: 'Type-only imports from another feature (OK when typesOnly is enabled)',
      ...withOptions(
        withFilename('import type { ArticleType } from "@features/article/model/types";', "src/features/auth/model/slice.ts"),
        { typesOnly: true }
      )
    },
    {
      description: 'With folder pattern (OK)',
      ...withOptions(
        withFilename('import { loginReducer } from "../model/slice";', "src/1_features/auth/ui/LoginForm.tsx"),
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
      description: 'Test file importing from another feature (exception)',
      ...withFilename('import { ArticleList } from "@features/article/ui/ArticleList";', "src/features/auth/ui/LoginForm.test.tsx")
    },
    {
      description: 'Import from shared layer (excluded by default)',
      ...withFilename('import { Button } from "@shared/ui";', "src/shared/api/api-provider.ts")
    },

    // Entities layer tests (new functionality)
    {
      description: 'Import within the same entities slice (OK)',
      ...withFilename('import { userModel } from "../model/user";', "src/entities/user/ui/UserCard.tsx")
    },
    {
      description: 'Import from shared layer to entities (OK)',
      ...withFilename('import { Button } from "@shared/ui";', "src/entities/user/ui/UserCard.tsx")
    },
    {
      description: 'Relative import within same entities slice (OK)',
      ...withFilename('import { userActions } from "./actions";', "src/entities/user/model/slice.ts")
    },

    // Widgets layer tests (new functionality)
    {
      description: 'Import within the same widgets slice (OK)',
      ...withFilename('import { headerUtils } from "../lib/utils";', "src/widgets/header/ui/Header.tsx")
    },
    {
      description: 'Import from features layer to widgets (OK)',
      ...withFilename('import { LoginForm } from "@features/auth";', "src/widgets/header/ui/Header.tsx")
    },

    // Pages layer tests (new functionality)
    {
      description: 'Import within the same pages slice (OK)',
      ...withFilename('import { profileModel } from "../model/profile";', "src/pages/profile/ui/ProfilePage.tsx")
    },

    // Layer excluded by config
    {
      description: 'Import between excluded layer slices (OK)',
      ...withOptions(
        withFilename('import { ArticleList } from "@widgets/article-list";', "src/widgets/sidebar/ui/Sidebar.tsx"),
        { excludeLayers: ['widgets'] }
      )
    }
  ],

  invalid: [
    // Features layer tests (original functionality)
    {
      description: 'Direct import from another feature slice model (Forbidden)',
      code: 'import { articleActions } from "@features/article/model/slice";',
      filename: "src/features/auth/ui/LoginForm.tsx",
      errors: [{ messageId: "noFeatureDependency" }],
    },
    {
      description: 'Direct import from another feature slice UI (Forbidden)',
      code: 'import { ProfileCard } from "@features/profile/ui/ProfileCard";',
      filename: "src/features/auth/model/login.ts",
      errors: [{ messageId: "noFeatureDependency" }],
    },
    {
      description: 'Windows path with forbidden cross-slice import',
      code: 'import { articleActions } from "@features/article/model/slice";',
      filename: "src\\features\\auth\\ui\\LoginForm.tsx",
      errors: [{ messageId: "noFeatureDependency" }],
    },
    {
      description: 'Relative path import from another slice (Forbidden)',
      code: 'import { fetchArticleById } from "../../article/api/articleApi";',
      filename: "src/features/auth/api/authApi.ts",
      errors: [{ messageId: "noFeatureDependency" }],
    },
    {
      description: 'With folder pattern (Forbidden)',
      code: 'import { articleActions } from "@features/article/model/slice";',
      filename: "src/1_features/auth/ui/LoginForm.tsx",
      options: [{
        folderPattern: {
          enabled: true,
          regex: "^(\\d+_)?(.*)",
          extractionGroup: 2
        }
      }],
      errors: [{ messageId: "noFeatureDependency" }],
    },
    {
      description: 'Type imports from another feature (Forbidden by default)',
      code: 'import type { ArticleType } from "@features/article/model/types";',
      filename: "src/features/auth/model/slice.ts",
      errors: [{ messageId: "noFeatureDependency" }],
    },
    {
      description: '@/features format with forbidden cross-slice import',
      code: 'import { ProfileCard } from "@/features/profile/ui/ProfileCard";',
      filename: "src/features/auth/model/login.ts",
      options: [{
        alias: { value: "@", withSlash: true }
      }],
      errors: [{ messageId: "noFeatureDependency" }],
    },

    // Entities layer tests (new functionality)
    {
      description: 'Direct import from another entities slice (Forbidden)',
      code: 'import { articleModel } from "@entities/article/model/article";',
      filename: "src/entities/user/model/user.ts",
      errors: [{ messageId: "noSliceDependency" }],
    },
    {
      description: 'Relative path import from another entities slice (Forbidden)',
      code: 'import { articleModel } from "../../article/model/article";',
      filename: "src/entities/user/model/user.ts",
      errors: [{ messageId: "noSliceDependency" }],
    },

    // Widgets layer tests (new functionality)
    {
      description: 'Direct import from another widgets slice (Forbidden)',
      code: 'import { SidebarContent } from "@widgets/sidebar/ui/SidebarContent";',
      filename: "src/widgets/header/ui/Header.tsx",
      errors: [{ messageId: "noSliceDependency" }],
    },

    // Pages layer tests (new functionality)
    {
      description: 'Direct import from another pages slice (Forbidden)',
      code: 'import { ArticlePageModel } from "@pages/article/model/article";',
      filename: "src/pages/profile/ui/ProfilePage.tsx",
      errors: [{ messageId: "noSliceDependency" }],
    },

    // Testing featuresOnly option
    {
      description: 'Import between entities slices (Allowed with featuresOnly)',
      code: 'import { articleModel } from "@entities/article/model/article";',
      filename: "src/entities/user/model/user.ts",
      options: [{ featuresOnly: true }],
      errors: []
    },
    {
      description: 'featuresOnly doesn\'t affect features layer checks',
      code: 'import { articleActions } from "@features/article/model/slice";',
      filename: "src/features/auth/ui/LoginForm.tsx",
      options: [{ featuresOnly: true }],
      errors: [{ messageId: "noFeatureDependency" }],
    }
  ],
});