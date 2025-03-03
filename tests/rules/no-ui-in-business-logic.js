/**
 * @fileoverview Tests for no-ui-in-business-logic rule
 */
import { testRule, withFilename } from '../utils/test-utils';
import noUiInBusinessLogic from '../../src/rules/no-ui-in-business-logic';

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
      description: 'Entity UI component importing from widget (OK)',
      ...withFilename('import { Header } from "@widgets/Header";', "src/entities/user/ui/UserProfile.tsx")
    },
    {
      description: 'Type import unrelated to business logic (OK)',
      ...withFilename('import type { HeaderProps } from "@widgets/Header";', "src/entities/user/model/user.ts")
    },
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
      description: 'Entity slice importing from widget (Forbidden)',
      code: 'import { ThemeSwitcher } from "@widgets/ThemeSwitcher";',
      filename: "src/entities/article/model/slice.ts",
      errors: [{ messageId: "noCrossUI" }],
    },
    {
      description: 'Multiple forbidden widget imports (Forbidden)',
      code: `
        import { Header } from "@widgets/Header";
        import { Sidebar } from "@widgets/Sidebar";
      `,
      filename: "src/entities/user/model/user.ts",
      errors: [
        { messageId: "noCrossUI" },
        { messageId: "noCrossUI" }
      ],
    },
  ],
});