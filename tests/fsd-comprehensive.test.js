import { ESLint } from "eslint";
import tsParser from "@typescript-eslint/parser";
import { describe, expect, it } from "vitest";

import fsdPlugin from "../src/index.js";

const fixtureRoot = {
  rootPath: "/tests/fixtures/resolve-project/src/",
};

const slashAlias = {
  alias: {
    value: "@",
    withSlash: true,
  },
};

function createEslint(rules) {
  return new ESLint({
    overrideConfigFile: true,
    ignore: false,
    overrideConfig: [
      {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
          parser: tsParser,
          ecmaVersion: 2022,
          sourceType: "module",
        },
        plugins: {
          fsd: fsdPlugin,
        },
        rules,
      },
    ],
  });
}

async function lintText(code, filePath, rules) {
  const eslint = createEslint(rules);
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages;
}

function ruleIds(messages) {
  return messages.map((message) => message.ruleId);
}

function messageIds(messages) {
  return messages.map((message) => message.messageId);
}

describe("FSD 2.x — full layer-pair matrix for forbidden-imports", () => {
  const layerCases = [
    // Allowed downward-only direction.
    ["app imports processes", "app/App.tsx", "@processes/onboarding", []],
    ["app imports pages", "app/App.tsx", "@pages/articles", []],
    ["app imports widgets", "app/App.tsx", "@widgets/header", []],
    ["app imports features", "app/App.tsx", "@features/auth", []],
    ["app imports entities", "app/App.tsx", "@entities/user", []],
    ["app imports shared", "app/App.tsx", "@shared/lib/date", []],
    [
      "processes imports pages",
      "processes/onboarding/model/step.ts",
      "@pages/articles",
      [],
    ],
    [
      "processes imports features",
      "processes/onboarding/model/step.ts",
      "@features/auth",
      [],
    ],
    [
      "processes imports entities",
      "processes/onboarding/model/step.ts",
      "@entities/user",
      [],
    ],
    [
      "pages imports widgets",
      "pages/articles/ui/articles-page.tsx",
      "@widgets/header",
      [],
    ],
    [
      "pages imports features",
      "pages/articles/ui/articles-page.tsx",
      "@features/auth",
      [],
    ],
    [
      "pages imports entities",
      "pages/articles/ui/articles-page.tsx",
      "@entities/user",
      [],
    ],
    [
      "pages imports shared",
      "pages/articles/ui/articles-page.tsx",
      "@shared/lib/date",
      [],
    ],
    [
      "widgets imports features",
      "widgets/header/ui/Header.tsx",
      "@features/auth",
      [],
    ],
    [
      "widgets imports entities",
      "widgets/header/ui/Header.tsx",
      "@entities/user",
      [],
    ],
    [
      "widgets imports shared",
      "widgets/header/ui/Header.tsx",
      "@shared/lib/date",
      [],
    ],
    [
      "features imports entities",
      "features/auth/model/session.ts",
      "@entities/user",
      [],
    ],
    [
      "features imports shared",
      "features/auth/model/session.ts",
      "@shared/lib/date",
      [],
    ],
    [
      "entities imports shared",
      "entities/user/model/session.ts",
      "@shared/lib/date",
      [],
    ],

    // Disallowed upward direction.
    [
      "processes cannot import app",
      "processes/onboarding/model/step.ts",
      "@app/providers",
      ["fsd/forbidden-imports"],
    ],
    [
      "pages cannot import processes",
      "pages/articles/ui/articles-page.tsx",
      "@processes/onboarding",
      ["fsd/forbidden-imports"],
    ],
    [
      "widgets cannot import pages",
      "widgets/header/ui/Header.tsx",
      "@pages/articles",
      ["fsd/forbidden-imports"],
    ],
    [
      "features cannot import widgets",
      "features/auth/model/session.ts",
      "@widgets/header",
      ["fsd/forbidden-imports"],
    ],
    [
      "entities cannot import features",
      "entities/user/model/session.ts",
      "@features/auth",
      ["fsd/forbidden-imports"],
    ],
    [
      "shared cannot import entities",
      "shared/lib/date.ts",
      "@entities/user",
      ["fsd/forbidden-imports"],
    ],
    [
      "shared cannot import features",
      "shared/lib/date.ts",
      "@features/auth",
      ["fsd/forbidden-imports"],
    ],
  ];

  it.each(layerCases)("%s", async (_name, filePath, importPath, expected) => {
    const messages = await lintText(
      `import { thing } from "${importPath}";`,
      `tests/fixtures/resolve-project/src/${filePath}`,
      {
        "fsd/forbidden-imports": ["error", fixtureRoot],
      },
    );

    expect(ruleIds(messages)).toEqual(expected);
  });
});

