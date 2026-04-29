/**
 * @fileoverview Tests for forbidden-imports rule.
 *
 * The rule enforces FSD layer direction: a layer can only import from layers
 * with a higher priority (further down the stack). Same-layer imports are
 * allowed through `allowedToImport` settings; same-slice imports are short
 * circuited even when the consumer layer cannot import itself.
 */
import { testRule, withFilename, withOptions } from "../utils/test-utils.js";
import forbiddenImports from "../../src/rules/forbidden-imports.js";

testRule("forbidden-imports", forbiddenImports, {
  valid: [
    {
      description: "shared-layer file does not classify external packages",
      ...withFilename(
        'import React from "react";',
        "/src/shared/ui/Button.tsx",
      ),
    },
    {
      description: "feature can import lower entities layer",
      ...withFilename(
        'import { user } from "@entities/user";',
        "/src/features/auth/model/session.ts",
      ),
    },
    {
      description: "feature can import lower shared layer",
      ...withFilename(
        'import { Button } from "@shared/ui/Button";',
        "/src/features/auth/ui/LoginForm.tsx",
      ),
    },
    {
      description: "page can import widgets and features",
      ...withFilename(
        `import { Header } from "@widgets/header";
         import { auth } from "@features/auth";`,
        "/src/pages/articles/ui/articles-page.tsx",
      ),
    },
    {
      description: "test files bypass layer direction checks",
      ...withFilename(
        'import { auth } from "@features/auth";',
        "/src/entities/user/model/user.test.ts",
      ),
    },
    {
      description: "ignoreImportPatterns skips matching imports",
      ...withOptions(
        withFilename(
          'import "./LoginForm.module.css";',
          "/src/features/auth/ui/LoginForm.tsx",
        ),
        { ignoreImportPatterns: ["\\.css$"] },
      ),
    },
    {
      description: "same-slice aliased imports are allowed for pages",
      ...withOptions(
        withFilename(
          'import { ArticlesLayout } from "@/pages/articles/ui/articles-page";',
          "/apps/web/src/pages/articles/ui/articles-pending-page.tsx",
        ),
        {
          rootPath: "/apps/web/src/",
          alias: { value: "@", withSlash: true },
        },
      ),
    },
  ],

  invalid: [
    {
      description: "entities cannot import features",
      ...withFilename(
        'import { auth } from "@features/auth";',
        "/src/entities/user/model/user.ts",
      ),
      errors: [{ messageId: "invalidImport" }],
    },
    {
      description: "features cannot import widgets",
      ...withFilename(
        'import { Header } from "@widgets/header";',
        "/src/features/auth/model/session.ts",
      ),
      errors: [{ messageId: "invalidImport" }],
    },
    {
      description: "shared cannot import entities",
      ...withFilename(
        'import { user } from "@entities/user";',
        "/src/shared/lib/date.ts",
      ),
      errors: [{ messageId: "invalidImport" }],
    },
    {
      description: "type-only upward imports are still flagged",
      ...withFilename(
        'import type { AuthSession } from "@features/auth";',
        "/src/entities/user/model/user.ts",
      ),
      errors: [{ messageId: "invalidImport" }],
    },
    {
      description:
        "cross-slice same-layer imports are flagged with slash alias",
      ...withOptions(
        withFilename(
          'import { ProfilePage } from "@/pages/profile/ui/profile-page";',
          "/apps/web/src/pages/articles/ui/articles-pending-page.ts",
        ),
        {
          rootPath: "/apps/web/src/",
          alias: { value: "@", withSlash: true },
        },
      ),
      errors: [{ messageId: "invalidImport" }],
    },
  ],
});
