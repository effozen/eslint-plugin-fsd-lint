/**
 * @fileoverview Tests for no-relative-imports rule.
 *
 * Relative imports are flagged unless `allowSameSlice: true` (default) lets
 * them stay inside the same slice. Test files and `ignoreImportPatterns`
 * are exempt; type-only imports are exempt when `allowTypeImports: true`.
 */
import { testRule, withFilename, withOptions } from "../utils/test-utils.js";
import noRelativeImports from "../../src/rules/no-relative-imports.js";

testRule("no-relative-imports", noRelativeImports, {
  valid: [
    {
      description: "absolute aliased import is fine",
      ...withFilename(
        'import { Button } from "@shared/ui/Button";',
        "/src/features/auth/ui/LoginForm.tsx",
      ),
    },
    {
      description: "same-slice relative import is allowed by default",
      ...withFilename(
        'import { session } from "../model/session";',
        "/src/features/auth/ui/LoginForm.tsx",
      ),
    },
    {
      description: "relative imports inside a shared sub-folder are allowed",
      ...withFilename(
        'import { Button } from "../button";',
        "/src/shared/ui/button/Button.tsx",
      ),
    },
    {
      description: "test files bypass the rule",
      ...withFilename(
        'import { session } from "../../auth/model/session";',
        "/src/features/profile/model/profile.test.ts",
      ),
    },
    {
      description: "ignoreImportPatterns matches CSS modules",
      ...withOptions(
        withFilename(
          'import "./LoginForm.module.css";',
          "/src/features/auth/ui/LoginForm.tsx",
        ),
        { ignoreImportPatterns: ["\\.css$"] },
      ),
    },
    {
      description: "type-only relative import is exempt with allowTypeImports",
      ...withOptions(
        withFilename(
          'import type { Session } from "../../auth/model/session";',
          "/src/features/profile/model/profile.ts",
        ),
        { allowTypeImports: true },
      ),
    },
  ],

  invalid: [
    {
      description: "cross-slice relative import is flagged",
      ...withFilename(
        'import { session } from "../../auth/model/session";',
        "/src/features/profile/model/profile.ts",
      ),
      errors: [{ messageId: "noRelativeImport" }],
    },
    {
      description:
        "same-slice relative import is flagged when allowSameSlice is false",
      ...withOptions(
        withFilename(
          'import { session } from "../model/session";',
          "/src/features/auth/ui/LoginForm.tsx",
        ),
        { allowSameSlice: false },
      ),
      errors: [{ messageId: "noRelativeImport" }],
    },
    {
      description: "dynamic cross-slice relative import is flagged",
      ...withFilename(
        'const m = await import("../../auth/model/session");',
        "/src/features/profile/model/profile.ts",
      ),
      errors: [{ messageId: "noRelativeImport" }],
    },
    {
      description:
        "type-only relative import is flagged when allowTypeImports is false",
      ...withOptions(
        withFilename(
          'import type { Session } from "../../auth/model/session";',
          "/src/features/profile/model/profile.ts",
        ),
        { allowTypeImports: false },
      ),
      errors: [{ messageId: "noRelativeImport" }],
    },
    {
      description: "upward escapes from a slice are flagged",
      ...withFilename(
        'import { Button } from "../../../shared/ui/Button";',
        "/src/features/auth/ui/LoginForm.tsx",
      ),
      errors: [{ messageId: "noRelativeImport" }],
    },
  ],
});