describe("FSD 2.x — segment access within the same slice", () => {
  it.each([
    ["ui imports model", "features/auth/ui/LoginForm.tsx", "../model/session"],
    ["ui imports api", "features/auth/ui/LoginForm.tsx", "../api/login"],
    ["ui imports lib", "features/auth/ui/LoginForm.tsx", "../lib/utils"],
    ["model imports lib", "features/auth/model/session.ts", "../lib/utils"],
    ["model imports api", "features/auth/model/session.ts", "../api/login"],
    ["api imports lib", "features/auth/api/login.ts", "../lib/utils"],
    ["lib imports model", "features/auth/lib/utils.ts", "../model/session"],
  ])("allows %s with relative paths", async (_name, filePath, importPath) => {
    const messages = await lintText(
      `import { thing } from "${importPath}";`,
      `tests/fixtures/resolve-project/src/${filePath}`,
      {
        "fsd/forbidden-imports": ["error", fixtureRoot],
        "fsd/no-cross-slice-dependency": ["error", fixtureRoot],
      },
    );

    expect(messages).toEqual([]);
  });

  it("allows same-slice segment access through tsconfig path aliases", async () => {
    const messages = await lintText(
      `
        import { authSession } from "@auth/model/session";
        import { LoginForm } from "@auth/ui/LoginForm";
        import { login } from "@auth/api/login";
        import { isLoggedIn } from "@auth/lib/utils";
      `,
      "tests/fixtures/resolve-project/src/features/auth/model/session.ts",
      {
        "fsd/forbidden-imports": ["error", fixtureRoot],
        "fsd/no-cross-slice-dependency": ["error", fixtureRoot],
      },
    );

    expect(messages).toEqual([]);
  });
});

