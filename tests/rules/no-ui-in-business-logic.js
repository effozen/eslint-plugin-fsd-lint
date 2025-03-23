/**
 * @fileoverview Tests for no-ui-in-business-logic rule
 */
import { testRule, withFilename, withOptions } from '../utils/test-utils.js';
import noUiInBusinessLogic from '../../src/rules/no-ui-in-business-logic.js';

testRule('no-ui-in-business-logic', noUiInBusinessLogic, {
  valid: [
    {
      description: 'Entity UI layer importing from shared (OK)',
      ...withFilename('import { Button } from "@shared/ui";', "src/entities/user/ui/UserCard.tsx")
    },
    {
      description: 'Widget importing from entity (OK)',
      ...withFilename('import { User } from "@entities/user";', "src/widgets/Header/ui/Header.tsx")
    },
    {
      description: 'Entity importing from shared (OK)',
      ...withFilename('import { classNames } from "@shared/lib/classNames";', "src/entities/user/model/user.ts")
    },
    {
      description: 'Entity importing from another entity (OK)',
      ...withFilename('import { Article } from "@entities/article";', "src/entities/user/model/user.ts")
    },
    {
      description: 'Feature importing from widget (OK)',
      ...withFilename('import { Sidebar } from "@widgets/Sidebar";', "src/features/auth/ui/LoginForm.tsx")
    },
    {
      description: 'Page importing from widget (OK)',
      ...withFilename('import { Header } from "@widgets/Header";', "src/pages/profile/ui/ProfilePage.tsx")
    },
    {
      description: 'Entity UI component importing from widget (OK - UI can import UI)',
      ...withFilename('import { Header } from "@widgets/Header";', "src/entities/user/ui/UserProfile.tsx")
    },
    {
      description: 'Type import unrelated to business logic (OK)',
      ...withFilename('import type { HeaderProps } from "@widgets/Header";', "src/entities/user/model/user.ts")
    },
    {
      description: 'Test file importing from widget to entity (exception)',
      ...withFilename('import { Header } from "@widgets/Header";', "src/entities/user/model/user.test.ts")
    },
    {
      description: 'Custom business logic layer definition',
      ...withOptions(
        withFilename('import { Header } from "@widgets/Header";', "src/domain/user/model/user.ts"),
        {
          businessLogicLayers: ['domain'],
          uiLayers: ['widgets', 'pages']
        }
      )
    },
    {
      description: 'Windows path with valid import',
      ...withFilename('import { Article } from "@entities/article";', "src\\entities\\user\\model\\user.ts")
    }
  ],

  invalid: [
    {
      description: 'Entity model importing from widget (Forbidden)',
      code: 'import { Header } from "@widgets/Header";',
      filename: "src/entities/user/model/user.ts",
      errors: [{ messageId: "noCrossUI" }],
    },
    {
      description: 'Entity API importing from widget (Forbidden)',
      code: 'import { Sidebar } from "@widgets/Sidebar/ui/Sidebar";',
      filename: "src/entities/article/api/articleApi.ts",
      errors: [{ messageId: "noCrossUI" }],
    },
    {
      description: 'Entity lib importing from widget (Forbidden)',
      code: 'import { ProfileCard } from "@widgets/ProfileCard";',
      filename: "src/entities/user/lib/userHelpers.ts",
      errors: [{ messageId: "noCrossUI" }],
    },
    {
      description: 'Entity selectors importing from widget (Forbidden)',
      code: 'import { Navbar } from "@widgets/Navbar";',
      filename: "src/entities/user/model/selectors.ts",
      errors: [{ messageId: "noCrossUI" }],
    },
    {
      description: 'Windows path with forbidden import',
      code: 'import { Header } from "@widgets/Header";',
      filename: "src\\entities\\user\\model\\user.ts",
      errors: [{ messageId: "noCrossUI" }],
    },
    {
      description: 'With custom business and UI layers',
      code: 'import { Header } from "@ui/Header";',
      filename: "src/logic/user/model/user.ts",
      options: [{
        businessLogicLayers: ['logic'],
        uiLayers: ['ui']
      }],
      errors: [{ messageId: "noCrossUI" }],
    },
    {
      description: 'With folder pattern',
      code: 'import { Header } from "@widgets/Header";',
      filename: "src/5_entities/user/model/user.ts",
      options: [{
        folderPattern: {
          enabled: true,
          regex: "^(\\d+_)?(.*)",
          extractionGroup: 2
        }
      }],
      errors: [{ messageId: "noCrossUI" }],
    }
  ],
});