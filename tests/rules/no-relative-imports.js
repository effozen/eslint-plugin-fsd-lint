/**
 * @fileoverview Tests for no-relative-imports rule
 */
import { testRule, withFilename, withOptions } from '../utils/test-utils.js';
import noRelativeImports from '../../src/rules/no-relative-imports.js';

testRule('no-relative-imports', noRelativeImports, {
  valid: [
    {
      description: 'Relative import within same slice (OK)',
      ...withFilename('import { Button } from "./Button";', "src/shared/ui/Input/Input.tsx")
    },
    {
      description: 'Parent directory import within same slice (OK)',
      ...withFilename('import { loginReducer } from "../model/slice";', "src/features/auth/ui/LoginForm.tsx")
    },
    {
      description: 'Absolute path import to different slice (OK)',
      ...withFilename('import { User } from "@entities/user";', "src/features/auth/ui/LoginForm.tsx")
    },
    {
      description: 'Current directory file import (OK)',
      ...withFilename('import { styles } from "./styles.css";', "src/features/auth/ui/LoginForm.tsx")
    },
    {
      description: 'Deep nested relative path within same slice (OK)',
      ...withFilename('import { formatData } from "../../../lib/helpers";', "src/entities/article/ui/components/ArticleList/ArticleItem/ArticleItem.tsx")
    },
    {
      description: 'Relative path import in path without slices (OK)',
      ...withFilename('import { setupTests } from "../setupTests";', "src/app/App.test.tsx")
    },
    {
      description: 'Node module import (OK)',
      ...withFilename('import React from "react";', "src/features/auth/ui/LoginForm.tsx")
    },
    {
      description: 'Type import (OK, same rules apply)',
      ...withFilename('import type { ButtonProps } from "./Button.types";', "src/shared/ui/Button/Button.tsx")
    },
    {
      description: 'Test file with relative import to another slice (exception)',
      ...withFilename('import { articleMock } from "../../article/model/mock";', "src/entities/user/model/user.test.ts")
    },
    {
      description: 'Windows path with relative import within same slice (OK)',
      ...withFilename('import { buttonStyles } from "../styles";', "src\\shared\\ui\\Button\\Button.tsx")
    },
    {
      description: 'Relative import between slices with allowBetweenSlices option (OK)',
      ...withOptions(
        withFilename('import { User } from "../../entities/user/model/user";', "src/features/auth/ui/LoginForm.tsx"),
        { allowBetweenSlices: true }
      )
    }
  ],

  invalid: [
    {
      description: 'Relative path import to different slice (Forbidden)',
      code: 'import { User } from "../../entities/user/model/user";',
      filename: "src/features/auth/ui/LoginForm.tsx",
      errors: [{ messageId: "noRelativePath" }],
    },
    {
      description: 'Relative path import to different layer (Forbidden)',
      code: 'import { LoginForm } from "../../../features/auth/ui/LoginForm";',
      filename: "src/widgets/Header/ui/Header.tsx",
      errors: [{ messageId: "noRelativePath" }],
    },
    {
      description: 'Relative path import to higher layer (Forbidden)',
      code: 'import { ProfilePage } from "../../pages/profile/ui/ProfilePage";',
      filename: "src/features/auth/ui/LoginForm.tsx",
      errors: [{ messageId: "noRelativePath" }],
    },
    {
      description: 'Relative path import to lower layer (Forbidden)',
      code: 'import { Button } from "../../shared/ui/Button";',
      filename: "src/features/auth/ui/LoginForm.tsx",
      errors: [{ messageId: "noRelativePath" }],
    },
    {
      description: 'Multi-level relative path to different slice (Forbidden)',
      code: 'import { User } from "../../../../entities/user/model/user";',
      filename: "src/features/auth/ui/components/LoginButton.tsx",
      errors: [{ messageId: "noRelativePath" }],
    },
    {
      description: 'Windows path with forbidden relative import',
      code: 'import { userModel } from "..\\..\\entities\\user\\model\\user";',
      filename: "src\\features\\auth\\ui\\LoginForm.tsx",
      errors: [{ messageId: "noRelativePath" }],
    },
    {
      description: 'With folder pattern (Forbidden)',
      code: 'import { User } from "../../5_entities/user/model/user";',
      filename: "src/1_features/auth/ui/LoginForm.tsx",
      options: [{
        folderPattern: {
          enabled: true,
          regex: "^(\\d+_)?(.*)",
          extractionGroup: 2
        }
      }],
      errors: [{ messageId: "noRelativePath" }],
    }
  ],
});