describe("FSD 2.x — public API enforcement variations", () => {
  it("allows root slice public API for restricted layers", async () => {
    const messages = await lintText(
      `
        import { authPublicApi } from "@features/auth";
        import { userPublicApi } from "@entities/user";
        import { Header } from "@widgets/header";
      `,
      "src/pages/articles/ui/articles-page.tsx",
      {
        "fsd/no-public-api-sidestep": "error",
      },
    );

    expect(messages).toEqual([]);
  });

  it("flags direct file imports past the segment level", async () => {
    const messages = await lintText(
      `
        import { sessionInternal } from "@features/auth/model/session";
        import { fetchUser } from "@entities/user/api/userApi";
      `,
      "src/pages/articles/ui/articles-page.tsx",
      {
        "fsd/no-public-api-sidestep": "error",
      },
    );

    expect(messageIds(messages)).toEqual(["noDirectImport", "noDirectImport"]);
  });

  it("flags direct nested file imports when allowSegmentImports is false", async () => {
    const messages = await lintText(
      `
        import { sessionInternal } from "@features/auth/model/session";
        import { fetchUser } from "@entities/user/api/userApi";
      `,
      "src/pages/articles/ui/articles-page.tsx",
      {
        "fsd/no-public-api-sidestep": [
          "error",
          {
            publicApi: {
              allowSegmentImports: false,
            },
          },
        ],
      },
    );

    expect(messageIds(messages)).toEqual(["noDirectImport", "noDirectImport"]);
  });

  it("treats segment-level index imports as public API by default", async () => {
    const messages = await lintText(
      `
        import { authModel } from "@features/auth/model";
        import { authUi } from "@features/auth/ui";
        import { userApi } from "@entities/user/api";
      `,
      "src/pages/articles/ui/articles-page.tsx",
      {
        "fsd/no-public-api-sidestep": "error",
      },
    );

    expect(messages).toEqual([]);
  });

  it("does not enforce shared public API by default", async () => {
    const messages = await lintText(
      `
        import { Button } from "@shared/ui/Button";
        import { formatDate } from "@shared/lib/date";
        import { httpClient } from "@shared/api/http";
      `,
      "src/pages/articles/ui/articles-page.tsx",
      {
        "fsd/no-public-api-sidestep": "error",
      },
    );

    expect(messages).toEqual([]);
  });

  it("enforces shared segment-level imports when enforceShared is true", async () => {
    const messages = await lintText(
      `
        import { Button } from "@shared/ui/Button";
        import { formatDate } from "@shared/lib/date";
        import { sharedConfig } from "@shared/config";
        import { sharedUi } from "@shared/ui";
      `,
      "src/pages/articles/ui/articles-page.tsx",
      {
        "fsd/no-public-api-sidestep": [
          "error",
          {
            publicApi: {
              enforceShared: true,
            },
          },
        ],
      },
    );

    expect(messageIds(messages)).toEqual(["noDirectImport", "noDirectImport"]);
  });

  it("requires root-level shared imports when both enforceShared and !allowSegmentImports", async () => {
    const messages = await lintText(
      `
        import { sharedRoot } from "@shared";
        import { sharedRootIndex } from "@shared/index";
        import { sharedUi } from "@shared/ui";
        import { Button } from "@shared/ui/Button";
      `,
      "src/pages/articles/ui/articles-page.tsx",
      {
        "fsd/no-public-api-sidestep": [
          "error",
          {
            publicApi: {
              enforceShared: true,
              allowSegmentImports: false,
            },
          },
        ],
      },
    );

    expect(messageIds(messages)).toEqual(["noDirectImport", "noDirectImport"]);
  });

  it("can extend enforcement to additional layers like pages", async () => {
    const messages = await lintText(
      `
        import { ArticlesLayout } from "@pages/articles/ui/articles-page";
        import { articleSections } from "@pages/articles/api/queries";
      `,
      "src/app/App.tsx",
      {
        "fsd/no-public-api-sidestep": [
          "error",
          {
            publicApi: {
              enforceForLayers: ["pages"],
              allowSegmentImports: false,
            },
          },
        ],
      },
    );

    expect(messageIds(messages)).toEqual(["noDirectImport", "noDirectImport"]);
  });

  it("treats every recognized index file extension as the public API", async () => {
    const messages = await lintText(
      `
        import a from "@features/auth/index.ts";
        import b from "@features/auth/index.tsx";
        import c from "@features/auth/index.js";
        import d from "@features/auth/index.jsx";
      `,
      "src/pages/articles/ui/articles-page.tsx",
      {
        "fsd/no-public-api-sidestep": "error",
      },
    );

    expect(messages).toEqual([]);
  });
});

describe("FSD 2.x — app and shared exemptions", () => {
  it("does not block app-internal segment crossings", async () => {
    const messages = await lintText(
      `
        import { initProviders } from "./providers/init";
        import { appStore } from "./store";
      `,
      "tests/fixtures/resolve-project/src/app/App.tsx",
      {
        "fsd/no-cross-slice-dependency": ["error", fixtureRoot],
        "fsd/forbidden-imports": ["error", fixtureRoot],
      },
    );

    expect(messages).toEqual([]);
  });

  it("does not treat shared sub-folders as cross-slice imports", async () => {
    const messages = await lintText(
      `
        import { Button } from "../button";
        import { formatDate } from "../../lib/date";
        import { httpClient } from "../../api/http";
      `,
      "tests/fixtures/resolve-project/src/shared/ui/button/Button.tsx",
      {
        "fsd/no-cross-slice-dependency": ["error", fixtureRoot],
        "fsd/forbidden-imports": ["error", fixtureRoot],
      },
    );

    expect(messages).toEqual([]);
  });
});

