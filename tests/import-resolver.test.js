import { ESLint } from "eslint";
import tsParser from "@typescript-eslint/parser";
import { describe, expect, it } from "vitest";

import fsdPlugin from "../src/index.js";

const fixtureOptions = {
  rootPath: "/tests/fixtures/resolve-project/src/",
};

const explicitTsconfigOptions = {
  ...fixtureOptions,
  tsconfigPath: "tests/fixtures/explicit-tsconfig/tsconfig.json",
};

const articlePageFile =
  "tests/fixtures/resolve-project/src/pages/articles/ui/articles-pending-page.tsx";

const profileFeatureFile =
  "tests/fixtures/resolve-project/src/features/profile/ui/ProfilePage.tsx";

const userEntityFile =
  "tests/fixtures/resolve-project/src/entities/user/model/session.ts";

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

describe("filesystem import resolver", () => {
  it("resolves configured root aliases without tsconfig paths", async () => {
    const messages = await lintText(
      'import { ArticlesLayout } from "@/pages/articles/ui/articles-page";',
      articlePageFile,
      {
        "fsd/forbidden-imports": [
          "error",
          {
            ...fixtureOptions,
            alias: {
              value: "@",
              withSlash: true,
            },
          },
        ],
      },
    );

    expect(messages).toEqual([]);
  });

  it("resolves omitted extensions to concrete TypeScript and TSX files", async () => {
    await expect(
      lintText(
        'import { articleSections } from "@articles/api/queries";',
        articlePageFile,
        {
          "fsd/forbidden-imports": ["error", fixtureOptions],
        },
      ),
    ).resolves.toEqual([]);

    await expect(
      lintText(
        'import { ArticlesLayout } from "@articles/ui/articles-page";',
        articlePageFile,
        {
          "fsd/forbidden-imports": ["error", fixtureOptions],
        },
      ),
    ).resolves.toEqual([]);
  });

  it("resolves directory index files from aliases", async () => {
    await expect(
      lintText(
        'import { ArticlesLayout } from "@multi/articles";',
        articlePageFile,
        {
          "fsd/forbidden-imports": ["error", fixtureOptions],
        },
      ),
    ).resolves.toEqual([]);

    await expect(
      lintText(
        'import { ArticlesLayout } from "@page/articles";',
        articlePageFile,
        {
          "fsd/forbidden-imports": ["error", fixtureOptions],
        },
      ),
    ).resolves.toEqual([]);
  });

  it("falls through multiple tsconfig path targets until an existing file is found", async () => {
    const messages = await lintText(
      'import { ProfilePage } from "@multi/profile/ui/profile-page";',
      articlePageFile,
      {
        "fsd/forbidden-imports": ["error", fixtureOptions],
        "fsd/no-cross-slice-dependency": ["error", fixtureOptions],
      },
    );

    expect(messages.map((message) => message.ruleId)).toEqual([
      "fsd/forbidden-imports",
      "fsd/no-cross-slice-dependency",
    ]);
  });

  it("uses baseUrl resolution when no paths pattern matches", async () => {
    await expect(
      lintText(
        'import { userPublicApi } from "src/entities/user";',
        profileFeatureFile,
        {
          "fsd/forbidden-imports": ["error", fixtureOptions],
          "fsd/no-public-api-sidestep": ["error", fixtureOptions],
        },
      ),
    ).resolves.toEqual([]);
  });

  it("resolves shared segment indexes when shared public API enforcement is enabled", async () => {
    await expect(
      lintText('import { Button } from "@ui-button";', articlePageFile, {
        "fsd/no-public-api-sidestep": [
          "error",
          {
            ...fixtureOptions,
            publicApi: {
              enforceShared: true,
            },
          },
        ],
      }),
    ).resolves.toEqual([]);
  });

  it("allows same-slice imports through tsconfig path aliases", async () => {
    const messages = await lintText(
      `
        import { articleSections } from "@articles/api/queries";
        import { ArticlesLayout } from "@articles/ui/articles-page";
      `,
      articlePageFile,
      {
        "fsd/forbidden-imports": ["error", fixtureOptions],
        "fsd/no-cross-slice-dependency": ["error", fixtureOptions],
        "fsd/no-public-api-sidestep": [
          "error",
          {
            ...fixtureOptions,
            publicApi: {
              enforceForLayers: ["pages"],
            },
          },
        ],
      },
    );

    expect(messages).toEqual([]);
  });

  it("keeps reporting cross-slice imports resolved through tsconfig path aliases", async () => {
    const messages = await lintText(
      'import { ProfilePage } from "@profile/ui/profile-page";',
      articlePageFile,
      {
        "fsd/forbidden-imports": ["error", fixtureOptions],
        "fsd/no-cross-slice-dependency": ["error", fixtureOptions],
      },
    );

    expect(messages.map((message) => message.ruleId)).toEqual([
      "fsd/forbidden-imports",
      "fsd/no-cross-slice-dependency",
    ]);
  });

  it("reports hidden higher-layer imports resolved through tsconfig path aliases", async () => {
    const messages = await lintText(
      'import { authPublicApi } from "@auth";',
      userEntityFile,
      {
        "fsd/forbidden-imports": ["error", fixtureOptions],
      },
    );

    expect(messages.map((message) => message.ruleId)).toEqual([
      "fsd/forbidden-imports",
    ]);
  });

  it("uses resolved files when checking public API sidesteps", async () => {
    await expect(
      lintText('import { authPublicApi } from "@auth";', profileFeatureFile, {
        "fsd/no-public-api-sidestep": ["error", fixtureOptions],
      }),
    ).resolves.toEqual([]);

    await expect(
      lintText(
        'import { authSession } from "@auth/model/session";',
        profileFeatureFile,
        {
          "fsd/no-public-api-sidestep": ["error", fixtureOptions],
        },
      ),
    ).resolves.toHaveLength(1);
  });

  it("uses resolved files when checking cross-slice dependencies", async () => {
    const messages = await lintText(
      'import { authSession } from "@auth/model/session";',
      profileFeatureFile,
      {
        "fsd/no-cross-slice-dependency": ["error", fixtureOptions],
      },
    );

    expect(messages.map((message) => message.messageId)).toEqual([
      "noFeatureDependency",
    ]);
  });

  it("uses resolved layers for ordered imports", async () => {
    const messages = await lintText(
      `
        import { authPublicApi } from "@auth";
        import { ArticlesLayout } from "@articles/ui/articles-page";
      `,
      articlePageFile,
      {
        "fsd/ordered-imports": ["error", fixtureOptions],
      },
    );

    expect(messages.map((message) => message.ruleId)).toEqual([
      "fsd/ordered-imports",
    ]);
  });

  it("supports explicit tsconfigPath when the nearest config does not contain the alias", async () => {
    const messages = await lintText(
      'import { ArticlesLayout } from "@explicit-articles/ui/articles-page";',
      articlePageFile,
      {
        "fsd/forbidden-imports": ["error", explicitTsconfigOptions],
      },
    );

    expect(messages).toEqual([]);
  });

  it("accepts tsconfigPath in rules that share common FSD options", async () => {
    const messages = await lintText(
      'import { articleSections } from "../api/queries";',
      articlePageFile,
      {
        "fsd/no-relative-imports": ["error", explicitTsconfigOptions],
        "fsd/no-ui-in-business-logic": ["error", explicitTsconfigOptions],
      },
    );

    expect(messages).toEqual([]);
  });
});
