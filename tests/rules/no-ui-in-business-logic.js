/**
 * @fileoverview Tests for no-ui-in-business-logic rule.
 *
 * The rule blocks UI imports inside business-logic files. The defaults
 * (`businessLogicLayers: ["model", "api", "lib"]`,
 *  `uiLayers: ["ui", "widgets", "features"]`) treat segment names as
 * layers, so a project that uses canonical FSD layer keys must override
 * `businessLogicLayers` to one of the FSD layer keys (e.g. `entities`).
 */
import { testRule, withFilename, withOptions } from "../utils/test-utils.js";
import noUiInBusinessLogic from "../../src/rules/no-ui-in-business-logic.js";

const fsdLayers = {
  businessLogicLayers: ["entities", "features"],
};

testRule("no-ui-in-business-logic", noUiInBusinessLogic, {
  valid: [
    {
      description: "default config does not flag entities/model imports",
      ...withFilename(
        'import { Button } from "@shared/ui/Button";',
        "/src/entities/user/model/user.ts",
      ),
    },
    {
      description:
        "non-business-logic file is unaffected even with FSD businessLogicLayers",
      ...withOptions(
        withFilename(
          'import { Button } from "@shared/ui/Button";',
          "/src/pages/articles/ui/articles-page.tsx",
        ),
        fsdLayers,
      ),
    },
    {
      description: "test files are exempt",
      ...withOptions(
        withFilename(
          'import { Button } from "@shared/ui/Button";',
          "/src/entities/user/model/user.test.ts",
        ),
        fsdLayers,
      ),
    },
    {
      description: "ignoreImportPatterns skips matching imports",
      ...withOptions(
        withFilename(
          'import "@features/auth/ui/styles.module.css";',
          "/src/entities/user/model/user.ts",
        ),
        { ...fsdLayers, ignoreImportPatterns: ["\\.css$"] },
      ),
    },
    {
      description: "type-only imports are exempt with allowTypeImports",
      ...withOptions(
        withFilename(
          'import type { ButtonProps } from "@shared/ui/Button";',
          "/src/entities/user/model/user.ts",
        ),
        { ...fsdLayers, allowTypeImports: true },
      ),
    },
    {
      description: "external packages are not flagged",
      ...withOptions(
        withFilename(
          'import React from "react";',
          "/src/entities/user/model/user.ts",
        ),
        fsdLayers,
      ),
    },
  ],

  invalid: [
    {
      description: "ui-segment paths in entities files are flagged",
      ...withOptions(
        withFilename(
          'import { Button } from "@shared/ui/Button";',
          "/src/entities/user/model/user.ts",
        ),
        fsdLayers,
      ),
      errors: [{ messageId: "noUiInBusinessLogic" }],
    },
    {
      description: "ui-segment paths in features api files are flagged",
      ...withOptions(
        withFilename(
          'import { LoginForm } from "@features/auth/ui/LoginForm";',
          "/src/features/auth/api/login.ts",
        ),
        fsdLayers,
      ),
      errors: [{ messageId: "noUiInBusinessLogic" }],
    },
    {
      description: "dynamic ui imports in business-logic files are flagged",
      ...withOptions(
        withFilename(
          'const m = await import("@features/auth/ui/LoginForm");',
          "/src/entities/user/model/user.ts",
        ),
        fsdLayers,
      ),
      errors: [{ messageId: "noUiInBusinessLogic" }],
    },
    {
      description: "type-only imports are flagged without allowTypeImports",
      ...withOptions(
        withFilename(
          'import type { ButtonProps } from "@shared/ui/Button";',
          "/src/entities/user/model/user.ts",
        ),
        { ...fsdLayers, allowTypeImports: false },
      ),
      errors: [{ messageId: "noUiInBusinessLogic" }],
    },
    {
      description: "custom uiLayers list is honoured",
      ...withOptions(
        withFilename(
          'import { Sidebar } from "@app/blocks/sidebar";',
          "/src/entities/user/model/user.ts",
        ),
        { ...fsdLayers, uiLayers: ["blocks"] },
      ),
      errors: [{ messageId: "noUiInBusinessLogic" }],
    },
  ],
});