describe("FSD 2.x — import expression variations", () => {
  it("type-only imports are checked the same as value imports", async () => {
    const messages = await lintText(
      'import type { AuthSession } from "@features/auth/model/session";',
      "src/features/profile/ui/ProfilePage.tsx",
      {
        "fsd/no-cross-slice-dependency": "error",
        "fsd/no-public-api-sidestep": "error",
      },
    );

    expect(ruleIds(messages).sort()).toEqual([
      "fsd/no-cross-slice-dependency",
      "fsd/no-public-api-sidestep",
    ]);
  });

  it("does not currently inspect ExportNamedDeclaration with source", async () => {
    // Note: this documents existing behavior — re-exports bypass FSD checks.
    const messages = await lintText(
      'export { authSession } from "@features/auth/model/session";',
      "src/features/profile/model/session.ts",
      {
        "fsd/no-cross-slice-dependency": "error",
        "fsd/no-public-api-sidestep": "error",
        "fsd/forbidden-imports": "error",
      },
    );

    expect(messages).toEqual([]);
  });

  it("side-effect-only imports still go through layer checks", async () => {
    const messages = await lintText(
      'import "@processes/onboarding";',
      "src/pages/articles/ui/articles-page.tsx",
      {
        "fsd/forbidden-imports": "error",
      },
    );

    expect(ruleIds(messages)).toEqual(["fsd/forbidden-imports"]);
  });

  it("dynamic imports are checked across all rules", async () => {
    const messages = await lintText(
      'const m = await import("@features/auth/model/session");',
      "src/features/profile/model/session.ts",
      {
        "fsd/no-cross-slice-dependency": "error",
        "fsd/no-public-api-sidestep": "error",
      },
    );

    expect(ruleIds(messages).sort()).toEqual([
      "fsd/no-cross-slice-dependency",
      "fsd/no-public-api-sidestep",
    ]);
  });

  it("ignores dynamic imports with a non-literal specifier", async () => {
    const messages = await lintText(
      "const m = await import(somePath);",
      "src/features/profile/model/session.ts",
      {
        "fsd/no-cross-slice-dependency": "error",
        "fsd/no-public-api-sidestep": "error",
      },
    );

    expect(messages).toEqual([]);
  });

  it("ignores third-party packages and node built-ins", async () => {
    const messages = await lintText(
      `
        import React from "react";
        import path from "path";
        import { useDispatch } from "react-redux";
        import scoped from "@types/react";
      `,
      "src/features/auth/model/session.ts",
      {
        "fsd/forbidden-imports": "error",
        "fsd/no-cross-slice-dependency": "error",
        "fsd/no-public-api-sidestep": "error",
      },
    );

    expect(messages).toEqual([]);
  });
});

describe("FSD 2.x — alias variations", () => {
  it.each([
    ["default no-slash alias", undefined, "@features/auth/model/x"],
    [
      "object alias with slash",
      { ...slashAlias, rootPath: "/src/" },
      "@/features/auth/model/x",
    ],
    [
      "string alias ending with slash",
      { alias: "@/", rootPath: "/src/" },
      "@/features/auth/model/x",
    ],
    [
      "tilde alias",
      { alias: { value: "~", withSlash: true }, rootPath: "/src/" },
      "~/features/auth/model/x",
    ],
  ])("still flags cross-slice with %s", async (_name, options, importPath) => {
    const messages = await lintText(
      `import { x } from "${importPath}";`,
      "src/features/profile/model/profile.ts",
      {
        "fsd/no-cross-slice-dependency": ["error", options || {}],
      },
    );

    expect(messageIds(messages)).toEqual(["noFeatureDependency"]);
  });

  it.each([
    ["default no-slash alias", undefined, "@features/profile/model/x"],
    [
      "object alias with slash",
      { ...slashAlias, rootPath: "/src/" },
      "@/features/profile/model/x",
    ],
    [
      "tilde alias",
      { alias: { value: "~", withSlash: true }, rootPath: "/src/" },
      "~/features/profile/model/x",
    ],
  ])(
    "permits same-slice imports with %s",
    async (_name, options, importPath) => {
      const messages = await lintText(
        `import { x } from "${importPath}";`,
        "src/features/profile/ui/ProfileView.tsx",
        {
          "fsd/no-cross-slice-dependency": ["error", options || {}],
          "fsd/forbidden-imports": ["error", options || {}],
        },
      );

      expect(messages).toEqual([]);
    },
  );
});

