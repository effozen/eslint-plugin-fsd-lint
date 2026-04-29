/**
 * @fileoverview Tests for no-global-store-imports rule.
 *
 * The rule blocks paths that contain known global-store substrings
 * (`/store/`, `/redux/`, `/zustand/`, `/mobx/`, `/recoil/`, plus the
 * `/app/store` and `/shared/store` slice-rooted paths). Test files are
 * exempt by default, and `allowedPaths` / `forbiddenPaths` override the
 * defaults.
 */
import { testRule, withFilename, withOptions } from "../utils/test-utils.js";
import noGlobalStoreImports from "../../src/rules/no-global-store-imports.js";

testRule("no-global-store-imports", noGlobalStoreImports, {
  valid: [
    {
      description: "imports from hooks namespace stay allowed",
      code: 'import { useAppSelector } from "@shared/hooks";',
    },
    {
      description: "entity public API import stays allowed",
      code: 'import { userActions } from "@entities/user";',
    },
    {
      description: "unrelated component import stays allowed",
      code: 'import { Button } from "@shared/ui/Button";',
    },
    {
      description: "test files can import the global store directly",
      ...withFilename(
        'import { store } from "@/app/store/global";',
        "/src/features/auth/ui/LoginForm.test.tsx",
      ),
    },
    {
      description: "allowedPaths overrides matching forbidden imports",
      ...withOptions('import { selectors } from "@/app/store/selectors";', {
        allowedPaths: ["selectors"],
      }),
    },
    {
      description: "custom forbiddenPaths can replace defaults",
      ...withOptions('import { store } from "@/app/store/global";', {
        forbiddenPaths: ["/state/"],
      }),
    },
  ],

  invalid: [
    {
      description: "@app/store-rooted nested path is blocked",
      code: 'import { store } from "@/app/store/index";',
      errors: [{ messageId: "noGlobalStore" }],
    },
    {
      description: "@shared/store-rooted nested path is blocked",
      code: 'import { store } from "@/shared/store/global";',
      errors: [{ messageId: "noGlobalStore" }],
    },
    {
      description: "redux substring path is blocked",
      code: 'import { store } from "@/redux/store/users";',
      errors: [{ messageId: "noGlobalStore" }],
    },
    {
      description: "zustand substring path is blocked",
      code: 'import { state } from "@/zustand/global";',
      errors: [{ messageId: "noGlobalStore" }],
    },
    {
      description: "mobx substring path is blocked",
      code: 'import { state } from "@/mobx/state";',
      errors: [{ messageId: "noGlobalStore" }],
    },
    {
      description: "recoil substring path is blocked",
      code: 'import { atoms } from "@/recoil/atoms";',
      errors: [{ messageId: "noGlobalStore" }],
    },
    {
      description: "custom forbiddenPaths catches the configured pattern",
      ...withOptions('import { state } from "@/state/global";', {
        forbiddenPaths: ["/state/"],
      }),
      errors: [{ messageId: "noGlobalStore" }],
    },
    {
      description: "multiple forbidden imports each report individually",
      code: `import { store } from "@/app/store/index";
             import { state } from "@/zustand/global";`,
      errors: [{ messageId: "noGlobalStore" }, { messageId: "noGlobalStore" }],
    },
  ],
});
