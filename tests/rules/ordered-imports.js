/**
 * @fileoverview Tests for ordered-imports rule.
 *
 * The rule expects FSD imports to be grouped by layer in the canonical order
 * (app → processes → pages → widgets → features → entities → shared) with
 * blank lines between groups. It reports `incorrectGrouping` once for the
 * first out-of-order import and provides an autofix that rewrites the whole
 * import block.
 */
import { testRule, withOptions } from "../utils/test-utils.js";
import orderedImports from "../../src/rules/ordered-imports.js";

testRule("ordered-imports", orderedImports, {
  valid: [
    {
      description: "single import block needs no ordering",
      code: 'import { Button } from "@shared/ui/Button";',
    },
    {
      description: "canonical top-to-bottom layer order is accepted",
      code: `import { Header } from "@widgets/header";

import { auth } from "@features/auth";

import { user } from "@entities/user";

import { Button } from "@shared/ui/Button";`,
    },
    {
      description: "external packages and FSD imports are kept in order",
      code: `import React from "react";

import { Header } from "@widgets/header";

import { Button } from "@shared/ui/Button";`,
    },
    {
      description:
        "single-layer imports without blank lines do not trigger the rule",
      code: `import { Button } from "@shared/ui/Button";
import { Input } from "@shared/ui/Input";`,
    },
  ],

  invalid: [
    {
      description: "shared listed before features is reported",
      code: `import { Button } from "@shared/ui/Button";

import { auth } from "@features/auth";`,
      output:
        'import { auth } from "@features/auth";import { Button } from "@shared/ui/Button";',
      errors: [{ messageId: "incorrectGrouping" }],
    },
    {
      description: "entities listed before widgets is reported",
      code: `import { user } from "@entities/user";

import { Header } from "@widgets/header";`,
      output:
        'import { Header } from "@widgets/header";import { user } from "@entities/user";',
      errors: [{ messageId: "incorrectGrouping" }],
    },
    {
      description: "customOrder lets entities precede widgets",
      ...withOptions(
        `import { Header } from "@widgets/header";

import { user } from "@entities/user";`,
        {
          customOrder: [
            "app",
            "processes",
            "pages",
            "entities",
            "widgets",
            "features",
            "shared",
          ],
        },
      ),
      output:
        'import { user } from "@entities/user";import { Header } from "@widgets/header";',
      errors: [{ messageId: "incorrectGrouping" }],
    },
  ],
});