describe("FSD 2.x — folder pattern with numeric prefixes", () => {
  const folderConfig = {
    rootPath: "/src/",
    folderPattern: {
      enabled: true,
      regex: "^(\\d+_)?(.*)$",
      extractionGroup: 2,
    },
  };

  it("recognizes the file's layer when the folder is numeric-prefixed", async () => {
    const messages = await lintText(
      'import { authPublicApi } from "@features/auth";',
      "src/06_entities/user/model/user.ts",
      {
        "fsd/forbidden-imports": ["error", folderConfig],
      },
    );

    expect(ruleIds(messages)).toEqual(["fsd/forbidden-imports"]);
  });

  it("permits same-layer numeric-prefixed file imports through aliases", async () => {
    const messages = await lintText(
      'import { Button } from "@shared/ui/Button";',
      "src/05_features/auth/model/session.ts",
      {
        "fsd/forbidden-imports": ["error", folderConfig],
      },
    );

    expect(messages).toEqual([]);
  });
});

describe("FSD 2.x — test file exemption", () => {
  it.each([
    ["unit test", "src/features/auth/model/session.test.ts"],
    ["spec test", "src/features/auth/ui/LoginForm.spec.tsx"],
    ["storybook story", "src/features/auth/ui/LoginForm.stories.tsx"],
    ["StoreDecorator helper", "src/shared/StoreDecorator.tsx"],
  ])("forbidden-imports skips %s", async (_name, filePath) => {
    const messages = await lintText(
      'import { LoginPage } from "@pages/login";',
      filePath,
      {
        "fsd/forbidden-imports": "error",
      },
    );

    expect(messages).toEqual([]);
  });

  it("no-cross-slice-dependency skips test files", async () => {
    const messages = await lintText(
      'import { authSession } from "@features/auth/model/session";',
      "src/features/profile/model/profile.test.ts",
      {
        "fsd/no-cross-slice-dependency": "error",
      },
    );

    expect(messages).toEqual([]);
  });

  it("no-public-api-sidestep skips test files", async () => {
    const messages = await lintText(
      'import { sessionInternal } from "@features/auth/model/session";',
      "src/pages/articles/ui/articles-page.test.tsx",
      {
        "fsd/no-public-api-sidestep": [
          "error",
          { publicApi: { allowSegmentImports: false } },
        ],
      },
    );

    expect(messages).toEqual([]);
  });
});

describe("FSD 2.x — ignoreImportPatterns", () => {
  it("ignores stylesheets and image assets when configured", async () => {
    const messages = await lintText(
      `
        import "./LoginForm.module.css";
        import logo from "./logo.svg";
        import "../../shared/styles/global.scss";
      `,
      "src/features/auth/ui/LoginForm.tsx",
      {
        "fsd/forbidden-imports": [
          "error",
          {
            ignoreImportPatterns: ["\\.css$", "\\.scss$", "\\.svg$"],
          },
        ],
      },
    );

    expect(messages).toEqual([]);
  });
});

describe("FSD 2.x — ordered-imports", () => {
  it("flags an inverted order between layers", async () => {
    const messages = await lintText(
      `
        import { user } from "@entities/user";
        import { Header } from "@widgets/header";
        import { Button } from "@shared/ui/Button";
      `,
      "src/pages/articles/ui/articles-page.tsx",
      {
        "fsd/ordered-imports": "error",
      },
    );

    expect(ruleIds(messages)).toEqual(["fsd/ordered-imports"]);
  });

  it("accepts the canonical top-to-bottom order", async () => {
    const messages = await lintText(
      `
        import { Header } from "@widgets/header";
        import { authPublicApi } from "@features/auth";
        import { userPublicApi } from "@entities/user";
        import { Button } from "@shared/ui/Button";
      `,
      "src/pages/articles/ui/articles-page.tsx",
      {
        "fsd/ordered-imports": "error",
      },
    );

    expect(messages).toEqual([]);
  });

  it("uses fs-resolved layer info from tsconfig path aliases", async () => {
    const messages = await lintText(
      `
        import { userPublicApi } from "@user";
        import { Header } from "@/widgets/header";
        import { authPublicApi } from "@auth";
      `,
      "tests/fixtures/resolve-project/src/pages/articles/ui/articles-page.tsx",
      {
        "fsd/ordered-imports": [
          "error",
          {
            ...fixtureRoot,
            ...slashAlias,
          },
        ],
      },
    );

    expect(ruleIds(messages)).toEqual(["fsd/ordered-imports"]);
  });
});

