/**
 * @fileoverview Tests for no-cross-slice-dependency rule
 */
import { testRule, withFilename } from '../utils/test-utils';
import noCrossSliceDependency from '../../src/rules/no-cross-slice-dependency';

testRule('no-cross-slice-dependency', noCrossSliceDependency, {
  valid: [
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
      description: 'Import in non-feature layer (OK)',
      ...withFilename('import { Header } from "@widgets/Header";', "src/pages/profile/ui/ProfilePage.tsx")
    },
    {
      description: 'Import from feature index file (OK)',
      ...withFilename('import { LoginForm } from "@features/auth";', "src/widgets/Sidebar/ui/Sidebar.tsx")
    },
    {
      description: 'Import types from other feature (OK - can be allowed by configuration)',
      ...withFilename('import type { ArticleType } from "@features/article/model/types";', "src/features/auth/model/slice.ts")
    },
  ],
  invalid: [
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
      description: 'Direct import from another feature slice API (Forbidden)',
      code: 'import { fetchArticleById } from "@features/article/api/articleApi";',
      filename: "src/features/auth/api/authApi.ts",
      errors: [{ messageId: "noFeatureDependency" }],
    },
    {
      description: 'Direct import of constants from another feature slice (Forbidden)',
      code: 'import { ARTICLE_SLICE_NAME } from "@features/article/model/consts";',
      filename: "src/features/auth/model/consts.ts",
      errors: [{ messageId: "noFeatureDependency" }],
    },
    {
      description: 'Relative path import from another slice (Forbidden)',
      code: 'import { fetchArticleById } from "../../article/api/articleApi";',
      filename: "src/features/auth/api/authApi.ts",
      errors: [{ messageId: "noFeatureDependency" }],
    },
    {
      description: 'Multiple cross-slice imports (Forbidden)',
      code: `
        import { articleActions } from "@features/article/model/slice";
        import { ProfileCard } from "@features/profile/ui/ProfileCard";
      `,
      filename: "src/features/auth/ui/LoginForm.tsx",
      errors: [
        { messageId: "noFeatureDependency" },
        { messageId: "noFeatureDependency" }
      ],
    },
  ],
});