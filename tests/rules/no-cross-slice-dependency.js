/**
 * @fileoverview Tests for no-cross-slice-dependency rule.
 *
 * The rule prevents one slice from reaching directly into another slice in
 * the same layer. `app` and `shared` have no slices, so they are exempt.
 */
import { testRule, withFilename, withOptions } from "../utils/test-utils.js";
import noCrossSliceDependency from "../../src/rules/no-cross-slice-dependency.js";

testRule("no-cross-slice-dependency", noCrossSliceDependency, {
  valid: [
    {
      description: "feature can import lower-layer entity public API",
      ...withFilename(
        'import { user } from "@entities/user";',
        "/src/features/auth/model/session.ts",
      ),
    },
    {
      description: "same-slice relative import inside features is allowed",
      ...withFilename(
        'import { LoginForm } from "../ui/LoginForm";',
        "/src/features/auth/model/session.ts",
      ),
    },
    {
      description: "same-slice aliased import inside features is allowed",
      ...withFilename(
        'import { authSession } from "@features/auth/model/session";',
        "/src/features/auth/ui/LoginForm.tsx",
      ),
    },
    {
      description: "app-internal imports do not count as cross-slice",
      ...withFilename(
        'import { withRedux } from "./providers/with-redux";',
        "/src/app/index.tsx",
      ),
    },
    {
      description: "shared sub-folder imports do not count as cross-slice",
      ...withFilename(
        'import { Button } from "../button";',
        "/src/shared/ui/button/Button.tsx",
      ),
    },
    {
      description: "test files are exempt from cross-slice checks",
      ...withFilename(
        'import { authSession } from "@features/auth/model/session";',
        "/src/features/profile/model/profile.test.ts",
      ),
    },
  ],

  invalid: [
    {
      description: "feature cannot import another feature directly",
      ...withFilename(
        'import { authSession } from "@features/auth/model/session";',
        "/src/features/profile/ui/ProfilePage.tsx",
      ),
      errors: [{ messageId: "noFeatureDependency" }],
    },
    {
      description: "page cannot import another page slice directly",
      ...withFilename(
        'import { ProfilePage } from "@pages/profile/ui/profile-page";',
        "/src/pages/articles/ui/articles-page.tsx",
      ),
      errors: [{ messageId: "noSliceDependency" }],
    },
    {
      description: "relative cross-slice imports are flagged",
      ...withFilename(
        'import { authSession } from "../../auth/model/session";',
        "/src/features/profile/model/profile.ts",
      ),
      errors: [{ messageId: "noFeatureDependency" }],
    },
    {
      description: "dynamic cross-slice imports are flagged",
      ...withFilename(
        'const m = await import("@features/auth/model/session");',
        "/src/features/profile/model/profile.ts",
      ),
      errors: [{ messageId: "noFeatureDependency" }],
    },
    {
      description: "duplicate same-slice-pair imports report once",
      ...withFilename(
        `import { authSession } from "@features/auth/model/session";
         import { LoginForm } from "@features/auth/ui/LoginForm";`,
        "/src/features/profile/model/profile.ts",
      ),
      errors: [{ messageId: "noFeatureDependency" }],
    },
    {
      description: "slash-alias cross-slice imports are flagged",
      ...withOptions(
        withFilename(
          'import { authSession } from "@/features/auth/model/session";',
          "/src/features/profile/model/profile.ts",
        ),
        { alias: { value: "@", withSlash: true } },
      ),
      errors: [{ messageId: "noFeatureDependency" }],
    },
  ],
});