describe("FSD 2.x — no-relative-imports", () => {
  it("rejects cross-slice relative imports by default", async () => {
    const messages = await lintText(
      'import { authSession } from "../../auth/model/session";',
      "src/features/profile/ui/ProfilePage.tsx",
      {
        "fsd/no-relative-imports": "error",
      },
    );

    expect(ruleIds(messages)).toEqual(["fsd/no-relative-imports"]);
  });

  it("permits same-slice relative imports when allowSameSlice is true", async () => {
    const messages = await lintText(
      `
        import { session } from "../model/session";
        import { utils } from "../lib/utils";
      `,
      "src/features/auth/ui/LoginForm.tsx",
      {
        "fsd/no-relative-imports": ["error", { allowSameSlice: true }],
      },
    );

    expect(messages).toEqual([]);
  });

  it("flags upward path traversal that escapes the slice", async () => {
    const messages = await lintText(
      'import { Button } from "../../../shared/ui/Button";',
      "src/features/auth/ui/LoginForm.tsx",
      {
        "fsd/no-relative-imports": ["error", { allowSameSlice: true }],
      },
    );

    expect(ruleIds(messages)).toEqual(["fsd/no-relative-imports"]);
  });
});

describe("FSD 2.x — no-ui-in-business-logic", () => {
  it("does not flag imports when the file's layer is outside default business-logic layers", async () => {
    const messages = await lintText(
      'import { Button } from "@shared/ui/Button";',
      "src/entities/user/model/user.ts",
      {
        "fsd/no-ui-in-business-logic": "error",
      },
    );

    expect(messages).toEqual([]);
  });

  it("ignores test files regardless of business-logic configuration", async () => {
    const messages = await lintText(
      'import { Button } from "@shared/ui/Button";',
      "src/entities/user/model/user.test.ts",
      {
        "fsd/no-ui-in-business-logic": "error",
      },
    );

    expect(messages).toEqual([]);
  });

  it("respects ignoreImportPatterns for assets", async () => {
    const messages = await lintText(
      'import "@features/auth/ui/styles.module.css";',
      "src/entities/user/model/user.ts",
      {
        "fsd/no-ui-in-business-logic": [
          "error",
          { ignoreImportPatterns: ["\\.css$"] },
        ],
      },
    );

    expect(messages).toEqual([]);
  });

  it("does not flag external packages", async () => {
    const messages = await lintText(
      'import React from "react";',
      "src/entities/user/model/user.ts",
      {
        "fsd/no-ui-in-business-logic": "error",
      },
    );

    expect(messages).toEqual([]);
  });
});

describe("FSD 2.x — no-global-store-imports", () => {
  it.each([
    ["app store nested path", "@/app/store/index"],
    ["shared store nested path", "@/shared/store/global"],
    ["generic store substring", "@/redux/store/users"],
    ["zustand path", "@/zustand/global"],
    ["mobx path", "@/mobx/state"],
    ["recoil path", "@/recoil/atoms"],
  ])("blocks %s imports outside test files", async (_name, importPath) => {
    const messages = await lintText(
      `import { state } from "${importPath}";`,
      "src/features/auth/model/session.ts",
      {
        "fsd/no-global-store-imports": "error",
      },
    );

    expect(ruleIds(messages)).toEqual(["fsd/no-global-store-imports"]);
  });

  it("respects custom allowedPaths overrides", async () => {
    const messages = await lintText(
      'import { useUserSelector } from "@/app/store/selectors/user";',
      "src/features/auth/ui/LoginForm.tsx",
      {
        "fsd/no-global-store-imports": [
          "error",
          { allowedPaths: ["selectors"] },
        ],
      },
    );

    expect(messages).toEqual([]);
  });

  it("supports custom forbiddenPaths lists", async () => {
    const messages = await lintText(
      `
        import { state } from "@/state/global";
        import { otherState } from "@/services/data";
      `,
      "src/features/auth/ui/LoginForm.tsx",
      {
        "fsd/no-global-store-imports": [
          "error",
          { forbiddenPaths: ["/state/"] },
        ],
      },
    );

    expect(ruleIds(messages)).toEqual(["fsd/no-global-store-imports"]);
  });

  it("skips test files by default", async () => {
    const messages = await lintText(
      'import { state } from "@/app/store/global";',
      "src/features/auth/model/session.test.ts",
      {
        "fsd/no-global-store-imports": "error",
      },
    );

    expect(messages).toEqual([]);
  });
});

