/**
 * @fileoverview Tests for no-public-api-sidestep rule.
 *
 * The rule restricts deep imports past a slice's public API for the layers
 * listed in `publicApi.enforceForLayers` (default: features, entities,
 * widgets). Slice-level (`@features/auth`) and segment-level
 * (`@features/auth/model`) imports are allowed by default;
 * `allowSegmentImports: false` tightens this to slice-level only.
 * `enforceShared` extends the check to the shared layer.
 */
import { testRule, withFilename, withOptions } from "../utils/test-utils.js";
import noPublicApiSidestep from "../../src/rules/no-public-api-sidestep.js";

testRule("no-public-api-sidestep", noPublicApiSidestep, {
  valid: [
    {
      description: "slice-level public API import is allowed",
      code: 'import { auth } from "@features/auth";',
    },
    {
      description: "segment-level public API import is allowed by default",
      code: 'import { authModel } from "@features/auth/model";',
    },
    {
      description: "shared imports are unrestricted by default",
      code: 'import { Button } from "@shared/ui/Button";',
    },
    {
      description: "test files bypass public API enforcement",
      ...withFilename(
        'import { authSession } from "@features/auth/model/session";',
        "/src/pages/articles/ui/articles-page.test.tsx",
      ),
    },
    {
      description: "same-slice aliased internal imports stay allowed",
      ...withFilename(
        'import { authSession } from "@features/auth/model/session";',
        "/src/features/auth/ui/LoginForm.tsx",
      ),
    },
    {
      description: "external packages are not classified as sidesteps",
      code: 'import React from "react";',
    },
  ],

  invalid: [
    {
      description: "deep file import in features is flagged",
      code: 'import { authSession } from "@features/auth/model/session";',
      errors: [{ messageId: "noDirectImport" }],
    },
    {
      description: "deep file import in entities is flagged",
      code: 'import { fetchUser } from "@entities/user/api/userApi";',
      errors: [{ messageId: "noDirectImport" }],
    },
    {
      description:
        "segment-level imports are flagged when allowSegmentImports is false",
      ...withOptions('import { authModel } from "@features/auth/model";', {
        publicApi: { allowSegmentImports: false },
      }),
      errors: [{ messageId: "noDirectImport" }],
    },
    {
      description: "shared deep imports are flagged when enforceShared is true",
      ...withOptions('import { Button } from "@shared/ui/Button";', {
        publicApi: { enforceShared: true },
      }),
      errors: [{ messageId: "noDirectImport" }],
    },
    {
      description: "dynamic deep imports are flagged",
      code: 'const m = await import("@features/auth/model/session");',
      errors: [{ messageId: "noDirectImport" }],
    },
    {
      description: "extra layers can be added to enforceForLayers",
      ...withOptions(
        'import { ArticlesLayout } from "@pages/articles/ui/articles-page";',
        { publicApi: { enforceForLayers: ["pages"] } },
      ),
      errors: [{ messageId: "noDirectImport" }],
    },
  ],
});