describe("FSD 2.x — fs-resolver edge cases", () => {
  it("falls back to legacy parsing when fs cannot resolve the path", async () => {
    const messages = await lintText(
      'import { thing } from "@features/profile/model/service";',
      "src/features/auth/ui/LoginForm.tsx",
      {
        "fsd/no-cross-slice-dependency": "error",
      },
    );

    expect(messageIds(messages)).toEqual(["noFeatureDependency"]);
  });

  it("does not crash when filePath is outside the configured rootPath", async () => {
    const messages = await lintText(
      'import React from "react";',
      "outside/scope/file.ts",
      {
        "fsd/forbidden-imports": "error",
        "fsd/no-cross-slice-dependency": "error",
        "fsd/no-public-api-sidestep": "error",
      },
    );

    expect(messages).toEqual([]);
  });

  it("does not flag relative imports that stay inside a slice", async () => {
    const messages = await lintText(
      'import { session } from "./session";',
      "tests/fixtures/resolve-project/src/features/auth/model/index.ts",
      {
        "fsd/no-cross-slice-dependency": ["error", fixtureRoot],
        "fsd/forbidden-imports": ["error", fixtureRoot],
      },
    );

    expect(messages).toEqual([]);
  });

  it("does not break when an explicit tsconfigPath is missing", async () => {
    const messages = await lintText(
      'import { Button } from "@shared/ui/Button";',
      "src/features/auth/ui/LoginForm.tsx",
      {
        "fsd/forbidden-imports": [
          "error",
          { tsconfigPath: "tests/fixtures/does-not-exist.json" },
        ],
      },
    );

    expect(messages).toEqual([]);
  });
});

describe("FSD 2.x — index file extension matrix for public API", () => {
  it.each([
    ["index.ts", "@features/auth/index.ts"],
    ["index.tsx", "@features/auth/index.tsx"],
    ["index.js", "@features/auth/index.js"],
    ["index.jsx", "@features/auth/index.jsx"],
    ["bare slice", "@features/auth"],
  ])("treats %s as the slice public API", async (_name, importPath) => {
    const messages = await lintText(
      `import { x } from "${importPath}";`,
      "src/pages/articles/ui/articles-page.tsx",
      {
        "fsd/no-public-api-sidestep": [
          "error",
          { publicApi: { allowSegmentImports: false } },
        ],
      },
    );

    expect(messages).toEqual([]);
  });
});

describe("FSD 2.x — allowedToImport overrides", () => {
  it("respects a custom allowedToImport list that loosens defaults", async () => {
    const messages = await lintText(
      'import { LoginForm } from "@features/auth";',
      "src/entities/user/ui/UserCard.tsx",
      {
        "fsd/forbidden-imports": [
          "error",
          {
            layers: {
              entities: {
                allowedToImport: ["features", "shared"],
              },
            },
          },
        ],
      },
    );

    expect(messages).toEqual([]);
  });

  it("respects a custom allowedToImport list that tightens defaults", async () => {
    const messages = await lintText(
      'import { Button } from "@shared/ui/Button";',
      "src/entities/user/model/user.ts",
      {
        "fsd/forbidden-imports": [
          "error",
          {
            layers: {
              entities: {
                allowedToImport: [],
              },
            },
          },
        ],
      },
    );

    expect(ruleIds(messages)).toEqual(["fsd/forbidden-imports"]);
  });
});
